import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY = 'atelier_supabase_config';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
  source: 'env' | 'custom' | 'none';
}

let cachedClient: SupabaseClient | null = null;
let cachedConfigKey: string = '';

export function getSupabaseConfig(): SupabaseConfig {
  // 1. Check Vite env variables
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  if (envUrl && envKey && !envUrl.includes('tu-proyecto') && !envKey.includes('...')) {
    return {
      url: envUrl,
      anonKey: envKey,
      isConfigured: true,
      source: 'env',
    };
  }

  // 2. Check localStorage custom configuration
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.url && parsed.anonKey) {
        return {
          url: parsed.url,
          anonKey: parsed.anonKey,
          isConfigured: true,
          source: 'custom',
        };
      }
    }
  } catch (err) {
    console.error('Error reading Supabase config from storage', err);
  }

  return {
    url: '',
    anonKey: '',
    isConfigured: false,
    source: 'none',
  };
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        url: url.trim(),
        anonKey: anonKey.trim(),
      })
    );
    cachedClient = null;
    cachedConfigKey = '';
  } catch (err) {
    console.error('Error saving Supabase config to storage', err);
  }
}

export function clearSupabaseConfig(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    cachedClient = null;
    cachedConfigKey = '';
  } catch (err) {
    console.error('Error clearing Supabase config', err);
  }
}

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config.isConfigured) return null;

  const currentKey = `${config.url}_${config.anonKey}`;
  if (cachedClient && cachedConfigKey === currentKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    cachedConfigKey = currentKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to create Supabase client:', err);
    return null;
  }
}

// Test connection
export async function testSupabaseConnection(url?: string, key?: string): Promise<{ success: boolean; message: string; count?: number }> {
  try {
    let client: SupabaseClient | null = null;
    if (url && key) {
      client = createClient(url.trim(), key.trim());
    } else {
      client = getSupabaseClient();
    }

    if (!client) {
      return { success: false, message: 'Faltan credenciales de Supabase (URL y Anon Key).' };
    }

    const { data, error, count } = await client
      .from('posts')
      .select('id', { count: 'exact', head: true });

    if (error) {
      // Check if table does not exist
      if (error.code === '42P01' || error.message.includes('relation "public.posts" does not exist')) {
        return {
          success: false,
          message: 'Conexión a Supabase exitosa, pero la tabla "posts" aún no ha sido creada. Ejecuta el archivo schema.sql en el SQL Editor de Supabase.',
        };
      }
      return { success: false, message: `Error de Supabase: ${error.message}` };
    }

    return {
      success: true,
      message: `¡Conexión exitosa a Supabase! Tabla "posts" detectada con ${count ?? 0} registros.`,
      count: count ?? 0,
    };
  } catch (err: any) {
    return { success: false, message: `Error de red al conectar con Supabase: ${err.message}` };
  }
}
