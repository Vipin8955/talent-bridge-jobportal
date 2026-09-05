const mongoose = require('mongoose');
const dns = require('dns');

// Configure reliable DNS servers to resolve MongoDB Atlas SRV records on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  // Ignore if unable to set custom DNS
}

let mongoMemoryServerInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jobportal';

  try {
    // Attempt connection to configured MONGODB_URI
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`[Database] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.warn(`[Database] Could not connect to MongoDB URI (${uri}): ${err.message}`);
    
    // In local development or testing, spin up MongoMemoryServer fallback
    if (process.env.NODE_ENV !== 'production' || process.env.USE_MEMORY_DB === 'true') {
      try {
        console.log('[Database] Initializing MongoMemoryServer for development...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongoMemoryServerInstance = await MongoMemoryServer.create({
          binary: {
            version: '5.0.19',
          },
        });
        const memoryUri = mongoMemoryServerInstance.getUri();

        const conn = await mongoose.connect(memoryUri);
        console.log(`[Database] In-memory MongoDB connected successfully at: ${memoryUri}`);
        return conn;
      } catch (memErr) {
        console.error('[Database] Failed to initialize MongoMemoryServer:', memErr.message);
        throw memErr;
      }
    } else {
      console.error('[Database] Fatal: Unable to connect to MongoDB in production environment.');
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServerInstance) {
      await mongoMemoryServerInstance.stop();
    }
    console.log('[Database] MongoDB connection closed.');
  } catch (err) {
    console.error('[Database] Error closing MongoDB connection:', err.message);
  }
};

module.exports = { connectDB, disconnectDB };
