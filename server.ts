import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const DATA_DIR = path.join(__dirname, 'data');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');

// Memory token cache for admin authentication
const ADMIN_TOKEN_SECRET = 'atelier-admin-session-token-2026';
const ACTIVE_SESSIONS = new Set<string>();

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  status: 'published' | 'draft';
  tags: string[];
  views: number;
  readingTime: number;
  updatedAt: string;
}

// Initial seed posts if file doesn't exist
const DEFAULT_POSTS: Post[] = [
  {
    id: 'post-1',
    title: 'El elogio de la lentitud y el minimalismo en el software',
    slug: 'el-elogio-de-la-lentitud-y-el-minimalismo-en-el-software',
    excerpt: 'En un mundo obsesionado con la velocidad y las métricas superficiales, crear herramientas sobrias y calmadas es una forma de resistencia.',
    content: `# El elogio de la lentitud y el minimalismo en el software

Vivimos rodeados de interfaces ruidosas. Cada aplicación parece competir por la milésima de segundo de nuestra atención con insignias rojas, animaciones innecesarias y notificaciones artificiales.

El software solía ser una extensión serena del pensamiento humano: un lienzo en blanco, una terminal limpia, un cuaderno de notas sin interrupciones.

## ¿Qué significa realmente simplificar?

Simplificar no es eliminar características al azar ni conformarse con interfaces vacías. Es un proceso riguroso de destilación:

> "La perfección se alcanza, no cuando no hay nada más que añadir, sino cuando ya no queda nada que quitar."
> — *Antoine de Saint-Exupéry*

Cuando construimos software minimalista, nos comprometemos con tres principios fundamentales:

1. **Claridad sobre adorno:** Cada elemento visual debe cumplir una función o aportar valor cognitivo real.
2. **Respeto por la atención:** No forzar modales intrusivos ni crear urgencias artificiales.
3. **Longevidad y ligereza:** Código directo, dependencias razonables y respeto por el hardware del usuario.

## La belleza de las cosas hechas para durar

Un buen ensayo, al igual que un buen sistema, debe sentirse sólido diez años después de haber sido concebido. Al reducir la sobrecarga técnica y estilística, damos paso a lo que verdaderamente importa: **las ideas y las palabras**.`,
    author: 'Alejandro Silva',
    date: '2026-10-24',
    status: 'published',
    tags: ['Filosofía', 'Minimalismo', 'Diseño'],
    views: 142,
    readingTime: 4,
    updatedAt: '2026-10-24T12:00:00Z',
  },
  {
    id: 'post-2',
    title: 'Por qué aún escribo en un blog personal en la era de los algoritmos',
    slug: 'por-que-aun-escribo-en-un-blog-personal',
    excerpt: 'Tener una pequeña parcela propia en la web abierta nos devuelve el control, la privacidad y el placer genuino de la escritura sin filtros algorítmicos.',
    content: `# Por qué aún escribo en un blog personal en la era de los algoritmos

Hubo una época en la que la web se sentía como una red de pequeños cafés y librerías de barrio: cada persona tenía su propio sitio, su diseño artesanal y su feed RSS.

Hoy, la mayor parte de la conversación digital ocurre en recintos cerrados donde el algoritmo premia el conflicto y la inmediatez efímera.

## La ilusión del alcance

En las redes sociales, no somos los propietarios de nuestra audiencia ni de nuestro contenido. Un cambio en una fórmula matemática puede invisibilizar años de reflexiones.

Al mantener este blog independiente:

- **Escribo sin prisas:** Puedo publicar un artículo al mes o uno al año, sin la presión de alimentar un algoritmo voraz.
- **Formato libre:** No estoy restringido a 280 caracteres ni a vídeos verticales de 15 segundos.
- **Tipografía y atmósfera propias:** El lector entra en un espacio diseñado específicamente para la lectura sosegada.

## El renacimiento de la web artesanal

Veo con alegría cómo cada vez más desarrolladores, escritores y diseñadores vuelven a levantar sus propios servidores y blogs minimalistas. No se trata de nostalgia; se trata de soberanía digital.`,
    author: 'Alejandro Silva',
    date: '2026-10-18',
    status: 'published',
    tags: ['Web Abierta', 'Reflexiones', 'Escritura'],
    views: 289,
    readingTime: 3,
    updatedAt: '2026-10-18T09:30:00Z',
  },
  {
    id: 'post-3',
    title: 'Tipografía editorial para la pantalla: ritmo y espacio blanco',
    slug: 'tipografia-editorial-para-la-pantalla',
    excerpt: 'Una exploración técnica y visual sobre el interlineado, la escala de fuentes y el espacio negativo para una experiencia de lectura fluida.',
    content: `# Tipografía editorial para la pantalla: ritmo y espacio blanco

La tipografía no es simplemente la elección de una fuente bonita; es la arquitectura invisible de la comprensión lectora.

Cuando leemos en pantallas de alta densidad, nuestros ojos realizan microfijaciones continuas. Si la longitud de línea es excesiva o el espaciado vertical es inconsistente, la fatiga visual aparece en pocos minutos.

## La regla de oro de la medida de línea

Una línea de texto óptima debe contener entre **55 y 75 caracteres** (incluyendo espacios). Si es más ancha, el ojo se pierde al saltar al renglón siguiente; si es demasiado estrecha, el ritmo se vuelve entrecortado.

\`\`\`css
/* Ejemplo de limitación de ancho para lectura óptima */
.article-body {
  max-width: 68ch;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.8;
}
\`\`\`

## El valor del espacio blanco

El espacio en blanco no es espacio desperdiciado; es el aire que permite respirar a la prosa. Un titular con suficiente margen superior establece una pausa natural antes de comenzar una nueva idea.

Cuidar estos detalles transforma una simple página web en una experiencia editorial íntima.`,
    author: 'Alejandro Silva',
    date: '2026-10-10',
    status: 'published',
    tags: ['Diseño', 'Tipografía', 'CSS'],
    views: 95,
    readingTime: 3,
    updatedAt: '2026-10-10T14:15:00Z',
  },
  {
    id: 'post-4',
    title: 'Arquitectura sencilla: menos dependencias, más longevidad',
    slug: 'arquitectura-sencilla-menos-dependencias-mas-longevidad',
    excerpt: 'Cómo la combinación de Node.js, almacenamiento local estructurado y estándares web produce sistemas que funcionan sin mantenimiento durante años.',
    content: `# Arquitectura sencilla: menos dependencias, más longevidad

En el desarrollo web moderno caemos frecuentemente en la trampa de la sobreingeniería: configuraciones complejas de microservicios, bases de datos distribuidas y decenas de capas de abstracción para proyectos que nunca lo necesitarán.

Para un blog personal o un sitio editorial, la simplicidad radical es una ventaja competitiva.

## Por qué un archivo JSON o SQLite es suficiente

Para miles de publicaciones, una base de datos local en archivo JSON o SQLite ofrece:

- **Cero latencia de red:** La lectura y escritura son operaciones locales directas.
- **Copias de seguridad triviales:** Basta con copiar un archivo para respaldar toda la información.
- **Portabilidad absoluta:** Puedes mover el proyecto a cualquier servidor en cuestión de segundos.

\`\`\`javascript
// Lectura directa y limpia sin sobrecarga
const posts = JSON.parse(await fs.readFile('data/posts.json', 'utf8'));
\`\`\`

La mejor tecnología no es la más sofisticada, sino la que resuelve el problema de forma elegante y se mantiene funcionando en silencio.`,
    author: 'Alejandro Silva',
    date: '2026-09-28',
    status: 'published',
    tags: ['Desarrollo', 'Node.js', 'Arquitectura'],
    views: 312,
    readingTime: 4,
    updatedAt: '2026-09-28T16:00:00Z',
  },
  {
    id: 'post-5',
    title: 'Borrador: Próximos experimentos con interfaces de tinta electrónica',
    slug: 'borrador-proximos-experimentos-tinta-electronica',
    excerpt: 'Ideas preliminares sobre el diseño de sitios optimizados específicamente para lectores de e-ink y pantallas reflectivas.',
    content: `# Borrador: Próximos experimentos con interfaces de tinta electrónica

Las pantallas de tinta electrónica representan un paradigma fascinante: cero emisión de luz azul, legibilidad perfecta bajo la luz directa del sol y semanas de autonomía energética.

Sin embargo, el diseño web tradicional suele verse terrible en estos dispositivos debido a las animaciones y los gradientes suaves.

## Hipótesis de trabajo

1. Modos de contraste puro (1-bit / 4 niveles de gris).
2. Supresión total de transiciones CSS dinámicas.
3. Tipografías serif de trazo robusto para evitar artefactos de renderizado.

*(Artículo actualmente en desarrollo en el panel de administración)*`,
    author: 'Alejandro Silva',
    date: '2026-10-25',
    status: 'draft',
    tags: ['Experimental', 'Hardware', 'Diseño'],
    views: 8,
    readingTime: 2,
    updatedAt: '2026-10-25T11:00:00Z',
  }
];

// Helper: Ensure data storage directory and posts file exist
async function initDatabase(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(POSTS_FILE);
    } catch {
      // File doesn't exist, create with default posts
      await fs.writeFile(POSTS_FILE, JSON.stringify(DEFAULT_POSTS, null, 2), 'utf8');
      console.log('Database initialized with default sample posts.');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Helper: Read posts from file
async function readPosts(): Promise<Post[]> {
  try {
    const raw = await fs.readFile(POSTS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading posts file, fallback to memory default:', err);
    return DEFAULT_POSTS;
  }
}

// Helper: Write posts to file
async function writePosts(posts: Post[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2), 'utf8');
}

// Helper: Calculate reading time in minutes
function calculateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

// Helper: Generate URL slug
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// Middleware: Body parser
app.use(express.json());

// Auth middleware for admin endpoints
function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No autorizado. Se requiere token de administrador.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  if (token === ADMIN_TOKEN_SECRET || ACTIVE_SESSIONS.has(token)) {
    next();
  } else {
    res.status(403).json({ error: 'Sesión no válida o expirada.' });
  }
}

// ==========================================
// PUBLIC API ROUTES
// ==========================================

// GET /api/posts - Get list of published posts with search & tag filters
app.get('/api/posts', async (req: Request, res: Response) => {
  try {
    const posts = await readPosts();
    const { q, tag } = req.query;

    let filtered = posts.filter(p => p.status === 'published');

    if (tag && typeof tag === 'string') {
      const cleanTag = tag.toLowerCase();
      filtered = filtered.filter(p => p.tags.some(t => t.toLowerCase() === cleanTag));
    }

    if (q && typeof q === 'string') {
      const query = q.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.excerpt.toLowerCase().includes(query) ||
        p.content.toLowerCase().includes(query) ||
        p.tags.some(t => t.toLowerCase().includes(query))
      );
    }

    // Sort by date descending
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Send without full markdown content to reduce payload on list view
    const list = filtered.map(({ content, ...rest }) => rest);
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las publicaciones' });
  }
});

// GET /api/posts/:slugOrId - Get a single post and increment view count
app.get('/api/posts/:slugOrId', async (req: Request, res: Response) => {
  try {
    const { slugOrId } = req.params;
    const posts = await readPosts();
    const post = posts.find(p => p.slug === slugOrId || p.id === slugOrId);

    if (!post) {
      res.status(404).json({ error: 'Publicación no encontrada' });
      return;
    }

    // Increment views if published
    if (post.status === 'published') {
      post.views = (post.views || 0) + 1;
      await writePosts(posts);
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la publicación' });
  }
});

// GET /api/tags - Get all unique tags and their counts
app.get('/api/tags', async (_req: Request, res: Response) => {
  try {
    const posts = await readPosts();
    const published = posts.filter(p => p.status === 'published');
    const tagMap: Record<string, number> = {};

    published.forEach(p => {
      p.tags.forEach(t => {
        tagMap[t] = (tagMap[t] || 0) + 1;
      });
    });

    res.json(tagMap);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener etiquetas' });
  }
});

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// POST /api/auth/login - Admin login (admin/admin)
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (username === 'admin' && password === 'admin') {
    const sessionToken = `token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    ACTIVE_SESSIONS.add(sessionToken);

    res.json({
      success: true,
      token: sessionToken,
      user: {
        username: 'admin',
        name: 'Alejandro Silva (Admin)',
        role: 'Administrator',
      },
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Credenciales inválidas. Usa el usuario "admin" y contraseña "admin".',
    });
  }
});

// GET /api/auth/check - Verify if current token is valid
app.get('/api/auth/check', requireAdminAuth, (_req: Request, res: Response) => {
  res.json({ valid: true, user: { username: 'admin', role: 'admin' } });
});

// POST /api/auth/logout - Admin logout
app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    ACTIVE_SESSIONS.delete(token);
  }
  res.json({ success: true, message: 'Sesión cerrada correctamente' });
});

// ==========================================
// PROTECTED ADMIN API ROUTES
// ==========================================

// GET /api/admin/posts - Get all posts including drafts
app.get('/api/admin/posts', requireAdminAuth, async (_req: Request, res: Response) => {
  try {
    const posts = await readPosts();
    // Sort descending by updated date
    posts.sort((a, b) => new Date(b.updatedAt || b.date).getTime() - new Date(a.updatedAt || a.date).getTime());
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener publicaciones para administración' });
  }
});

// GET /api/admin/stats - Overview metrics
app.get('/api/admin/stats', requireAdminAuth, async (_req: Request, res: Response) => {
  try {
    const posts = await readPosts();
    const totalPosts = posts.length;
    const publishedCount = posts.filter(p => p.status === 'published').length;
    const draftCount = posts.filter(p => p.status === 'draft').length;
    const totalViews = posts.reduce((acc, p) => acc + (p.views || 0), 0);

    const allTags = new Set<string>();
    posts.forEach(p => p.tags.forEach(t => allTags.add(t)));

    res.json({
      totalPosts,
      publishedCount,
      draftCount,
      totalViews,
      totalTags: allTags.size,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al calcular estadísticas' });
  }
});

// POST /api/admin/posts - Create a new post
app.post('/api/admin/posts', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { title, excerpt, content, tags, status, author, date } = req.body;

    if (!title || !content) {
      res.status(400).json({ error: 'El título y el contenido son obligatorios' });
      return;
    }

    const posts = await readPosts();
    const id = `post-${Date.now()}`;
    const baseSlug = slugify(title) || `post-${Date.now()}`;
    
    // Ensure slug uniqueness
    let slug = baseSlug;
    let counter = 1;
    while (posts.some(p => p.slug === slug)) {
      slug = `${baseSlug}-${counter++}`;
    }

    const calculatedExcerpt = excerpt && excerpt.trim().length > 0 
      ? excerpt.trim() 
      : content.replace(/[#*`>_-]/g, '').trim().substring(0, 160) + '...';

    const cleanTags = Array.isArray(tags) 
      ? tags.map(t => String(t).trim()).filter(Boolean)
      : typeof tags === 'string'
      ? tags.split(',').map(t => t.trim()).filter(Boolean)
      : ['General'];

    const newPost: Post = {
      id,
      title: title.trim(),
      slug,
      excerpt: calculatedExcerpt,
      content,
      author: author?.trim() || 'Alejandro Silva',
      date: date || new Date().toISOString().split('T')[0],
      status: status === 'draft' ? 'draft' : 'published',
      tags: cleanTags.length > 0 ? cleanTags : ['General'],
      views: 0,
      readingTime: calculateReadingTime(content),
      updatedAt: new Date().toISOString(),
    };

    posts.unshift(newPost);
    await writePosts(posts);

    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Error al crear la publicación' });
  }
});

// PUT /api/admin/posts/:id - Update an existing post
app.put('/api/admin/posts/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, excerpt, content, tags, status, author, date, slug: customSlug } = req.body;

    const posts = await readPosts();
    const postIndex = posts.findIndex(p => p.id === id);

    if (postIndex === -1) {
      res.status(404).json({ error: 'Publicación no encontrada' });
      return;
    }

    const current = posts[postIndex];

    const cleanTags = Array.isArray(tags) 
      ? tags.map(t => String(t).trim()).filter(Boolean)
      : typeof tags === 'string'
      ? tags.split(',').map(t => t.trim()).filter(Boolean)
      : current.tags;

    let updatedSlug = current.slug;
    if (customSlug && customSlug.trim() !== '') {
      updatedSlug = slugify(customSlug);
    } else if (title && title !== current.title) {
      updatedSlug = slugify(title);
    }

    // Ensure slug uniqueness (exclude current post)
    let finalSlug = updatedSlug;
    let counter = 1;
    while (posts.some(p => p.slug === finalSlug && p.id !== id)) {
      finalSlug = `${updatedSlug}-${counter++}`;
    }

    const updatedPost: Post = {
      ...current,
      title: title !== undefined ? title.trim() : current.title,
      slug: finalSlug,
      excerpt: excerpt !== undefined ? excerpt.trim() : current.excerpt,
      content: content !== undefined ? content : current.content,
      author: author !== undefined ? author.trim() : current.author,
      date: date || current.date,
      status: status !== undefined ? (status === 'draft' ? 'draft' : 'published') : current.status,
      tags: cleanTags,
      readingTime: content !== undefined ? calculateReadingTime(content) : current.readingTime,
      updatedAt: new Date().toISOString(),
    };

    posts[postIndex] = updatedPost;
    await writePosts(posts);

    res.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Error al actualizar la publicación' });
  }
});

// DELETE /api/admin/posts/:id - Delete a post
app.delete('/api/admin/posts/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const posts = await readPosts();
    const filtered = posts.filter(p => p.id !== id);

    if (filtered.length === posts.length) {
      res.status(404).json({ error: 'Publicación no encontrada' });
      return;
    }

    await writePosts(filtered);
    res.json({ success: true, message: 'Publicación eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la publicación' });
  }
});

// POST /api/admin/reset - Reset posts to initial seed demo data
app.post('/api/admin/reset', requireAdminAuth, async (_req: Request, res: Response) => {
  try {
    await writePosts(DEFAULT_POSTS);
    res.json({ success: true, message: 'Base de datos restaurada con datos de demostración.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al restaurar los datos' });
  }
});

// GET /api/info - System and instruction helper endpoint
app.get('/api/info', (_req: Request, res: Response) => {
  res.json({
    name: 'Atelier Minimalist Blog API',
    version: '1.0.0',
    authDefaults: {
      user: 'admin',
      pass: 'admin',
    },
    storage: 'JSON File (data/posts.json)',
  });
});

// ==========================================
// VITE DEV SERVER / STATIC ASSETS
// ==========================================
async function startServer() {
  await initDatabase();

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Mount Vite dev server in middleware mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    // In production, serve dist folder
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n======================================================`);
    console.log(` Atelier - Blog Minimalista activo en http://0.0.0.0:${PORT}`);
    console.log(` Credenciales de Administrador: admin / admin`);
    console.log(` Almacenamiento local: ${POSTS_FILE}`);
    console.log(`======================================================\n`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
