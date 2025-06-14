import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';

import tenantRoutes from './routes/tenantRoutes';
import managerRoutes from './routes/managerRoutes';
import propertyRoutes from './routes/propertyRoutes';
import leaseRoutes from './routes/leaseRoutes';
import applicationRoutes from './routes/applicationRoutes';
import paymentRoutes from './routes/paymentRoutes';
import notificationRouter from './routes/notificationRoutes';
import { authMiddleware } from './middleware/authMiddleware';

// Create Express app
const app = express();

// Environment & Configuration
const PORT = process.env.PORT ? Number(process.env.PORT) : 3002;
const ALLOWED_ORIGINS = [
  'https://app.mileshomerealestate.com',
  'http://localhost:3000', // for local development
];

// ─── MIDDLEWARE ──────────────────────────────────────────────────────────────

// Secure HTTP headers
app.use(helmet());
app.use(
  helmet.crossOriginResourcePolicy({ policy: 'cross-origin' })
);

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error(`CORS policy: Origin ${origin} not allowed`), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Body parsers
app.use(express.json());
app.use(
  bodyParser.urlencoded({ extended: false })
);

// HTTP request logging
app.use(morgan('combined'));

// ─── HEALTHCHECK & PUBLIC ROUTES ─────────────────────────────────────────────

app.get('/', (_req: Request, res: Response) => {
  res.status(200).send('🏠 Real Estate API: Home route');
});

// ─── API ROUTES ───────────────────────────────────────────────────────────────

app.use('/applications', applicationRoutes);
app.use('/notifications/email', notificationRouter);
app.use('/properties', propertyRoutes);
app.use('/leases', leaseRoutes);
app.use('/payments', paymentRoutes);
app.use('/tenants', tenantRoutes);
app.use(
  '/managers',
  authMiddleware(['manager']),
  managerRoutes
);

// ─── ERROR HANDLING ───────────────────────────────────────────────────────────

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found.' });
});

// Global error handler
app.use((
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('🔥 Server error:', err);
  res.status(500).json({ message: err.message || 'Internal server error.' });
});

// ─── START SERVER ────────────────────────────────────────────────────────────

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
});
