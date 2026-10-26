import React, { useEffect, useState } from 'react';
import { marked } from 'marked';
import { ArrowLeft, Calendar, Clock, Eye, Share2, Bookmark, Check, User, Sparkles } from 'lucide-react';
import { Post } from '../types';

interface PostDetailProps {
  post: Post;
  onBack: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (postId: string) => void;
  onSelectTag: (tag: string) => void;
  onShowToast: (msg: string) => void;
}

export const PostDetail: React.FC<PostDetailProps> = ({
  post,
  onBack,
  isBookmarked,
  onToggleBookmark,
  onSelectTag,
  onShowToast,
}) => {
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Setup marked options safely
  marked.setOptions({
    gfm: true,
    breaks: true,
  });

  const parsedHtml = marked.parse(post.content || '') as string;

  // Track reading scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      onShowToast('Enlace copiado al portapapeles');
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {
      onShowToast('No se pudo copiar el enlace');
    });
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Reading Progress Bar */}
      <div
        className="fixed top-16 left-0 h-0.5 bg-stone-900 dark:bg-stone-100 z-40 transition-all duration-75"
        style={{ width: `${scrollProgress}%` }}
      />

      <article className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-14">
        {/* Navigation / Back Bar */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-200/80 dark:border-stone-800/80">
          <button
            onClick={onBack}
            className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Volver a los ensayos</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleBookmark(post.id)}
              className="p-1.5 rounded-md text-stone-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title={isBookmarked ? 'Quitar marcador' : 'Guardar marcador'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>

            <button
              onClick={handleCopyLink}
              className="p-1.5 rounded-md text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title="Copiar enlace del artículo"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Article Header */}
        <header className="mb-10">
          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {post.tags.map(tag => (
              <button
                key={tag}
                onClick={() => onSelectTag(tag)}
                className="font-mono text-xs uppercase tracking-wider text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-2.5 py-0.5 rounded hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              >
                #{tag}
              </button>
            ))}
            {post.status === 'draft' && (
              <span className="font-mono text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-300 dark:border-amber-700">
                Borrador Privado
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-stone-900 dark:text-stone-50 mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Excerpt / Lead */}
          {post.excerpt && (
            <p className="font-serif italic text-lg sm:text-xl text-stone-600 dark:text-stone-300 leading-relaxed border-l-2 border-stone-300 dark:border-stone-700 pl-4 py-1 mb-6">
              {post.excerpt}
            </p>
          )}

          {/* Author and Metadata Line */}
          <div className="flex items-center justify-between py-4 border-y border-stone-200 dark:border-stone-800 text-xs sm:text-sm text-stone-500 dark:text-stone-400">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center font-serif text-xs font-semibold text-stone-800 dark:text-stone-200">
                AS
              </div>
              <div>
                <span className="font-medium text-stone-800 dark:text-stone-200 block">
                  {post.author || 'Alejandro Silva'}
                </span>
                <span className="text-[11px] text-stone-400 capitalize">
                  {formatDate(post.date)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {post.readingTime} min
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {post.views} lectura{post.views === 1 ? '' : 's'}
              </span>
            </div>
          </div>
        </header>

        {/* Rendered Markdown Body */}
        <div
          className="prose-editorial"
          dangerouslySetInnerHTML={{ __html: parsedHtml }}
        />

        {/* Post Footer / Author Bio */}
        <footer className="mt-16 pt-8 border-t border-stone-200 dark:border-stone-800">
          <div className="bg-stone-100/70 dark:bg-stone-900 p-6 rounded-2xl border border-stone-200/80 dark:border-stone-800 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 flex items-center justify-center font-serif text-lg font-bold shrink-0">
              AS
            </div>
            <div className="flex-1">
              <h4 className="font-serif font-semibold text-stone-900 dark:text-stone-100 text-base mb-1">
                Escrito por {post.author || 'Alejandro Silva'}
              </h4>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                Ingeniero y artesano de software. Apasionado por la web sencilla, la tipografía sobria y la arquitectura orientada a la longevidad.
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-between items-center text-xs">
            <button
              onClick={onBack}
              className="font-medium text-stone-900 dark:text-stone-200 hover:underline flex items-center gap-1"
            >
              ← Ver todas las publicaciones
            </button>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-stone-500 hover:text-stone-800 dark:hover:text-stone-300"
            >
              ↑ Volver arriba
            </button>
          </div>
        </footer>
      </article>
    </div>
  );
};
