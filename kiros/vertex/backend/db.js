import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, 'vertex.db');

let db = {
  files: []
};

export function initDb() {
  if (existsSync(DB_PATH)) {
    try {
      const data = readFileSync(DB_PATH, 'utf8');
      db = JSON.parse(data);
    } catch (error) {
      console.log('Database corrupted, starting fresh');
      db = { files: [] };
    }
  }
}

export function saveDb() {
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

export function addFile(fileData) {
  db.files.push(fileData);
  saveDb();
}

export function getFile(id) {
  return db.files.find(f => f.id === id);
}

export function getAllFiles() {
  return db.files;
}

export function incrementDownloads(id) {
  const file = db.files.find(f => f.id === id);
  if (file) {
    file.downloads = (file.downloads || 0) + 1;
    saveDb();
  }
}
