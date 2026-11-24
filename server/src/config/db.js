import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let mongoMemoryServer = null;

export const connectDB = async (customUri = null) => {
  const uri = customUri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rural_education';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected to database: ${conn.connection.host} / ${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.warn(`[MongoDB] Local connection to ${uri} failed: ${err.message}`);
    console.log('[MongoDB] Attempting fallback to in-memory MongoDB server for development/testing...');

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const memUri = mongoMemoryServer.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`[MongoDB] In-memory MongoDB running at: ${memUri}`);
      return conn;
    } catch (memErr) {
      console.error(`[MongoDB] In-memory MongoDB failed to initialize: ${memErr.message}`);
      throw err;
    }
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
    console.log('[MongoDB] Disconnected successfully');
  } catch (err) {
    console.error(`[MongoDB] Error disconnecting: ${err.message}`);
  }
};
