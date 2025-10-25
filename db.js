// db.js
import mariadb from 'mariadb';
import dotenv from 'dotenv';

dotenv.config();

// Création du pool de connexions
const pool = mariadb.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'neo_app',
  connectionLimit: 5
});

// Fonction utilitaire pour tester la connexion
export async function testerConnexion() {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log('✅ Connexion à MariaDB réussie');
  } catch (err) {
    console.error('❌ Erreur de connexion à MariaDB :', err.message);
  } finally {
    if (conn) conn.end();
  }
}

// Insérer un post
export async function insererPost(contenu) {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query('INSERT INTO posts (contenu, date_creation) VALUES (?, NOW())', [contenu]);
  } catch (err) {
    console.error('❌ Erreur lors de l’insertion :', err.message);
    throw err;
  } finally {
    if (conn) conn.end();
  }
}

// Récupérer les posts récents
export async function recupererPosts(limit = 50) {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM posts ORDER BY date_creation DESC LIMIT ?', [limit]);
    return rows;
  } catch (err) {
    console.error('❌ Erreur récupération posts :', err.message);
    throw err;
  } finally {
    if (conn) conn.end();
  }
}
// Test de connexion
testerConnexion();
