import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';

import { sequelize } from './config/database';
import apiRoutes from './routes';
import { setupSockets } from './sockets/chat';
import { errorHandler } from './middlewares/errorHandler';

const app = express();
app.enable('trust proxy');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:4200', 'https://saas-startupsaas.vercel.app', 'https://startupsaas-iota.vercel.app'],
    credentials: true
  }
});

const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors({
  origin: ['http://localhost:4200', 'https://saas-startupsaas.vercel.app', 'https://startupsaas-iota.vercel.app'],
  credentials: true
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// Root Routes Map (supporting both /api and legacy root calls if any exist, but standardized to /api)
app.use('/api', apiRoutes);
app.use('/', apiRoutes); // fallback for direct /payment/init without /api/

// Setup Chat
setupSockets(io);

// Error Handling Middleware
app.use(errorHandler);

// Database Sync & Startup
sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ PostgreSQL Database Schema Synced (Strict TS Mode)');
    
    server.listen(PORT, () => {
      console.log('\n🚀 StartupSAAS Payment, Chat & PostgreSQL Server Started (TypeScript)');
      console.log('──────────────────────────────────────────');
      console.log(`   Port    : http://localhost:${PORT}`);
      console.log('──────────────────────────────────────────\n');
      console.log('💬 Chat & Database Services Ready');
    });
  })
  .catch(err => {
    console.error('Database Sync Error:', err);
    process.exit(1);
  });
