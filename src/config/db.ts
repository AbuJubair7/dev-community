import { InternalServerErrorException } from '@nestjs/common';
import mongoose from 'mongoose';
import 'dotenv/config';

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGO_URI as string;
  if (!uri) {
    throw new InternalServerErrorException(
      'MONGO_URI is not defined in environment variables',
    );
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');
};
