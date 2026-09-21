require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const storage = require('./services/storage');
const seedDatabase = require('./seed/seedData');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for Expo web and mobile clients
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Database initialization helper (handles both traditional and serverless cold-starts)
let dbReady = false;
let dbInitPromise = null;

const initDb = async () => {
  if (dbReady) return;
  if (!dbInitPromise) {
    dbInitPromise = (async () => {
      await connectDB();
      const userCount = storage.users.find().length;
      if (userCount === 0) {
        console.log('⚡ Empty datastore detected. Running initial institute seed...');
        await seedDatabase();
      }
      dbReady = true;
    })();
  }
  return dbInitPromise;
};

// Ensure database is ready before processing any API requests
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api')) {
    try {
      await initDb();
    } catch (err) {
      console.error('Error during database init middleware:', err);
    }
  }
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Tuition Class Management Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/classes', require('./routes/classRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/fees', require('./routes/feeRoutes'));
app.use('/api/homework', require('./routes/homeworkRoutes'));
app.use('/api/exams', require('./routes/examRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/materials', require('./routes/materialRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/calendar', require('./routes/calendarRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));

// Serve frontend static build if available
const path = require('path');
const fs = require('fs');
const frontendDistPath = path.join(__dirname, '../frontend/dist');

if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  
  // SPA fallback for all non-API GET routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// Error handler
app.use(errorHandler);

// Start server (skip app.listen if imported as a module or running inside Vercel serverless environment)
if (require.main === module && !process.env.VERCEL) {
  const startServer = async () => {
    await initDb();
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 Tuition Management API Server running on port ${PORT}`);
      console.log(`🔗 Health: http://localhost:${PORT}/api/health`);
      console.log(`====================================================`);
    });
  };

  startServer();
}

module.exports = app;
