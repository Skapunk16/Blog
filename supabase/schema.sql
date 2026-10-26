-- ========================================================
-- SCHEMA SQL PARA BLOG PERSONAL MINIMALISTA EN SUPABASE
-- Ejecuta este script en Supabase Dashboard -> SQL Editor -> New Query
-- ========================================================

-- 1. Crear tabla de publicaciones (posts)
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  author TEXT DEFAULT 'Alejandro Silva',
  date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft')),
  tags TEXT[] DEFAULT ARRAY['General']::TEXT[],
  views INTEGER DEFAULT 0,
  reading_time INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Índices de rendimiento para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_date ON public.posts(date DESC);

-- 3. Habilitar Seguridad a Nivel de Fila (Row Level Security - RLS)
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de Acceso:
-- Política 1: Lectura pública de artículos publicados
CREATE POLICY "Lectura pública de artículos publicados" 
  ON public.posts
  FOR SELECT 
  USING (status = 'published');

-- Política 2: Permitir todas las operaciones con la clave pública anónima o servicio
-- (Para panel de administración simplificado con validación de credenciales en cliente o serverless)
CREATE POLICY "Permitir inserción de publicaciones" 
  ON public.posts
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Permitir actualización de publicaciones" 
  ON public.posts
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir eliminación de publicaciones" 
  ON public.posts
  FOR DELETE 
  USING (true);

-- 5. Función RPC atómica para incrementar visitas
CREATE OR REPLACE FUNCTION increment_post_views(post_slug TEXT)
RETURNS void AS $$
BEGIN
  UPDATE public.posts
  SET views = COALESCE(views, 0) + 1
  WHERE slug = post_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Insertar artículos iniciales de demostración
INSERT INTO public.posts (title, slug, excerpt, content, author, date, status, tags, views, reading_time)
VALUES
(
  'El elogio de la lentitud y el minimalismo en el software',
  'el-elogio-de-la-lentitud-y-el-minimalismo-en-el-software',
  'En un mundo obsesionado con la velocidad y las métricas superficiales, crear herramientas sobrias y calmadas es una forma de resistencia.',
  '# El elogio de la lentitud y el minimalismo en el software\n\nVivimos rodeados de interfaces ruidosas. Cada aplicación parece competir por la milésima de segundo de nuestra atención con insignias rojas, animaciones innecesarias y notificaciones artificiales.\n\n## ¿Qué significa realmente simplificar?\n\nSimplificar no es eliminar características al azar ni conformarse con interfaces vacías. Es un proceso riguroso de destilación:\n\n> "La perfección se alcanza, no cuando no hay nada más que añadir, sino cuando ya no queda nada que quitar."\n> — *Antoine de Saint-Exupéry*\n\n1. **Claridad sobre adorno:** Cada elemento visual debe cumplir una función o aportar valor cognitivo real.\n2. **Respeto por la atención:** No forzar modales intrusivos ni crear urgencias artificiales.\n3. **Longevidad y ligereza:** Código directo, dependencias razonables y respeto por el hardware del usuario.',
  'Alejandro Silva',
  CURRENT_DATE,
  'published',
  ARRAY['Filosofía', 'Minimalismo', 'Diseño'],
  142,
  4
),
(
  'Por qué aún escribo en un blog personal en la era de los algoritmos',
  'por-que-aun-escribo-en-un-blog-personal',
  'Tener una pequeña parcela propia en la web abierta nos devuelve el control, la privacidad y el placer genuino de la escritura sin filtros algorítmicos.',
  '# Por qué aún escribo en un blog personal en la era de los algoritmos\n\nHubo una época en la que la web se sentía como una red de pequeños cafés y librerías de barrio: cada persona tenía su propio sitio, su diseño artesanal y su feed RSS.\n\nAl mantener este blog independiente escribo sin prisas, en formato libre y con tipografía cuidada sin depender del humor de un algoritmo comercial.',
  'Alejandro Silva',
  CURRENT_DATE - INTERVAL '6 days',
  'published',
  ARRAY['Web Abierta', 'Reflexiones', 'Escritura'],
  289,
  3
),
(
  'Tipografía editorial para la pantalla: ritmo y espacio blanco',
  'tipografia-editorial-para-la-pantalla',
  'Una exploración técnica y visual sobre el interlineado, la escala de fuentes y el espacio negativo para una experiencia de lectura fluida.',
  '# Tipografía editorial para la pantalla: ritmo y espacio blanco\n\nLa tipografía no es simplemente la elección de una fuente bonita; es la arquitectura invisible de la comprensión lectora.\n\nUna línea de texto óptima debe contener entre **55 y 75 caracteres** (incluyendo espacios). Si es más ancha, el ojo se pierde al saltar al renglón siguiente.',
  'Alejandro Silva',
  CURRENT_DATE - INTERVAL '14 days',
  'published',
  ARRAY['Diseño', 'Tipografía', 'CSS'],
  95,
  3
)
ON CONFLICT (slug) DO NOTHING;
