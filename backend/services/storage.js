const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = process.env.VERCEL ? '/tmp/data' : path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const SEED_FILE = path.join(__dirname, '../data/db.json');

// In-memory cache
let dataCache = null;

const defaultStructure = {
  users: [],
  students: [],
  classes: [],
  attendance: [],
  fees: [],
  homework: [],
  homeworkSubmissions: [],
  exams: [],
  marks: [],
  studyMaterials: [],
  announcements: [],
  notifications: [],
  calendarEvents: [],
  settings: {
    instituteName: 'Apex Tuition Academy (ශිල්ප කලා අධ්‍යාපන ආයතනය)',
    currency: 'Rs.',
    phone: '+94 77 123 4567',
    email: 'info@apextuition.lk',
    address: '142 High Level Road, Nugegoda, Sri Lanka',
    minAttendanceAlertPercent: 75,
    enableAiAssistant: true,
  }
};

function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) return true;
  fs.mkdirSync(dirname, { recursive: true });
}

function loadDatabase() {
  if (dataCache) return dataCache;

  ensureDirectoryExistence(DB_FILE);
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      dataCache = JSON.parse(raw);
      return dataCache;
    } catch (err) {
      console.error('Error reading db.json, falling back to default:', err);
    }
  }

  // If on Vercel and DB_FILE in /tmp doesn't exist yet, seed from bundled file
  if (process.env.VERCEL && fs.existsSync(SEED_FILE)) {
    try {
      const raw = fs.readFileSync(SEED_FILE, 'utf-8');
      dataCache = JSON.parse(raw);
      saveDatabase();
      return dataCache;
    } catch (err) {
      console.error('Error reading seed file on Vercel:', err);
    }
  }

  dataCache = JSON.parse(JSON.stringify(defaultStructure));
  saveDatabase();
  return dataCache;
}

function saveDatabase() {
  try {
    ensureDirectoryExistence(DB_FILE);
    fs.writeFileSync(DB_FILE, JSON.stringify(dataCache, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving db.json:', err);
  }
}

class Collection {
  constructor(name) {
    this.name = name;
  }

  _getItems() {
    const db = loadDatabase();
    if (!db[this.name]) {
      db[this.name] = [];
    }
    return db[this.name];
  }

  find(filter = {}) {
    const items = this._getItems();
    return items.filter(item => {
      for (const [key, val] of Object.entries(filter)) {
        if (item[key] !== val) return false;
      }
      return true;
    });
  }

  findOne(filter = {}) {
    const items = this._getItems();
    for (const item of items) {
      let match = true;
      for (const [key, val] of Object.entries(filter)) {
        if (typeof val === 'string' && typeof item[key] === 'string') {
          if (item[key].toLowerCase().trim() !== val.toLowerCase().trim()) {
            match = false;
            break;
          }
        } else if (item[key] !== val) {
          match = false;
          break;
        }
      }
      if (match) return item;
    }
    return null;
  }

  findById(id) {
    const items = this._getItems();
    return items.find(item => item._id === id || item.id === id) || null;
  }

  create(doc) {
    const items = this._getItems();
    const newDoc = {
      _id: doc._id || uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...doc,
    };
    items.push(newDoc);
    saveDatabase();
    return newDoc;
  }

  findByIdAndUpdate(id, updates) {
    const items = this._getItems();
    const index = items.findIndex(item => item._id === id || item.id === id);
    if (index === -1) return null;

    items[index] = {
      ...items[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveDatabase();
    return items[index];
  }

  findByIdAndDelete(id) {
    const items = this._getItems();
    const index = items.findIndex(item => item._id === id || item.id === id);
    if (index === -1) return null;
    const removed = items.splice(index, 1)[0];
    saveDatabase();
    return removed;
  }

  countDocuments(filter = {}) {
    return this.find(filter).length;
  }

  insertMany(docs) {
    const items = this._getItems();
    const created = docs.map(doc => ({
      _id: doc._id || uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...doc,
    }));
    items.push(...created);
    saveDatabase();
    return created;
  }

  deleteMany(filter = {}) {
    const db = loadDatabase();
    const items = db[this.name] || [];
    const remaining = items.filter(item => {
      for (const [key, val] of Object.entries(filter)) {
        if (item[key] === val) return false;
      }
      return true;
    });
    db[this.name] = remaining;
    saveDatabase();
    return { deletedCount: items.length - remaining.length };
  }
}

const storage = {
  users: new Collection('users'),
  students: new Collection('students'),
  classes: new Collection('classes'),
  attendance: new Collection('attendance'),
  fees: new Collection('fees'),
  homework: new Collection('homework'),
  homeworkSubmissions: new Collection('homeworkSubmissions'),
  exams: new Collection('exams'),
  marks: new Collection('marks'),
  studyMaterials: new Collection('studyMaterials'),
  announcements: new Collection('announcements'),
  notifications: new Collection('notifications'),
  calendarEvents: new Collection('calendarEvents'),
  
  getSettings() {
    const db = loadDatabase();
    return db.settings || defaultStructure.settings;
  },

  updateSettings(newSettings) {
    const db = loadDatabase();
    db.settings = { ...db.settings, ...newSettings, updatedAt: new Date().toISOString() };
    saveDatabase();
    return db.settings;
  },

  clearAll() {
    dataCache = JSON.parse(JSON.stringify(defaultStructure));
    saveDatabase();
  },

  reload() {
    dataCache = null;
    return loadDatabase();
  }
};

module.exports = storage;
