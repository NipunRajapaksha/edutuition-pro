const bcrypt = require('bcryptjs');
const storage = require('../services/storage');

async function seedDatabase() {
  console.log('🌱 Initializing Tuition Management Database with Admin Account...');
  storage.clearAll();

  // 1. Settings
  storage.updateSettings({
    instituteName: 'Tuition Class Management Academy (ශිල්ප කලා උසස් අධ්‍යාපන ආයතනය)',
    currency: 'Rs.',
    phone: '+94 77 123 4567',
    email: 'nipunanjana10@gmail.com',
    address: 'High Level Road, Colombo / Nugegoda, Sri Lanka',
    minAttendanceAlertPercent: 75,
    plan: 'standard',
    isPremium: false,
    maxTeachers: 10,
    maxStudents: 500,
    maxParents: 500,
    enableAiAssistant: false
  });

  // 2. Master Institute Owner & Super Admin Account
  const adminPassword = await bcrypt.hash('admin123', 10);
  storage.users.create({
    name: 'Nipun Anjana (Institute Owner & Super Admin)',
    email: 'nipunanjana10@gmail.com',
    password: adminPassword,
    role: 'teacher',
    isAdmin: true,
    phone: '+94 77 123 4567',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    subjects: 'Institute Administration & Management',
    bio: 'Primary Institute Administrator & Owner'
  });

  // Backup admin alias
  storage.users.create({
    name: 'Institute Admin (ප්‍රධාන පරිපාලක)',
    email: 'admin@tuition.lk',
    password: adminPassword,
    role: 'teacher',
    isAdmin: true,
    phone: '+94 77 123 4567'
  });

  console.log('✅ Initialization complete!');
  console.log('👑 Master Admin Login: nipunanjana10@gmail.com / admin123');
}

if (require.main === module) {
  seedDatabase().then(() => process.exit(0)).catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
  });
}

module.exports = seedDatabase;

