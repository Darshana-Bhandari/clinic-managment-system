import app from './app.js';
import { ENV } from './config/env.js';
import prisma from './config/database.js';
import { createServer } from 'http';
import { initializeSocket } from './config/socket.js';

await prisma.$connect();

const server = createServer(app);
initializeSocket(server);

server.listen(ENV.PORT, () => {
  console.log(`Server is running on port ${ENV.PORT}`);
  console.log(`WebSocket is running on localhost:${ENV.PORT}`);
});