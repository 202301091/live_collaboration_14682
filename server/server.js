import 'dotenv/config';
import cluster from 'node:cluster';
import http from 'http';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';

import app from './app.js';
import { connectDB } from './src/config/db.js';
import { socketAuthMiddleware } from './src/middleware/authMiddleware.js';
import socketHandler from './src/sockets/socketHandler.js';

const PORT = process.env.PORT || 5000;
const WORKERS = 2; // Spawns 2 isolated server processes

if (cluster.isPrimary) {
  console.log(`[Master PID ${process.pid}] Launching ${WORKERS} collaborative server instances...`);

  for (let i = 0; i < WORKERS; i++) {
    cluster.fork();
  }

  // Auto-restart any worker if it crashes
  cluster.on('exit', (worker) => {
    console.warn(`[Worker PID ${worker.process.pid}] stopped unexpectedly. Restarting...`);
    cluster.fork();
  });
} else {
  // Worker process execution
  const workerPid = process.pid;

  // Track request worker identity in response headers
  app.use((req, res, next) => {
    res.setHeader('X-Served-By-Worker', workerPid);
    res.setHeader('X-Served-By-Port', PORT);
    console.log(`[REQ] ${req.method} ${req.url} -> Handled by Worker PID ${workerPid}`);
    next();
  });

  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: '*', // Allow connections from your Vercel deployment
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // Force direct WebSocket transport (avoids sticky session errors)
    transports: ['websocket'],
    pingTimeout: 60000,
    pingInterval: 2500,
  });

  io.use(socketAuthMiddleware);
  socketHandler(io);

  async function startWorker() {
    console.log(`[Worker PID ${workerPid}] Initializing database and Redis bus...`);
    await connectDB();

    const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
    const isTls = redisUrl.startsWith('rediss://');

    const redisOptions = {
      url: redisUrl,
      RESP: 2, // Ensures compatibility with all Redis versions
      socket: isTls
        ? {
            tls: true,
            rejectUnauthorized: false,
          }
        : undefined,
    };

    const pubClient = createClient(redisOptions);
    const subClient = pubClient.duplicate();

    pubClient.on('error', (err) => console.error(`[Worker ${workerPid}] [Redis Pub Error]`, err));
    subClient.on('error', (err) => console.error(`[Worker ${workerPid}] [Redis Sub Error]`, err));

    await Promise.all([pubClient.connect(), subClient.connect()]);
    console.log(`[Worker PID ${workerPid}] Connected to Redis Pub/Sub successfully`);

    // Bridge Socket.IO across all worker processes using Redis
    io.adapter(createAdapter(pubClient, subClient));

    server.listen(PORT, () => {
      console.log(`[Worker PID ${workerPid}] LiveSpace server listening on port ${PORT}`);
    });
  }

  startWorker().catch((err) => {
    console.error(`[Worker PID ${workerPid}] Startup failure:`, err);
    process.exit(1);
  });
}