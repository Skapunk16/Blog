import React, { useEffect, useRef } from 'react';
import { Search, X, Calendar, Clock, ArrowRight } from 'lucide-react';
import { Post } from '../types';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  posts: Post[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectPost: (post: Post) => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  isOpen,
  onClose,
  posts,
  searchQuery,
  onSearchChange,
  onSelectPost,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = posts.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.excerpt.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-100">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]">
        
        {/* Search Input Bar */}
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-stone-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por palabra clave, tema o etiqueta..."
            className="flex-1 bg-transparent text-sm sm:text-base text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            >
              Borrar
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800/80 p-2">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-400">
              No se encontraron publicaciones con "{searchQuery}"
            </div>
          ) : (
            filtered.map((post) => (
              <div
                key={post.id}
                onClick={() => {
                  onSelectPost(post);
                  onClose();
                }}
                className="p-3.5 hover:bg-stone-50 dark:hover:bg-stone-800/60 rounded-xl cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-2 text-[11px] text-stone-400 mb-1">
                  <span>{post.date}</span>
                  <span>•</span>
                  <span>{post.readingTime} min</span>
                  <div className="flex items-center gap-1 ml-auto">
                    {post.tags.map(t => (
                      <span key={t} className="bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 px-1.5 py-0.2 rounded font-mono text-[10px]">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <h4 className="font-serif text-base font-medium text-stone-900 dark:text-stone-100 group-hover:text-stone-600 dark:group-hover:text-stone-300">
                  {post.title}
                </h4>

                <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                  {post.excerpt}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="p-2.5 bg-stone-50 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 text-[11px] text-stone-400 text-center font-mono">
          Pulsa Esc o haz clic fuera para cerrar
        </div>
      </div>
    </div>
  );
};
