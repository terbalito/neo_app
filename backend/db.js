// db.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === Chemin du fichier JSON ===
const dbPath = path.join(__dirname, 'posts.json');

// Crée le fichier s’il n’existe pas
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify([]));
}

// Petit verrou pour éviter les écritures simultanées
let lock = false;

// Attente active pour débloquer le verrou
async function attendreUnlock() {
  while (lock) {
    await new Promise(res => setTimeout(res, 50));
  }
}

// === Récupérer les posts ===
export async function recupererPosts(limit = 100) {
  const data = fs.readFileSync(dbPath, 'utf-8');
  const posts = JSON.parse(data);
  return posts.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, limit);
}

// === Insérer un nouveau post ===
export async function insererPost(contenu) {
  await attendreUnlock();
  lock = true;
  try {
    const data = fs.readFileSync(dbPath, 'utf-8');
    const posts = JSON.parse(data);

    const newPost = {
      id: posts.length ? posts[posts.length - 1].id + 1 : 1,
      contenu,
      date: new Date().toISOString()
    };

    posts.push(newPost);
    fs.writeFileSync(dbPath, JSON.stringify(posts, null, 2));

    return newPost;
  } finally {
    lock = false;
  }
}
