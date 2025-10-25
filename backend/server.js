import express from 'express';
import path from 'path';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import cors from 'cors'; // <-- ajouter

import { recupererPosts, insererPost } from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// === Middlewares ===
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Autoriser CORS pour le front en local
app.use(cors({
  origin: 'https://neo-app-1.onrender.com', // en prod
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 60_000,
  max: 30
});
app.use(limiter);

// === Moteur de vues ===
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// === Routes ===
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await recupererPosts(100);
    res.json(posts);
  } catch (err) {
    console.error('Erreur API récupération posts', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/posts', async (req, res) => {
  try {
    const { contenu } = req.body;
    if (!contenu || !contenu.trim()) return res.status(400).json({ error: 'Contenu vide' });

    const newPost = await insererPost(contenu);
    res.status(201).json(newPost);
  } catch (err) {
    console.error('Erreur API insertion post', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => console.log(`✅ Backend démarré sur http://localhost:${PORT}`));
