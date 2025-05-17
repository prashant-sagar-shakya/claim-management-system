
import mongoose from 'mongoose';
import { toast } from 'sonner';

// MongoDB connection URI
const MONGODB_URI = import.meta.env.VITE_MONGODB_URI;

// Connection options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true,
};

let isConnected = false;

/**
 * Connect to MongoDB
 */
export const connectToDatabase = async () => {
  if (isConnected) {
    console.log('MongoDB is already connected');
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    
    isConnected = true;
    console.log('MongoDB connected successfully');
    toast.success('Connected to the database');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    toast.error('Failed to connect to the database');
  }
};

/**
 * Disconnect from MongoDB
 */
export const disconnectFromDatabase = async () => {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log('MongoDB disconnected successfully');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
  }
};

export { mongoose };
