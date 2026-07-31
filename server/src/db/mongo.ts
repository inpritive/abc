import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer | null = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/procraft';
  
  try {
    console.log(`[MongoDB] Attempting connection to ${uri}...`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log('[MongoDB] Successfully connected to external/Docker MongoDB!');
  } catch (err) {
    console.warn('[MongoDB] Could not connect to external/Docker MongoDB. Falling back to mongodb-memory-server for instant out-of-the-box experience...');
    try {
      mongoServer = await MongoMemoryServer.create({
        binary: {
          version: '7.0.3',
        },
      });
    } catch (createErr) {
      console.warn('[MongoDB] Could not start MongoDB 7.0.3 binary, trying default version...');
      mongoServer = await MongoMemoryServer.create();
    }
    const memoryUri = mongoServer.getUri();
    await mongoose.connect(memoryUri, {
      dbName: 'procraft',
    });
    console.log(`[MongoDB] Successfully connected to in-memory MongoDB at ${memoryUri}`);
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
};
