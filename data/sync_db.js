const fs = require('fs');
const path = require('path');

const db = JSON.parse(fs.readFileSync(path.join(__dirname, 'db.json'), 'utf8'));
const content = `const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'db.json');

// Authentic initial seed data extracted directly from brochure & mobile UI
const initialData = ${JSON.stringify(db, null, 2)};

class Database {
  constructor() {
    this.init();
  }

  init() {
    if (!fs.existsSync(DB_FILE)) {
      this.save(initialData);
    }
  }

  load() {
    try {
      if (!fs.existsSync(DB_FILE)) {
        this.save(initialData);
      }
      const content = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(content);
    } catch (e) {
      console.error('Error reading db.json, returning initial seed data', e);
      return initialData;
    }
  }

  save(data) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (e) {
      console.error('Error writing to db.json', e);
      return false;
    }
  }

  get(entity) {
    const data = this.load();
    return data[entity] || [];
  }

  set(entity, value) {
    const data = this.load();
    data[entity] = value;
    this.save(data);
    return data[entity];
  }
}

module.exports = new Database();
`;

fs.writeFileSync(path.join(__dirname, 'db.js'), content, 'utf8');
console.log('Synced db.js with db.json successfully!');
