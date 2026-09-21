const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  // If no MONGODB_URI is provided, skip Mongoose connection attempt immediately
  if (!process.env.MONGODB_URI) {
    console.log(`🚀 Operating in High-Performance Embedded JSON Datastore mode (zero-config, persistent).`);
    isConnected = false;
    return false;
  }

  const mongoUri = process.env.MONGODB_URI;

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000,
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected to: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (error) {
    console.warn(`⚠️ MongoDB connection unavailable (${error.message}).`);
    console.log(`🚀 Operating in High-Performance Embedded JSON Datastore mode (zero-config, persistent).`);
    isConnected = false;
    return false;
  }
};

const getIsConnected = () => isConnected;

module.exports = { connectDB, getIsConnected };

