import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

function getSupabase() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return null;
  }
  return createClient(SUPABASE_URL, SUPABASE_KEY);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const supabase = getSupabase();

  if (!supabase) {
    res.status(500).json({
      error: 'Supabase credentials are not configured in Vercel Environment Variables. Set SUPABASE_URL and SUPABASE_ANON_KEY.',
    });
    return;
  }

  // GET: List published posts
  if (req.method === 'GET') {
    const { tag, q } = req.query;
    let query = supabase
      .from('posts')
      .select('*')
      .eq('status', 'published')
      .order('date', { ascending: false });

    if (tag && typeof tag === 'string') {
      query = query.contains('tags', [tag]);
    }

    const { data, error } = await query;
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    let posts = data || [];
    if (q && typeof q === 'string') {
      const searchTerm = q.toLowerCase();
      posts = posts.filter(
        p =>
          p.title?.toLowerCase().includes(searchTerm) ||
          p.excerpt?.toLowerCase().includes(searchTerm)
      );
    }

    res.status(200).json(posts);
    return;
  }

  // POST: Create new post
  if (req.method === 'POST') {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No autorizado. Se requiere token.' });
      return;
    }

    const { title, excerpt, content, tags, status, author, date, slug } = req.body;
    if (!title || !content) {
      res.status(400).json({ error: 'Título y contenido son obligatorios.' });
      return;
    }

    const cleanSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const { data, error } = await supabase
      .from('posts')
      .insert({
        title,
        slug: cleanSlug,
        excerpt,
        content,
        tags: Array.isArray(tags) ? tags : ['General'],
        status: status || 'published',
        author: author || 'Alejandro Silva',
        date: date || new Date().toISOString().split('T')[0],
        views: 0,
        reading_time: Math.max(1, Math.ceil(content.split(/\s+/).length / 200)),
      })
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.status(201).json(data);
    return;
  }

  res.status(405).json({ error: 'Método no permitido' });
}
