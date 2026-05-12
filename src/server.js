import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

// Create HTTP server wrapping Express app
const server = http.createServer(app);

import { chatHandler, socketAuth } from './sockets/chatHandler.js';

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*', 
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});

// Use authentication middleware
io.use(socketAuth);

// Apply chat handler
io.on('connection', (socket) => {
  chatHandler(io, socket);
});

// Make io instance available to routes/controllers if needed via app.set
app.set('socketio', io);

// Start listening
server.listen(PORT, () => {
  console.log(`Lumina server is running on port ${PORT}`);
});
