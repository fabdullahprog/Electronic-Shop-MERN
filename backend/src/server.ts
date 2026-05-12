import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });


import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests, please try again later.',
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api', limiter);

// Routes
app.use('/api/auth', require('./routes/authRoutes').default);
app.use('/api/products', require('./routes/productRoutes').default);
app.use('/api/categories', require('./routes/categoryRoutes').default);
app.use('/api/orders', require('./routes/orderRoutes').default);
app.use('/api/users', require('./routes/userRoutes').default);
app.use('/api/reviews', require('./routes/reviewRoutes').default);
app.use('/api/upload', require('./routes/uploadRoutes').default);
app.use('/api/discount', require('./routes/discountRoutes').default);
app.use('/api/dashboard', require('./routes/dashboardRoutes').default);
app.use('/api/wishlist', require('./routes/wishlistRoutes').default);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Electronic_db API is running', timestamp: new Date() });
});

// Error handler
app.use(require('./middleware/errorMiddleware').default);

// Connect MongoDB & Start Server
const PORT = parseInt(process.env.PORT || '5000', 10);
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/Electronic_db';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((err: Error) => {
    console.error('MongoDB Error:', err.message);
    process.exit(1);
  });

export default app;
