/**
 * Servidor Backend Node.js con Express para Blog Personal Minimalista.
 * Base de datos local en archivo JSON ('data/posts.json').
 *
 * Para iniciar:
 *   node server.js
 */

import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');

const ACTIVE_SESSIONS = new Set();
const ADMIN_TOKEN_SECRET = 'atelier-admin-session-token-2026';

const DEFAULT_POSTS = [
  {
    id: 'post-1',
    title: 'El elogio de la lentitud y el minimalismo en el software',
    slug: 'el-elogio-de-la-lentitud-y-el-minimalismo-en-el-software',
    excerpt: 'En un mundo obsesionado con la velocidad y las métricas superficiales, crear herramientas sobrias y calmadas es una forma de resistencia.',
    content: `# El elogio de la lentitud y el minimalismo en el software\n\nVivimos rodeados de interfaces ruidosas. Cada aplicación parece competir por la milésima de segundo de nuestra atención con insignias rojas, animaciones innecesarias y notificaciones artificiales.\n\n## ¿Qué significa realmente simplificar?\n\nSimplificar no es eliminar características al azar ni conformarse con interfaces vacías. Es un proceso riguroso de destilación:\n\n> "La perfección se alcanza, no cuando no hay nada más que añadir, sino cuando ya no queda nada que quitar."\n> — *Antoine de Saint-Exupéry*\n\n1. **Claridad sobre adorno:** Cada elemento visual debe cumplir una función.\n2. **Respeto por la atención:** No forzar modales intrusivos.\n3. **Longevidad y ligereza:** Código directo y dependencias razonables.`,
    author: 'Alejandro Silva',
    date: '2026-10-24',
    status: 'published',
    tags: ['Filosofía', 'Minimalismo', 'Diseño'],
    views: 142,
    readingTime: 4,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'post-2',
    title: 'Por qué aún escribo en un blog personal en la era de los algoritmos',
    slug: 'por-que-aun-escribo-en-un-blog-personal',
    excerpt: 'Tener una pequeña parcela propia en la web abierta nos devuelve el control, la privacidad y el placer genuino de la escritura sin filtros algorítmicos.',
    content: `# Por qué aún escribo en un blog personal en la era de los algoritmos\n\nHubo una época en la que la web se sentía como una red de pequeños cafés y librerías de barrio: cada persona tenía su propio sitio, su diseño artesanal y su feed RSS.\n\nAl mantener este blog independiente escribo sin prisas, en formato libre y con tipografía cuidada.`,
    author: 'Alejandro Silva',
    date: '2026-10-18',
    status: 'published',
    tags: ['Web Abierta', 'Reflexiones', 'Escritura'],
    views: 289,
    readingTime: 3,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'post-3',
    title: 'Tipografía editorial para la pantalla: ritmo y espacio blanco',
    slug: 'tipografia-editorial-para-la-pantalla',
    excerpt: 'Una exploración técnica y visual sobre el interlineado, la escala de fuentes y el espacio negativo para una experiencia de lectura fluida.',
    content: `# Tipografía editorial para la pantalla: ritmo y espacio blanco\n\nLa tipografía no es simplemente la elección de una fuente bonita; es la arquitectura invisible de la comprensión lectora.\n\nUna línea de texto óptima debe contener entre **55 y 75 caracteres**. Si es más ancha, el ojo se fatiga al saltar al renglón siguiente.`,
    author: 'Alejandro Silva',
    date: '2026-10-10',
    status: 'published',
    tags: ['Diseño', 'Tipografía', 'CSS'],
    views: 95,
    readingTime: 3,
    updatedAt: new Date().toISOString(),
  }
];

async function initDatabase() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(POSTS_FILE);
  } catch {
    await fs.writeFile(POSTS_FILE, JSON.stringify(DEFAULT_POSTS, null, 2), 'utf8');
  }
}

async function readPosts() {
  try {
    const raw = await fs.readFile(POSTS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return DEFAULT_POSTS;
  }
}

async function writePosts(posts) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2), 'utf8');
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function calculateReadingTime(text) {
  const words = (text || '').trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado. Se requiere token.' });
  }
  const token = authHeader.split(' ')[1];
  if (token === ADMIN_TOKEN_SECRET || ACTIVE_SESSIONS.has(token)) {
    return next();
  }
  return res.status(403).json({ error: 'Sesión no válida o expirada.' });
}

app.use(express.json());

// API Pública
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await readPosts();
    const { q, tag } = req.query;
    let filtered = posts.filter(p => p.status === 'published');

    if (tag) {
      filtered = filtered.filter(p => p.tags.some(t => t.toLowerCase() === tag.toLowerCase()));
    }
    if (q) {
      const query = q.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.excerpt.toLowerCase().includes(query) ||
        p.tags.some(t => t.toLowerCase().includes(query))
      );
    }

    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    res.json(filtered.map(({ content, ...rest }) => rest));
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener publicaciones' });
  }
});

app.get('/api/posts/:slugOrId', async (req, res) => {
  try {
    const posts = await readPosts();
    const post = posts.find(p => p.slug === req.params.slugOrId || p.id === req.params.slugOrId);
    if (!post) return res.status(404).json({ error: 'Publicación no encontrada' });

    if (post.status === 'published') {
      post.views = (post.views || 0) + 1;
      await writePosts(posts);
    }
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener publicación' });
  }
});

app.get('/api/tags', async (_req, res) => {
  try {
    const posts = await readPosts();
    const tagMap = {};
    posts.filter(p => p.status === 'published').forEach(p => {
      p.tags.forEach(t => {
        tagMap[t] = (tagMap[t] || 0) + 1;
      });
    });
    res.json(tagMap);
  } catch {
    res.json({});
  }
});

// Autenticación (Credenciales fijas requeridas: admin / admin)
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin') {
    const token = `token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    ACTIVE_SESSIONS.add(token);
    res.json({
      success: true,
      token,
      user: { username: 'admin', name: 'Alejandro Silva (Admin)', role: 'Administrator' }
    });
  } else {
    res.status(401).json({ success: false, error: 'Credenciales inválidas. Usa admin / admin' });
  }
});

app.get('/api/auth/check', requireAdminAuth, (_req, res) => {
  res.json({ valid: true });
});

app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    ACTIVE_SESSIONS.delete(authHeader.split(' ')[1]);
  }
  res.json({ success: true });
});

// API Protegida de Administración
app.get('/api/admin/posts', requireAdminAuth, async (_req, res) => {
  const posts = await readPosts();
  posts.sort((a, b) => new Date(b.updatedAt || b.date).getTime() - new Date(a.updatedAt || a.date).getTime());
  res.json(posts);
});

app.get('/api/admin/stats', requireAdminAuth, async (_req, res) => {
  const posts = await readPosts();
  res.json({
    totalPosts: posts.length,
    publishedCount: posts.filter(p => p.status === 'published').length,
    draftCount: posts.filter(p => p.status === 'draft').length,
    totalViews: posts.reduce((acc, p) => acc + (p.views || 0), 0),
  });
});

app.post('/api/admin/posts', requireAdminAuth, async (req, res) => {
  const { title, excerpt, content, tags, status, author, date } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Título y contenido son obligatorios' });
  }
  const posts = await readPosts();
  const id = `post-${Date.now()}`;
  const slug = slugify(title) || id;

  const newPost = {
    id,
    title: title.trim(),
    slug,
    excerpt: excerpt ? excerpt.trim() : content.substring(0, 160) + '...',
    content,
    author: author || 'Alejandro Silva',
    date: date || new Date().toISOString().split('T')[0],
    status: status === 'draft' ? 'draft' : 'published',
    tags: Array.isArray(tags) ? tags : ['General'],
    views: 0,
    readingTime: calculateReadingTime(content),
    updatedAt: new Date().toISOString(),
  };

  posts.unshift(newPost);
  await writePosts(posts);
  res.status(201).json(newPost);
});

app.put('/api/admin/posts/:id', requireAdminAuth, async (req, res) => {
  const posts = await readPosts();
  const index = posts.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Publicación no encontrada' });

  const current = posts[index];
  const updated = {
    ...current,
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  posts[index] = updated;
  await writePosts(posts);
  res.json(updated);
});

app.delete('/api/admin/posts/:id', requireAdminAuth, async (req, res) => {
  const posts = await readPosts();
  const filtered = posts.filter(p => p.id !== req.params.id);
  await writePosts(filtered);
  res.json({ success: true });
});

// Servir frontend compilado si existe
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

initDatabase().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor activo en http://localhost:${PORT}`);
    console.log(`Credenciales Admin: admin / admin`);
  });
});
