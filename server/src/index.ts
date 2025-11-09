import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Import routes
import authRoutes from './routes/authRoutes';
import recordingRoutes from './routes/recordingRoutes';
import settingsRoutes from './routes/settingsRoutes';
import emailRoutes from './routes/emailRoutes';

// Import middleware
import errorHandler from './middleware/errorHandler';

// Initialize express
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/recordings', recordingRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/email', emailRoutes);

// Basic route for testing
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Echo API is running' });
});

// Error handler middleware
app.use(errorHandler);

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI as string);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});
