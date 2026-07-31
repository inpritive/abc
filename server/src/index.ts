import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { connectDB } from './db/mongo';
import User from './models/User';
import { seedData } from './db/seed';
import { initSocket } from './socket/socket';
import { errorHandler } from './middleware/error';

import authRoutes from './routes/auth.routes';
import productRoutes from './routes/products.routes';
import orderRoutes from './routes/orders.routes';
import analyticsRoutes from './routes/analytics.routes';
import expenseRoutes from './routes/expenses.routes';

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

// Initialize Socket.IO
initSocket(httpServer);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/expenses', expenseRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    service: 'ProCraft Hardware & Paint Shop API',
  });
});

// Serve frontend static build in production deployment
const possibleDistPaths = [
  path.resolve(__dirname, '../../client/dist'),
  path.resolve(__dirname, '../../../client/dist'),
  path.resolve(process.cwd(), 'client/dist'),
  path.resolve(process.cwd(), '../client/dist'),
];

const clientDistPath = possibleDistPaths.find((p) => fs.existsSync(p));

if (clientDistPath) {
  console.log(`[Deployment] Serving React frontend from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Centralized error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  // Auto-seed demo database if empty so demo login works out-of-the-box!
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Server] Empty database detected. Auto-seeding demo users, products, orders, and expenses...');
      await seedData();
      console.log('[Server] Auto-seeding complete! Demo Login is ready.');
    }
  } catch (seedErr) {
    console.error('[Server] Could not auto-seed database:', seedErr);
  }

  httpServer.listen(PORT, () => {
    console.log(`[Server] ProCraft Backend running on port ${PORT}`);
  });
};

startServer().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
});

export default app;
