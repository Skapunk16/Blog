import React, { useState } from 'react';
import { X, Terminal, FolderTree, Key, Check, Copy, ExternalLink, Database, Server, Code } from 'lucide-react';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'steps' | 'structure' | 'api' | 'vercel'>('steps');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    onShowToast('Comando copiado');
    setTimeout(() => setCopiedCode(null), 2000);
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

        {/* Modal Header */}
        <div className="mb-5">
          <span className="text-[11px] font-mono uppercase tracking-widest text-amber-600 dark:text-amber-400 font-semibold">
            Guía de Implementación y Arquitectura Vercel
          </span>
          <h2 className="font-serif text-2xl font-semibold text-stone-900 dark:text-stone-100 mt-1">
            Manual de Ejecución y Despliegue en Vercel
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Arquitectura serverless optimizada para Vercel con persistencia cloud en Supabase.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 dark:border-stone-800 mb-6 gap-2 text-xs font-mono overflow-x-auto">
          <button
            onClick={() => setActiveTab('steps')}
            className={`pb-2.5 px-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'steps'
                ? 'border-stone-900 text-stone-900 dark:border-stone-100 dark:text-white'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            1. Guía Rápida
          </button>
          <button
            onClick={() => setActiveTab('vercel')}
            className={`pb-2.5 px-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'vercel'
                ? 'border-stone-900 text-stone-900 dark:border-stone-100 dark:text-white'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            2. Despliegue en Vercel
          </button>
          <button
            onClick={() => setActiveTab('structure')}
            className={`pb-2.5 px-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'structure'
                ? 'border-stone-900 text-stone-900 dark:border-stone-100 dark:text-white'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            3. Estructura Serverless
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`pb-2.5 px-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'api'
                ? 'border-stone-900 text-stone-900 dark:border-stone-100 dark:text-white'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            4. Supabase & API
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-6 text-xs sm:text-sm text-stone-600 dark:text-stone-300">
          
          {activeTab === 'steps' && (
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="bg-stone-50 dark:bg-stone-800/50 p-4 rounded-xl border border-stone-200/80 dark:border-stone-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 flex items-center justify-center font-bold text-xs">
                      1
                    </span>
                    <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
                      Instalación de dependencias
                    </h4>
                  </div>
                  <button
                    onClick={() => copyToClipboard('npm install', 'step-1')}
                    className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                    title="Copiar comando"
                  >
                    {copiedCode === 'step-1' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mb-2">
                  Abre tu terminal en la raíz del proyecto e instala los paquetes necesarios (Express, dotenv, marked, etc.):
                </p>
                <code className="block bg-stone-900 text-stone-100 p-2.5 rounded-lg font-mono text-xs">
                  npm install
                </code>
              </div>

              {/* Step 2 */}
              <div className="bg-stone-50 dark:bg-stone-800/50 p-4 rounded-xl border border-stone-200/80 dark:border-stone-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 flex items-center justify-center font-bold text-xs">
                      2
                    </span>
                    <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
                      Iniciar el servidor Node.js / Express
                    </h4>
                  </div>
                  <button
                    onClick={() => copyToClipboard('npm run dev', 'step-2')}
                    className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                    title="Copiar comando"
                  >
                    {copiedCode === 'step-2' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mb-2">
                  Ejecuta el servidor. La base de datos local JSON se inicializará automáticamente si no existe con 5 entradas de ejemplo:
                </p>
                <code className="block bg-stone-900 text-stone-100 p-2.5 rounded-lg font-mono text-xs">
                  npm run dev  # o bien: node server.js
                </code>
              </div>

              {/* Step 3 */}
              <div className="bg-stone-50 dark:bg-stone-800/50 p-4 rounded-xl border border-stone-200/80 dark:border-stone-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 flex items-center justify-center font-bold text-xs">
                      3
                    </span>
                    <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
                      Acceder a la aplicación desde el navegador
                    </h4>
                  </div>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mb-2">
                  Abre tu navegador web e ingresa a la siguiente dirección:
                </p>
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-3 rounded-lg flex items-center justify-between">
                  <span className="font-mono text-xs text-stone-900 dark:text-stone-100 font-semibold">
                    http://localhost:3000
                  </span>
                  <span className="text-[11px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded font-mono">
                    Puerto 3000
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-stone-200 dark:border-stone-700 text-xs text-stone-500 dark:text-stone-400 flex items-center gap-2">
                  <Key className="w-3.5 h-3.5 text-amber-600" />
                  <span>Credenciales del Administrador: Usuario: <strong>admin</strong> | Clave: <strong>admin</strong></span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'vercel' && (
            <div className="space-y-4">
              <div className="bg-stone-900 text-stone-100 p-4 rounded-xl border border-stone-800">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block mb-1">
                  Arquitectura Cloud Serverless
                </span>
                <h4 className="font-serif text-lg font-medium text-white mb-2">
                  Por qué Vercel requiere Supabase y no JSON/SQLite
                </h4>
                <p className="text-xs text-stone-300 leading-relaxed">
                  En Vercel las funciones serverless se ejecutan en entornos efímeros y de solo lectura. Cualquier archivo guardado en el disco local (como <code>posts.json</code> o SQLite) se destruiría al apagarse la función. Por ello, <strong>Supabase</strong> proporciona la persistencia relacional PostgreSQL con APIs REST instantáneas y Row Level Security.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <h5 className="font-semibold text-stone-900 dark:text-stone-100 font-mono uppercase text-[11px]">
                  Pasos de Despliegue en Vercel:
                </h5>
                <ol className="list-decimal pl-5 space-y-2 text-stone-600 dark:text-stone-300">
                  <li>
                    <strong>Crea un proyecto en Supabase:</strong> Ve a <a href="https://supabase.com" target="_blank" rel="noreferrer" className="underline font-medium text-emerald-600">supabase.com</a> y crea un proyecto gratuito.
                  </li>
                  <li>
                    <strong>Ejecuta el script SQL:</strong> Ve a <em>SQL Editor &gt; New Query</em> y ejecuta el contenido de <code>supabase/schema.sql</code> para crear la tabla <code>posts</code> y las políticas RLS.
                  </li>
                  <li>
                    <strong>Sube tu código a GitHub:</strong> Haz push de este repositorio a tu cuenta de GitHub.
                  </li>
                  <li>
                    <strong>Importa en Vercel:</strong> En el dashboard de Vercel, selecciona "Add New Project" e importa tu repositorio.
                  </li>
                  <li>
                    <strong>Configura las Variables de Entorno en Vercel:</strong>
                    <ul className="list-disc pl-4 mt-1.5 space-y-1 font-mono text-[11px]">
                      <li><code>VITE_SUPABASE_URL</code> = Tu URL de proyecto Supabase</li>
                      <li><code>VITE_SUPABASE_ANON_KEY</code> = Tu Anon Key pública de Supabase</li>
                      <li><code>ADMIN_USERNAME</code> = admin</li>
                      <li><code>ADMIN_PASSWORD</code> = admin</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Despliega:</strong> Haz clic en <strong>Deploy</strong>. Vercel compilará la aplicación con Vite y la publicará en segundos con CDN global.
                  </li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'structure' && (
            <div className="space-y-4">
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Estructura recomendada y modular de la aplicación completa:
              </p>
              <pre className="bg-stone-900 text-stone-100 p-4 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto">
{`blog-personal/
├── data/
│   └── posts.json          # Base de datos local en archivo JSON
├── src/
│   ├── components/
│   │   ├── Header.tsx            # Navegación, logo y selector de tema
│   │   ├── PostList.tsx          # Vista pública, filtros y artículo destacado
│   │   ├── PostDetail.tsx        # Lectura con barra de progreso y Markdown
│   │   ├── AdminDashboard.tsx    # Gestión, métricas y editor Markdown
│   │   ├── AdminLoginModal.tsx   # Modal de login protegido (admin/admin)
│   │   ├── AboutModal.tsx        # Biografía del autor y manifiesto
│   │   └── InstructionsModal.tsx # Esta guía interactiva
│   ├── lib/
│   │   └── api.ts          # Cliente API y manejo de tokens
│   ├── types.ts            # Interfaces TypeScript de Post y Stats
│   ├── App.tsx             # Orquestador de vistas y estado global
│   ├── index.css           # Estilos Tailwind y tipografía editorial
│   └── main.tsx            # Punto de entrada React
├── index.html              # HTML con fuentes Google Fonts (Newsreader/Jakarta)
├── server.ts               # Servidor Express Full-Stack con API REST + Vite
├── server.js               # Versión de ejecución pura en Node.js
└── package.json            # Scripts y dependencias`}
              </pre>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="bg-stone-100 dark:bg-stone-800 p-3 rounded-lg border border-stone-200 dark:border-stone-700">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">GET</span> /api/posts
                <p className="text-[11px] font-sans text-stone-500 mt-1">
                  Lista pública de artículos publicados. Soporta filtros opcionales <code>?tag=...</code> y búsqueda <code>?q=...</code>
                </p>
              </div>

              <div className="bg-stone-100 dark:bg-stone-800 p-3 rounded-lg border border-stone-200 dark:border-stone-700">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">GET</span> /api/posts/:slugOrId
                <p className="text-[11px] font-sans text-stone-500 mt-1">
                  Detalle del artículo completo e incrementa el contador de visitas automáticamente.
                </p>
              </div>

              <div className="bg-stone-100 dark:bg-stone-800 p-3 rounded-lg border border-stone-200 dark:border-stone-700">
                <span className="text-amber-600 dark:text-amber-400 font-bold">POST</span> /api/auth/login
                <p className="text-[11px] font-sans text-stone-500 mt-1">
                  Valida usuario y clave (<code>admin/admin</code>) y retorna token de sesión.
                </p>
              </div>

              <div className="bg-stone-100 dark:bg-stone-800 p-3 rounded-lg border border-stone-200 dark:border-stone-700">
                <span className="text-blue-600 dark:text-blue-400 font-bold">GET / POST / PUT / DELETE</span> /api/admin/*
                <p className="text-[11px] font-sans text-stone-500 mt-1">
                  Rutas protegidas con header <code>Authorization: Bearer &lt;token&gt;</code> para gestionar entradas y métricas.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs">
          <span className="text-stone-400">Totalmente funcional y listo para desplegar.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 font-medium"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
