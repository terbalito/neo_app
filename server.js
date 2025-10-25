// server.js
import express from 'express';
import path from 'path';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { recupererPosts, insererPost } from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const limiter = rateLimit({
  windowMs: 60_000,
  max: 30
});
app.use(limiter);

// Moteur de vues
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Routes
app.get('/', async (req, res) => {
  try {
    const posts = await recupererPosts(100);
    res.render('index', { posts });
  } catch (err) {
    console.error('Erreur récupération posts', err);
    res.status(500).send('Erreur serveur');
  }
});

app.post('/poster', async (req, res) => {
  const { contenu } = req.body || {};
  if (!contenu || typeof contenu !== 'string' || contenu.trim().length === 0) {
    return res.status(400).send('Contenu vide');
  }

  if (contenu.length > 2000) {
    return res.status(400).send('Contenu trop long');
  }

  try {
    await insererPost(contenu);
    res.redirect('/');
  } catch (err) {
    console.error('Erreur insertion post', err);
    res.status(500).send('Erreur serveur');
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});
