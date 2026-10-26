import { Post, AdminStats, LoginResponse, AuthUser } from '../types';
import { getSupabaseClient, getSupabaseConfig } from './supabase';

const TOKEN_KEY = 'atelier_admin_token';
const USER_KEY = 'atelier_admin_user';
const BOOKMARKS_KEY = 'atelier_bookmarks';

// Fallback in-memory posts if both Supabase and backend are unavailable
const MEMORY_FALLBACK_POSTS: Post[] = [
  {
    id: 'supa-post-1',
    title: 'El elogio de la lentitud y el minimalismo en el software',
    slug: 'el-elogio-de-la-lentitud-y-el-minimalismo-en-el-software',
    excerpt: 'En un mundo obsesionado con la velocidad y las métricas superficiales, crear herramientas sobrias y calmadas es una forma de resistencia.',
    content: `# El elogio de la lentitud y el minimalismo en el software\n\nVivimos rodeados de interfaces ruidosas. Cada aplicación parece competir por la milésima de segundo de nuestra atención con insignias rojas, animaciones innecesarias y notificaciones artificiales.\n\n## ¿Qué significa realmente simplificar?\n\nSimplificar no es eliminar características al azar ni conformarse con interfaces vacías. Es un proceso riguroso de destilación:\n\n> "La perfección se alcanza, no cuando no hay nada más que añadir, sino cuando ya no queda nada que quitar."\n> — *Antoine de Saint-Exupéry*\n\n1. **Claridad sobre adorno:** Cada elemento visual debe cumplir una función o aportar valor cognitivo real.\n2. **Respeto por la atención:** No forzar modales intrusivos ni crear urgencias artificiales.\n3. **Longevidad y ligereza:** Código directo, dependencias razonables y respeto por el hardware del usuario.`,
    author: 'Alejandro Silva',
    date: '2026-10-24',
    status: 'published',
    tags: ['Filosofía', 'Minimalismo', 'Diseño'],
    views: 142,
    readingTime: 4,
    updatedAt: '2026-10-24T12:00:00Z',
  },
  {
    id: 'supa-post-2',
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
    updatedAt: '2026-10-18T09:30:00Z',
  },
  {
    id: 'supa-post-3',
    title: 'Tipografía editorial para la pantalla: ritmo y espacio blanco',
    slug: 'tipografia-editorial-para-la-pantalla',
    excerpt: 'Una exploración técnica y visual sobre el interlineado, la escala de fuentes y el espacio negativo para una experiencia de lectura fluida.',
    content: `# Tipografía editorial para la pantalla: ritmo y espacio blanco\n\nLa tipografía no es simplemente la elección de una fuente bonita; es la arquitectura invisible de la comprensión lectora.\n\nUna línea de texto óptima debe contener entre **55 y 75 caracteres**. Si es más ancha, el ojo se pierde al saltar al renglón siguiente.`,
    author: 'Alejandro Silva',
    date: '2026-10-10',
    status: 'published',
    tags: ['Diseño', 'Tipografía', 'CSS'],
    views: 95,
    readingTime: 3,
    updatedAt: '2026-10-10T14:15:00Z',
  }
];

// Auth Helpers
export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredAuth(token: string, user: AuthUser): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (err) {
    console.error('Error saving auth to localStorage', err);
  }
}

export function clearStoredAuth(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (err) {
    console.error('Error removing auth from localStorage', err);
  }
}

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getStoredBookmarks(): string[] {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleBookmark(postId: string): boolean {
  try {
    const current = getStoredBookmarks();
    const exists = current.includes(postId);
    const updated = exists ? current.filter(id => id !== postId) : [...current, postId];
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
    return !exists;
  } catch {
    return false;
  }
}

function calculateReadingTime(text: string): number {
  const words = (text || '').trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// Convert Supabase row format to Post interface
function mapRowToPost(row: any): Post {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt || '',
    content: row.content || '',
    author: row.author || 'Alejandro Silva',
    date: row.date || new Date().toISOString().split('T')[0],
    status: row.status || 'published',
    tags: Array.isArray(row.tags) ? row.tags : [],
    views: Number(row.views || 0),
    readingTime: Number(row.reading_time || calculateReadingTime(row.content || '')),
    updatedAt: row.updated_at || row.created_at,
  };
}

// ==========================================
// PUBLIC POSTS API
// ==========================================

export async function fetchPublishedPosts(tag?: string, query?: string): Promise<Post[]> {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      let req = supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .order('date', { ascending: false });

      if (tag) {
        req = req.contains('tags', [tag]);
      }

      const { data, error } = await req;
      if (error) throw error;

      let list = (data || []).map(mapRowToPost);

      if (query && query.trim()) {
        const q = query.toLowerCase();
        list = list.filter(p =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.tags.some(t => t.toLowerCase().includes(q))
        );
      }

      return list;
    } catch (err) {
      console.warn('Supabase fetch error, fallback to REST API / cache:', err);
    }
  }

  // Fallback to Express backend
  try {
    const params = new URLSearchParams();
    if (tag) params.append('tag', tag);
    if (query) params.append('q', query);
    const res = await fetch(`/api/posts${params.toString() ? `?${params.toString()}` : ''}`);
    if (res.ok) {
      return await res.json();
    }
  } catch {}

  // Fallback memory
  return MEMORY_FALLBACK_POSTS;
}

export async function fetchPostDetail(slugOrId: string): Promise<Post> {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .or(`slug.eq.${slugOrId},id.eq.${slugOrId}`)
        .single();

      if (error) throw error;
      if (data) {
        // Increment views
        try {
          await supabase.rpc('increment_post_views', { post_slug: data.slug });
        } catch {
          // Fallback direct update
          await supabase
            .from('posts')
            .update({ views: (data.views || 0) + 1 })
            .eq('id', data.id);
        }

        return mapRowToPost({
          ...data,
          views: (data.views || 0) + 1,
        });
      }
    } catch (err) {
      console.warn('Supabase detail fetch error, fallback to REST API:', err);
    }
  }

  // Fallback to Express backend
  const res = await fetch(`/api/posts/${encodeURIComponent(slugOrId)}`);
  if (!res.ok) {
    const match = MEMORY_FALLBACK_POSTS.find(p => p.slug === slugOrId || p.id === slugOrId);
    if (match) return match;
    throw new Error('Publicación no encontrada');
  }
  return res.json();
}

export async function fetchTags(): Promise<Record<string, number>> {
  const posts = await fetchPublishedPosts();
  const tagMap: Record<string, number> = {};
  posts.forEach(p => {
    p.tags.forEach(t => {
      tagMap[t] = (tagMap[t] || 0) + 1;
    });
  });
  return tagMap;
}

// ==========================================
// AUTHENTICATION API
// ==========================================

export async function apiLogin(username: string, password: string): Promise<LoginResponse> {
  // Validate credentials (admin / admin or custom)
  if (username === 'admin' && password === 'admin') {
    const token = `vercel_supa_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const user: AuthUser = {
      username: 'admin',
      name: 'Alejandro Silva (Admin)',
      role: 'Administrator',
    };
    return {
      success: true,
      token,
      user,
    };
  }

  // Also try backend /api/auth/login
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) return await res.json();
  } catch {}

  return {
    success: false,
    error: 'Credenciales inválidas. Usa el usuario "admin" y contraseña "admin".',
  };
}

export async function checkAuth(): Promise<boolean> {
  const token = getStoredToken();
  return Boolean(token);
}

export async function apiLogout(): Promise<void> {
  clearStoredAuth();
}

// ==========================================
// ADMIN CRUD API (SUPABASE DIRECT / SERVERLESS)
// ==========================================

export async function fetchAdminPosts(): Promise<Post[]> {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(mapRowToPost);
    } catch (err: any) {
      console.warn('Error fetching admin posts from Supabase:', err);
    }
  }

  // Fallback to Express /api/admin/posts
  const token = getStoredToken();
  const res = await fetch('/api/admin/posts', {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (res.ok) return await res.json();
  return MEMORY_FALLBACK_POSTS;
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const posts = await fetchAdminPosts();
  const totalPosts = posts.length;
  const publishedCount = posts.filter(p => p.status === 'published').length;
  const draftCount = posts.filter(p => p.status === 'draft').length;
  const totalViews = posts.reduce((acc, p) => acc + (p.views || 0), 0);
  const tagsSet = new Set<string>();
  posts.forEach(p => p.tags.forEach(t => tagsSet.add(t)));

  return {
    totalPosts,
    publishedCount,
    draftCount,
    totalViews,
    totalTags: tagsSet.size,
  };
}

export async function apiCreatePost(postData: Partial<Post>): Promise<Post> {
  const title = (postData.title || '').trim();
  const content = postData.content || '';
  if (!title || !content) {
    throw new Error('El título y contenido son obligatorios');
  }

  const slug = postData.slug || slugify(title) || `post-${Date.now()}`;
  const excerpt = postData.excerpt || content.replace(/[#*`>_-]/g, '').trim().substring(0, 160) + '...';
  const readingTime = calculateReadingTime(content);
  const cleanTags = Array.isArray(postData.tags)
    ? postData.tags
    : typeof postData.tags === 'string'
    ? (postData.tags as string).split(',').map(t => t.trim()).filter(Boolean)
    : ['General'];

  const supabase = getSupabaseClient();

  if (supabase) {
    const insertRow = {
      title,
      slug,
      excerpt,
      content,
      author: postData.author || 'Alejandro Silva',
      date: postData.date || new Date().toISOString().split('T')[0],
      status: postData.status || 'published',
      tags: cleanTags,
      views: 0,
      reading_time: readingTime,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('posts')
      .insert(insertRow)
      .select()
      .single();

    if (error) {
      throw new Error(`Error en Supabase: ${error.message}`);
    }

    return mapRowToPost(data);
  }

  // Fallback to Express backend
  const token = getStoredToken();
  const res = await fetch('/api/admin/posts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...postData,
      title,
      slug,
      excerpt,
      tags: cleanTags,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al crear la publicación');
  }

  return res.json();
}

export async function apiUpdatePost(id: string, postData: Partial<Post>): Promise<Post> {
  const supabase = getSupabaseClient();

  if (supabase) {
    const updatePayload: any = {
      updated_at: new Date().toISOString(),
    };

    if (postData.title !== undefined) updatePayload.title = postData.title.trim();
    if (postData.slug !== undefined) updatePayload.slug = slugify(postData.slug);
    if (postData.excerpt !== undefined) updatePayload.excerpt = postData.excerpt.trim();
    if (postData.content !== undefined) {
      updatePayload.content = postData.content;
      updatePayload.reading_time = calculateReadingTime(postData.content);
    }
    if (postData.author !== undefined) updatePayload.author = postData.author.trim();
    if (postData.date !== undefined) updatePayload.date = postData.date;
    if (postData.status !== undefined) updatePayload.status = postData.status;
    if (postData.tags !== undefined) {
      updatePayload.tags = Array.isArray(postData.tags)
        ? postData.tags
        : typeof postData.tags === 'string'
        ? (postData.tags as string).split(',').map(t => t.trim()).filter(Boolean)
        : [];
    }

    const { data, error } = await supabase
      .from('posts')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error de actualización en Supabase: ${error.message}`);
    }

    return mapRowToPost(data);
  }

  // Fallback to Express backend
  const token = getStoredToken();
  const res = await fetch(`/api/admin/posts/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al actualizar publicación');
  }

  return res.json();
}

export async function apiDeletePost(id: string): Promise<void> {
  const supabase = getSupabaseClient();

  if (supabase) {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error al eliminar en Supabase: ${error.message}`);
    }
    return;
  }

  // Fallback to Express backend
  const token = getStoredToken();
  const res = await fetch(`/api/admin/posts/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al eliminar');
  }
}

export async function apiResetDemoData(): Promise<void> {
  const supabase = getSupabaseClient();

  if (supabase) {
    // Upsert default sample posts
    for (const post of MEMORY_FALLBACK_POSTS) {
      await supabase.from('posts').upsert({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        author: post.author,
        date: post.date,
        status: post.status,
        tags: post.tags,
        views: post.views,
        reading_time: post.readingTime,
      }, { onConflict: 'slug' });
    }
    return;
  }

  // Fallback to Express
  const token = getStoredToken();
  await fetch('/api/admin/reset', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
