import mongoose from 'mongoose';
import 'dotenv/config';

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGO_URI as string;
  if (!uri) {
    throw new Error('MONGO_URI is not defined in environment variables');
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');
};
