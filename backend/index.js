import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import passport from 'passport';

import authRoutes from './routes/auth.js';
import fileRoutes from './routes/files.js';
import analyticsRoutes from './routes/analytics.js';
import googleRoutes from './routes/googleRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import './config/passport.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Performance Middleware
app.set('trust proxy', 1);
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:5173'],
  credentials: true,
}));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(passport.initialize());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', googleRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', time: new Date() }));

// 404
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use(errorHandler);

// Database connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/excel-analytics';

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error('❌ Server start error:', err);
    process.exit(1);
  }
})();
