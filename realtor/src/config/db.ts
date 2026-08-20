import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async (uri?: string): Promise<typeof mongoose> => {
  const mongoUri = uri || process.env.MONGO_URI || 'mongodb://localhost:27017/realtor';
  try {
    const conn = await mongoose.connect(mongoUri);
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
  } catch (error) {
    console.error('MongoDB disconnection error:', error);
    throw error;
  }
};
