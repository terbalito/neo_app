// db.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemin du fichier JSON
const dbPath = path.join(__dirname, 'posts.json');

// Vérifie si le fichier existe, sinon crée-le vide
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify([]));
}

// Fonction pour récupérer les posts (limit optionnel)
export async function recupererPosts(limit = 100) {
  const data = fs.readFileSync(dbPath, 'utf-8');
  const posts = JSON.parse(data);
  // On renvoie les plus récents en premier
  return posts.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, limit);
}

// Fonction pour insérer un post
export async function insererPost(contenu) {
  const data = fs.readFileSync(dbPath, 'utf-8');
  const posts = JSON.parse(data);

  const newPost = {
    id: posts.length + 1,
    contenu,
    date: new Date().toISOString()
  };

  posts.push(newPost);
  fs.writeFileSync(dbPath, JSON.stringify(posts, null, 2));
  return newPost;
}
