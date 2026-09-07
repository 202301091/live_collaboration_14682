import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { connectDB } from './src/config/db.js';
import { socketAuthMiddleware } from './src/middleware/authMiddleware.js';
import socketHandler from './src/sockets/socketHandler.js';
const PORT = process.env.PORT || 5000;
// Create HTTP server
const server = http.createServer(app);
// Initialize Socket.IO with CORS settings
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all client connections
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000, // Handle client reconnects gracefully
  pingInterval: 2500
});
// Attach Authentication Middleware to Sockets
io.use(socketAuthMiddleware);
// Initialize Socket event handlers
socketHandler(io);
// Connect to Database and start listening
async function startServer() {
  console.log('Initializing LiveSpace collaborative server...');
  await connectDB();
  
  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`WebSocket server mapped & listening`);
  });
}
startServer().catch((err) => {
  console.error('Failed to start the LiveSpace server:', err);
  process.exit(1);
});
