import React from 'react';
import { X, Mail, Globe, Github, Twitter, Heart, Sparkles, Coffee } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 flex items-center justify-center font-serif text-2xl font-bold shadow-sm">
            AS
          </div>
          <div>
            <h3 className="font-serif text-2xl font-semibold text-stone-900 dark:text-stone-100">
              Alejandro Silva
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-mono">
              Desarrollador Full-Stack & Diseñador Editorial
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-sans">
          <p>
            Bienvenido a <strong>Atelier</strong>. Este blog nació de la convicción de que la web contemporánea necesita recuperar espacios de serenidad, tipografía cuidada y contenido sin el asedio constante de algoritmos de retención.
          </p>
          <p>
            Aquí escribo sobre arquitectura de software sostenible, diseño minimalista, tecnología sobria y el placer de construir cosas que resistan el paso del tiempo.
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-stone-200 dark:border-stone-800">
          <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3">
            Principios del Cuaderno
          </h4>
          <ul className="space-y-2 text-xs text-stone-600 dark:text-stone-300">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-900 dark:bg-stone-100" />
              <span>Sin rastreadores de publicidad ni cookies invasivas.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-900 dark:bg-stone-100" />
              <span>Tipografía optimizada para una lectura relajada.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-900 dark:bg-stone-100" />
              <span>Almacenamiento directo y local con control total.</span>
            </li>
          </ul>
        </div>

        <div className="mt-6 pt-6 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-3">
            <span className="hover:text-stone-900 dark:hover:text-stone-200 cursor-pointer flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" /> contacto@atelier.blog
            </span>
          </div>
          <span className="font-mono text-[11px]">Santiago / Madrid</span>
        </div>
      </div>
    </div>
  );
};
