const storage = require('../services/storage');
const { getIsConnected, getDbStatus, connectDB } = require('../config/db');

// Get current institute settings
const getSettings = async (req, res, next) => {
  try {
    // Proactively attempt connection if not connected yet but MONGODB_URI exists
    if (!getIsConnected() && process.env.MONGODB_URI) {
      const connected = await connectDB();
      if (connected && storage.syncFromCloud) {
        await storage.syncFromCloud();
      }
    }

    const settings = storage.getSettings();
    const dbStatus = getDbStatus();
    res.json({
      success: true,
      data: {
        ...settings,
        isCloudConnected: dbStatus.isConnected,
        dbStatus
      }
    });
  } catch (err) {
    next(err);
  }
};

// Reconnect/Test database connection
const reconnectDb = async (req, res, next) => {
  try {
    const { mongodbUri } = req.body || {};
    if (mongodbUri && typeof mongodbUri === 'string' && mongodbUri.trim()) {
      storage.updateSettings({ mongodbUri: mongodbUri.trim() });
    }
    const connected = await connectDB(mongodbUri);
    if (connected && storage.syncFromCloud) {
      await storage.syncFromCloud();
    }
    const dbStatus = getDbStatus();
    res.json({
      success: dbStatus.isConnected,
      message: dbStatus.isConnected
        ? '✅ Successfully connected to MongoDB Atlas Cloud!'
        : `Connection failed: ${dbStatus.lastError || 'Unknown error'}`,
      data: {
        isCloudConnected: dbStatus.isConnected,
        dbStatus
      }
    });
  } catch (err) {
    next(err);
  }
};

// Update institute settings (Teacher/Admin only)
const updateSettings = async (req, res, next) => {
  try {
    const {
      instituteName,
      principalName,
      phone,
      email,
      address,
      currency,
      minAttendanceAlertPercent,
      receiptFooterNote,
      enableAiAssistant,
      plan,
      isPremium,
      maxTeachers,
      maxStudents,
      maxParents,
      licenseKey
    } = req.body;

    const updated = storage.updateSettings({
      instituteName: instituteName?.trim() || undefined,
      principalName: principalName?.trim() || undefined,
      phone: phone?.trim() || undefined,
      email: email?.trim() || undefined,
      address: address?.trim() || undefined,
      currency: currency?.trim() || undefined,
      minAttendanceAlertPercent: minAttendanceAlertPercent !== undefined ? Number(minAttendanceAlertPercent) : undefined,
      receiptFooterNote: receiptFooterNote?.trim() || undefined,
      enableAiAssistant: enableAiAssistant !== undefined ? Boolean(enableAiAssistant) : undefined,
      plan: plan || undefined,
      isPremium: isPremium !== undefined ? Boolean(isPremium) : undefined,
      maxTeachers: maxTeachers !== undefined ? Number(maxTeachers) : undefined,
      maxStudents: maxStudents !== undefined ? Number(maxStudents) : undefined,
      maxParents: maxParents !== undefined ? Number(maxParents) : undefined,
      licenseKey: licenseKey?.trim() || undefined
    });

    res.json({
      success: true,
      message: 'Institute settings updated successfully',
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

const activateLicense = async (req, res, next) => {
  try {
    const { licenseKey } = req.body;
    const cleanKey = (licenseKey || '').trim().toUpperCase();
    const validKeys = ['PREMIUM-2026', 'EDU-PREMIUM-AI', 'PRO-ENTERPRISE-KEY', 'NIPUN-VIP-2026', 'PREMIUM'];

    if (!cleanKey || (!validKeys.includes(cleanKey) && !cleanKey.startsWith('PRO-'))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid License Key. Please enter a valid Premium Enterprise License code (e.g. PREMIUM-2026).'
      });
    }

    const updated = storage.updateSettings({
      plan: 'premium',
      isPremium: true,
      enableAiAssistant: true,
      licenseKey: cleanKey,
      maxTeachers: 1000,
      maxStudents: 10000,
      maxParents: 10000
    });

    res.json({
      success: true,
      message: '🎉 Premium Enterprise License Activated! Unlimited accounts and AI Assistant unlocked.',
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSettings, updateSettings, activateLicense, reconnectDb };
