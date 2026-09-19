import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';

import app from './app.js';
import { connectDB } from './src/config/db.js';
import { socketAuthMiddleware } from './src/middleware/authMiddleware.js';
import socketHandler from './src/sockets/socketHandler.js';

const PORT = process.env.PORT || 5000;

// Track request port identity
app.use((req, res, next) => {
  res.setHeader('X-Served-By-Port', PORT);
  console.log(`[REQ] ${req.method} ${req.url} -> Handled by instance on port ${PORT}`);
  next();
});

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO with CORS settings
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all client connections
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000, // Handle client reconnects gracefully
  pingInterval: 2500,
});

// Attach Authentication Middleware to Sockets
io.use(socketAuthMiddleware);

// Initialize Socket event handlers
socketHandler(io);

// Connect to Database, Redis, and start listening
async function startServer() {
  console.log(`[Port ${PORT}] Initializing LiveSpace collaborative server...`);

  // 1. Database connection
  await connectDB();

  // 2. Setup Redis Pub/Sub Clients for native Windows Redis (port 6379)
  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
  const pubClient = createClient({ 
  url: redisUrl,
  RESP: 2 
});
  const subClient = pubClient.duplicate();

  pubClient.on('error', (err) => console.error(`[Port ${PORT}] [Redis Pub Error]`, err));
  subClient.on('error', (err) => console.error(`[Port ${PORT}] [Redis Sub Error]`, err));

  await Promise.all([pubClient.connect(), subClient.connect()]);
  console.log(`[Port ${PORT}] Connected to Redis Pub/Sub successfully`);

  // 3. Mount Redis Adapter to Socket.io
  io.adapter(createAdapter(pubClient, subClient));

  // 4. Start HTTP & WebSocket Server
  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`WebSocket server mapped & listening`);
  });
}

startServer().catch((err) => {
  console.error(`[Port ${PORT}] Failed to start the LiveSpace server:`, err);
  process.exit(1);
});