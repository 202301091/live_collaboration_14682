import mongoose from 'mongoose';
let isConnected = false;
export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  
  if (!process.env.MONGODB_URI) {
    console.log('⚠️ MONGODB_URI not defined in environment. Attempting connection to local MongoDB: mongodb://localhost:27017/LiveSpace');
  }
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log('Connected to MongoDB successfully.');
    return true;
  } catch (err) {
    console.warn(`MongoDB connection failed: ${err.message}`);
    console.warn('Server will operate using dynamic local fallback state, but some persistences might be memory-only.');
    isConnected = false;
    return false;
  }
}
export function getIsConnected() {
  return isConnected;
}
