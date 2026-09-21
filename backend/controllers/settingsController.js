const storage = require('../services/storage');

// Get current institute settings
const getSettings = async (req, res, next) => {
  try {
    const settings = storage.getSettings();
    res.json({
      success: true,
      data: settings
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
      enableAiAssistant
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
      enableAiAssistant: enableAiAssistant !== undefined ? Boolean(enableAiAssistant) : undefined
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

module.exports = { getSettings, updateSettings };
