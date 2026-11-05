const mongoose = require('mongoose');

let isConnected = false;
let lastError = null;
let connectionAttempted = false;

const maskUri = (uri) => {
  if (!uri) return '';
  try {
    return uri.replace(/:([^:@]+)@/, ':****@');
  } catch {
    return 'mongodb+srv://...';
  }
};

const connectDB = async (customUri) => {
  connectionAttempted = true;
  if (mongoose.connection.readyState === 1 && !customUri) {
    isConnected = true;
    lastError = null;
    return true;
  }

  let rawUri = customUri;
  if (!rawUri || !rawUri.trim()) {
    try {
      const storage = require('../services/storage');
      const settings = storage.getSettings();
      if (settings && settings.mongodbUri) {
        rawUri = settings.mongodbUri;
      }
    } catch {}
  }
  if (!rawUri || !rawUri.trim()) {
    rawUri = process.env.MONGODB_URI;
  }

  if (!rawUri || !rawUri.trim()) {
    isConnected = false;
    lastError = 'MONGODB_URI environment variable not found in current deployment.';
    return false;
  }

  const mongoUri = rawUri.trim();

  try {
    if (mongoose.connection.readyState !== 0 && customUri) {
      await mongoose.disconnect();
    }
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000
    });
    isConnected = true;
    lastError = null;
    console.log(`✅ MongoDB Connected to: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (error) {
    lastError = error.message;
    isConnected = false;
    console.warn(`⚠️ MongoDB connection unavailable (${error.message}).`);
    return false;
  }
};

const getIsConnected = () => {
  return mongoose.connection.readyState === 1 || isConnected;
};

const getDbStatus = () => {
  const ready = mongoose.connection.readyState === 1;
  let rawUri = process.env.MONGODB_URI;
  if (!rawUri) {
    try {
      const storage = require('../services/storage');
      const settings = storage.getSettings();
      if (settings && settings.mongodbUri) rawUri = settings.mongodbUri;
    } catch {}
  }
  return {
    isConnected: ready || isConnected,
    hasMongoUri: !!(rawUri && rawUri.trim()),
    maskedUri: maskUri(rawUri),
    readyState: mongoose.connection.readyState,
    lastError: lastError,
    attempted: connectionAttempted
  };
};

module.exports = { connectDB, getIsConnected, getDbStatus };

