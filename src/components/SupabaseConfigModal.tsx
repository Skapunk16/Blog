import React, { useState, useEffect } from 'react';
import {
  Database, X, Check, Copy, ExternalLink, RefreshCw, AlertCircle,
  Key, ShieldCheck, Sparkles, Cloud, ArrowRight, CheckCircle2
} from 'lucide-react';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  clearSupabaseConfig,
  testSupabaseConnection,
  SupabaseConfig
} from '../lib/supabase';
import { apiResetDemoData } from '../lib/api';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChanged: () => void;
  onShowToast: (msg: string) => void;
}

const SCHEMA_SQL = `-- 1. Crear tabla de publicaciones (posts)
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

-- 2. Habilitar RLS y políticas
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de publicados" ON public.posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "Operaciones de administración" ON public.posts
  FOR ALL USING (true) WITH CHECK (true);

-- 3. Función para contador atómico de visitas
CREATE OR REPLACE FUNCTION increment_post_views(post_slug TEXT)
RETURNS void AS $$
BEGIN
  UPDATE public.posts SET views = COALESCE(views, 0) + 1 WHERE slug = post_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;`;

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigChanged,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'connection' | 'sql' | 'vercel'>('connection');
  const [config, setConfig] = useState<SupabaseConfig>(getSupabaseConfig());
  const [urlInput, setUrlInput] = useState(config.url || '');
  const [keyInput, setKeyInput] = useState(config.anonKey || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const current = getSupabaseConfig();
      setConfig(current);
      setUrlInput(current.url);
      setKeyInput(current.anonKey);
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);

    const test = await testSupabaseConnection(urlInput, keyInput);
    setTestResult(test);
    setTesting(false);

    if (test.success) {
      saveSupabaseConfig(urlInput, keyInput);
      setConfig(getSupabaseConfig());
      onShowToast('Conexión con Supabase guardada correctamente');
      onConfigChanged();
    }
  };

  const handleClear = () => {
    clearSupabaseConfig();
    setUrlInput('');
    setKeyInput('');
    setConfig(getSupabaseConfig());
    setTestResult(null);
    onShowToast('Configuración de Supabase restablecida');
    onConfigChanged();
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await apiResetDemoData();
      onShowToast('¡Artículos de muestra insertados en Supabase!');
      onConfigChanged();
    } catch (err: any) {
      onShowToast(err.message || 'Error al poblar Supabase');
    } finally {
      setSeeding(false);
    }
  };

  const copySql = () => {
    navigator.clipboard.writeText(SCHEMA_SQL);
    setCopiedSql(true);
    onShowToast('Código SQL copiado');
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-2xl shadow-2xl p-6 sm:p-8 max-h-[90vh] flex flex-col relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-xl sm:text-2xl font-semibold text-stone-900 dark:text-stone-100">
                Integración con Supabase & Vercel
              </h2>
              {config.isConfigured ? (
                <span className="font-mono text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Conectado Cloud
                </span>
              ) : (
                <span className="font-mono text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded-full">
                  Modo Local / Demo
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Base de datos serverless para desplegar en Vercel sin archivos locales.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-200 dark:border-stone-800 mb-5 gap-2 text-xs font-mono">
          <button
            onClick={() => setActiveTab('connection')}
            className={`pb-2.5 px-3 border-b-2 font-medium transition-colors ${
              activeTab === 'connection'
                ? 'border-stone-900 text-stone-900 dark:border-stone-100 dark:text-white'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            1. Conexión Supabase
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`pb-2.5 px-3 border-b-2 font-medium transition-colors ${
              activeTab === 'sql'
                ? 'border-stone-900 text-stone-900 dark:border-stone-100 dark:text-white'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            2. Script SQL (Tabla)
          </button>
          <button
            onClick={() => setActiveTab('vercel')}
            className={`pb-2.5 px-3 border-b-2 font-medium transition-colors ${
              activeTab === 'vercel'
                ? 'border-stone-900 text-stone-900 dark:border-stone-100 dark:text-white'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            3. Variables para Vercel
          </button>
        </div>

        {/* Tab 1: Connection Form */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-5 text-xs sm:text-sm">
          {activeTab === 'connection' && (
            <div>
              <p className="text-xs text-stone-600 dark:text-stone-400 mb-4 leading-relaxed">
                Puedes conectar tu propio proyecto de Supabase ingresando tu URL y clave anónima (Anon Key). Esto guardará las publicaciones directamente en la nube de Supabase:
              </p>

              <form onSubmit={handleTestAndSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-semibold uppercase text-stone-700 dark:text-stone-300 mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    required
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://xyzabcdefg.supabase.co"
                    className="w-full bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl px-3.5 py-2 text-xs font-mono focus:ring-2 focus:ring-stone-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold uppercase text-stone-700 dark:text-stone-300 mb-1">
                    Supabase Anon Public Key
                  </label>
                  <input
                    type="password"
                    required
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl px-3.5 py-2 text-xs font-mono focus:ring-2 focus:ring-stone-400 focus:outline-none"
                  />
                </div>

                {testResult && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                      testResult.success
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                        : 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                    )}
                    <div>
                      <p className="font-medium">{testResult.message}</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    {config.isConfigured && (
                      <button
                        type="button"
                        onClick={handleSeed}
                        disabled={seeding}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                        title="Inserta 3 publicaciones de muestra si tu tabla está vacía"
                      >
                        {seeding ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        <span>Poblar datos iniciales</span>
                      </button>
                    )}
                    {config.isConfigured && (
                      <button
                        type="button"
                        onClick={handleClear}
                        className="text-xs text-stone-400 hover:text-red-600 transition-colors"
                      >
                        Desconectar
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={testing || !urlInput || !keyInput}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 text-xs font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition-all shadow-xs disabled:opacity-50"
                  >
                    {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>Probar y Guardar Conexión</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  Copia y pega este script en <strong>Supabase Dashboard &gt; SQL Editor</strong>:
                </span>
                <button
                  onClick={copySql}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Copiado' : 'Copiar SQL'}</span>
                </button>
              </div>

              <pre className="bg-stone-900 text-stone-100 p-3.5 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto max-h-[300px]">
                {SCHEMA_SQL}
              </pre>
            </div>
          )}

          {activeTab === 'vercel' && (
            <div className="space-y-4">
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Al importar tu repositorio en <strong>Vercel</strong>, agrega estas variables en <strong>Settings &gt; Environment Variables</strong>:
              </p>

              <div className="space-y-2 font-mono text-xs">
                <div className="bg-stone-100 dark:bg-stone-800 p-2.5 rounded-lg border border-stone-200 dark:border-stone-700 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-stone-900 dark:text-stone-100">VITE_SUPABASE_URL</span>
                    <span className="text-[11px] text-stone-400 block font-sans">URL de tu proyecto de Supabase</span>
                  </div>
                </div>

                <div className="bg-stone-100 dark:bg-stone-800 p-2.5 rounded-lg border border-stone-200 dark:border-stone-700 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-stone-900 dark:text-stone-100">VITE_SUPABASE_ANON_KEY</span>
                    <span className="text-[11px] text-stone-400 block font-sans">Clave pública anónima de Supabase</span>
                  </div>
                </div>

                <div className="bg-stone-100 dark:bg-stone-800 p-2.5 rounded-lg border border-stone-200 dark:border-stone-700 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-stone-900 dark:text-stone-100">ADMIN_USERNAME</span>
                    <span className="text-[11px] text-stone-400 block font-sans">Por defecto: admin</span>
                  </div>
                </div>

                <div className="bg-stone-100 dark:bg-stone-800 p-2.5 rounded-lg border border-stone-200 dark:border-stone-700 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-stone-900 dark:text-stone-100">ADMIN_PASSWORD</span>
                    <span className="text-[11px] text-stone-400 block font-sans">Por defecto: admin</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-5 pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs">
          <span className="text-stone-400">Totalmente compatible con Serverless de Vercel.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
