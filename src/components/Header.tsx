import React from 'react';
import { BookOpen, Shield, Sun, Moon, Search, Info, HelpCircle, Database, Cloud } from 'lucide-react';
import { AuthUser } from '../types';

interface HeaderProps {
  currentView: 'home' | 'post' | 'admin';
  onNavigateHome: () => void;
  onOpenAdmin: () => void;
  onOpenAbout: () => void;
  onOpenInstructions: () => void;
  onOpenSupabase: () => void;
  isSupabaseConfigured: boolean;
  adminUser: AuthUser | null;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  searchOpen: boolean;
  onToggleSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigateHome,
  onOpenAdmin,
  onOpenAbout,
  onOpenInstructions,
  onOpenSupabase,
  isSupabaseConfigured,
  adminUser,
  darkMode,
  onToggleDarkMode,
  searchOpen,
  onToggleSearch,
}) => {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-stone-50/85 dark:bg-stone-950/85 border-b border-stone-200/80 dark:border-stone-800/80 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateHome}
            className="group text-left flex items-center gap-2.5 focus:outline-none"
            title="Ir a la página principal"
          >
            <div className="w-8 h-8 rounded-full bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 flex items-center justify-center font-serif font-bold text-sm shadow-xs group-hover:scale-105 transition-transform">
              A
            </div>
            <div>
              <span className="font-serif text-xl tracking-tight font-semibold text-stone-900 dark:text-stone-100 block leading-tight">
                Atelier
              </span>
              <span className="text-[10px] tracking-widest uppercase text-stone-500 dark:text-stone-400 font-sans block">
                Blog Minimalista
              </span>
            </div>
          </button>
        </div>

        {/* Navigation Actions */}
        <nav className="flex items-center gap-1.5 sm:gap-2">
          {/* Home Link */}
          <button
            onClick={onNavigateHome}
            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
              currentView === 'home'
                ? 'text-stone-950 dark:text-white bg-stone-200/60 dark:bg-stone-800'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            Ensayos
          </button>

          {/* About Author Modal Link */}
          <button
            onClick={onOpenAbout}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            Autor
          </button>

          {/* Instructions / Guide */}
          <button
            onClick={onOpenInstructions}
            className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
            title="Instrucciones del proyecto, arquitectura y 3 pasos de despliegue"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden md:inline">Guía & Config</span>
          </button>

          {/* Supabase Status / Setup */}
          <button
            onClick={onOpenSupabase}
            className={`inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-md text-xs font-mono transition-colors ${
              isSupabaseConfigured
                ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
            title={isSupabaseConfigured ? 'Supabase conectado a la nube' : 'Conectar Supabase para Vercel'}
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{isSupabaseConfigured ? 'Supabase Cloud' : 'Supabase'}</span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'
              }`}
            />
          </button>

          {/* Search Toggle */}
          <button
            onClick={onToggleSearch}
            className={`p-2 rounded-md text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors ${
              searchOpen ? 'bg-stone-200 dark:bg-stone-800 text-stone-900' : ''
            }`}
            title="Buscar artículos"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-md text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
            title={darkMode ? 'Cambiar a modo lectura claro' : 'Cambiar a modo noche'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Admin Access Button */}
          <button
            onClick={onOpenAdmin}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
              adminUser
                ? currentView === 'admin'
                  ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                  : 'bg-stone-200/80 text-stone-800 dark:bg-stone-800 dark:text-stone-200 hover:bg-stone-300 dark:hover:bg-stone-700'
                : 'border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-900'
            }`}
            title={adminUser ? 'Abrir panel de administración' : 'Iniciar sesión como administrador'}
          >
            <Shield className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
            <span>{adminUser ? 'Panel Admin' : 'Admin'}</span>
            {adminUser && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};
