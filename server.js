// server.js

// === 1️⃣ Importation des modules nécessaires ===
import express from 'express';
import path from 'path';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { recupererPosts, insererPost } from './db.js'; // ton module base de données

// === 2️⃣ Configuration de base ===
dotenv.config();

// Ces deux lignes servent à simuler __dirname (car on est en ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === 3️⃣ Initialisation de l’application ===
const app = express();
const PORT = process.env.PORT || 3000;

// === 4️⃣ Middlewares ===
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Limiter les requêtes pour éviter le spam abusif
const limiter = rateLimit({
  windowMs: 60_000, // 1 minute
  max: 30 // max 30 requêtes par IP par minute
});
app.use(limiter);

// === 5️⃣ Configuration du moteur de vue ===
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// === 6️⃣ Routes ===

// Route racine : affichage + form
app.get('/', async (req, res) => {
  try {
    const posts = await recupererPosts(100);
    res.render('index', { posts });
  } catch (err) {
    console.error('Erreur récupération posts', err);
    res.status(500).send('Erreur serveur');
  }
});

// POST pour créer un post anonyme
app.post('/poster', async (req, res) => {
  const { contenu } = req.body || {};
  if (!contenu || typeof contenu !== 'string' || contenu.trim().length === 0) {
    return res.status(400).send('Contenu vide');
  }

  // Limiter la taille côté serveur
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

// Health check (utile pour test)
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// === 7️⃣ Lancement du serveur ===
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});
