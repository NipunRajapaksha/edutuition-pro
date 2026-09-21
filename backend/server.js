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

// Ensure database is ready before processing any request
app.use(async (req, res, next) => {
  try {
    await initDb();
  } catch (err) {
    console.error('Error during database init middleware:', err);
  }
  next();
});

// API Router
const apiRouter = express.Router();

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Tuition Class Management Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

apiRouter.use('/auth', require('./routes/authRoutes'));
apiRouter.use('/students', require('./routes/studentRoutes'));
apiRouter.use('/classes', require('./routes/classRoutes'));
apiRouter.use('/attendance', require('./routes/attendanceRoutes'));
apiRouter.use('/fees', require('./routes/feeRoutes'));
apiRouter.use('/homework', require('./routes/homeworkRoutes'));
apiRouter.use('/exams', require('./routes/examRoutes'));
apiRouter.use('/analytics', require('./routes/analyticsRoutes'));
apiRouter.use('/materials', require('./routes/materialRoutes'));
apiRouter.use('/announcements', require('./routes/announcementRoutes'));
apiRouter.use('/notifications', require('./routes/notificationRoutes'));
apiRouter.use('/calendar', require('./routes/calendarRoutes'));
apiRouter.use('/ai', require('./routes/aiRoutes'));
apiRouter.use('/reports', require('./routes/reportRoutes'));
apiRouter.use('/settings', require('./routes/settingsRoutes'));

// Mount API routes on both /api and root /
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Serve frontend static build if available
const path = require('path');
const fs = require('fs');
const rootDistPath = path.join(__dirname, '../dist');
const frontendDistPath = fs.existsSync(rootDistPath) ? rootDistPath : path.join(__dirname, '../frontend/dist');

if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  
  // SPA fallback for all non-API GET routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/auth') || req.path.startsWith('/students')) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}
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
