import React from 'react';
import { Calendar, Clock, Eye, ArrowRight, Tag, Bookmark, Sparkles, X } from 'lucide-react';
import { Post } from '../types';

interface PostListProps {
  posts: Post[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectPost: (post: Post) => void;
  allTags: Record<string, number>;
  bookmarks: string[];
  onToggleBookmark: (postId: string) => void;
  loading: boolean;
}

export const PostList: React.FC<PostListProps> = ({
  posts,
  selectedTag,
  onSelectTag,
  searchQuery,
  onSearchChange,
  onSelectPost,
  allTags,
  bookmarks,
  onToggleBookmark,
  loading,
}) => {
  // Format dates in readable Spanish format
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const tagList = Object.keys(allTags);
  const featuredPost = posts.length > 0 && !selectedTag && !searchQuery ? posts[0] : null;
  const regularPosts = featuredPost ? posts.slice(1) : posts;

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      
      {/* Editorial Header / Intro */}
      <section className="mb-10 text-center sm:text-left border-b border-stone-200 dark:border-stone-800 pb-8">
        <span className="text-xs font-mono uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-2 block">
          Cuaderno de Alejandro Silva
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-stone-900 dark:text-stone-100 mb-3">
          Pensamientos sobre código, lentitud y diseño.
        </h1>
        <p className="text-stone-600 dark:text-stone-400 text-base sm:text-lg max-w-2xl leading-relaxed">
          Un espacio sosegado para reflexionar sobre la creación de software con sentido, arquitectura duradera y el valor de las cosas bien hechas.
        </p>

        {/* Tag Filters */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-6">
          <button
            onClick={() => onSelectTag(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              selectedTag === null
                ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900'
                : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            Todos ({posts.length})
          </button>
          {tagList.map(tag => (
            <button
              key={tag}
              onClick={() => onSelectTag(selectedTag === tag ? null : tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedTag === tag
                  ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                  : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              {tag} <span className="opacity-60 text-[10px]">({allTags[tag]})</span>
            </button>
          ))}
        </div>
      </section>

      {/* Active Filter Notice if searching or tag selected */}
      {(selectedTag || searchQuery) && (
        <div className="mb-6 flex items-center justify-between bg-stone-100/80 dark:bg-stone-900 px-4 py-2.5 rounded-lg border border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-600 dark:text-stone-300">
            <span>Filtrado por:</span>
            {selectedTag && (
              <span className="font-semibold text-stone-900 dark:text-white bg-white dark:bg-stone-800 px-2 py-0.5 rounded border border-stone-200 dark:border-stone-700">
                #{selectedTag}
              </span>
            )}
            {searchQuery && (
              <span className="font-semibold text-stone-900 dark:text-white bg-white dark:bg-stone-800 px-2 py-0.5 rounded border border-stone-200 dark:border-stone-700">
                "{searchQuery}"
              </span>
            )}
            <span className="text-stone-400">({posts.length} resultado{posts.length === 1 ? '' : 's'})</span>
          </div>
          <button
            onClick={() => {
              onSelectTag(null);
              onSearchChange('');
            }}
            className="text-xs text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 flex items-center gap-1 font-medium"
          >
            <X className="w-3.5 h-3.5" /> Limpiar filtros
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-6 animate-pulse">
          <div className="h-44 bg-stone-200/70 dark:bg-stone-800/60 rounded-xl" />
          <div className="h-32 bg-stone-200/50 dark:bg-stone-800/40 rounded-xl" />
          <div className="h-32 bg-stone-200/50 dark:bg-stone-800/40 rounded-xl" />
        </div>
      )}

      {/* Empty State */}
      {!loading && posts.length === 0 && (
        <div className="text-center py-16 px-4 bg-stone-100/50 dark:bg-stone-900/50 rounded-2xl border border-dashed border-stone-300 dark:border-stone-800">
          <Sparkles className="w-8 h-8 mx-auto text-stone-400 mb-3" />
          <h3 className="font-serif text-xl font-medium text-stone-800 dark:text-stone-200 mb-1">
            No se encontraron publicaciones
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 max-w-sm mx-auto mb-4">
            No hay artículos que coincidan con los criterios de búsqueda actuales.
          </p>
          <button
            onClick={() => {
              onSelectTag(null);
              onSearchChange('');
            }}
            className="text-xs px-3.5 py-1.5 rounded-md bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 font-medium"
          >
            Restablecer filtros
          </button>
        </div>
      )}

      {/* Featured Lead Post */}
      {!loading && featuredPost && (
        <article
          onClick={() => onSelectPost(featuredPost)}
          className="group relative cursor-pointer bg-white dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 rounded-2xl p-6 sm:p-8 mb-10 transition-all hover:shadow-lg hover:shadow-stone-200/50 dark:hover:shadow-none"
        >
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-800/50">
                <Sparkles className="w-3 h-3" /> Destacado
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(featuredPost.date)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {featuredPost.readingTime} min de lectura
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(featuredPost.id);
              }}
              className="p-1 text-stone-400 hover:text-amber-600 transition-colors"
              title={bookmarks.includes(featuredPost.id) ? 'Quitar marcador' : 'Guardar en marcadores'}
            >
              <Bookmark
                className={`w-4 h-4 ${
                  bookmarks.includes(featuredPost.id) ? 'fill-amber-500 text-amber-500' : ''
                }`}
              />
            </button>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-stone-900 dark:text-stone-100 group-hover:text-stone-700 dark:group-hover:text-stone-300 transition-colors mb-3 leading-snug">
            {featuredPost.title}
          </h2>

          <p className="text-stone-600 dark:text-stone-300 text-base sm:text-lg leading-relaxed mb-6">
            {featuredPost.excerpt}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-stone-100 dark:border-stone-800/80">
            <div className="flex flex-wrap gap-1.5">
              {featuredPost.tags.map(tag => (
                <span
                  key={tag}
                  className="text-xs bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 px-2 py-0.5 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-stone-900 dark:text-stone-200 group-hover:translate-x-1 transition-transform">
              Leer ensayo <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </article>
      )}

      {/* Regular Articles List */}
      {!loading && regularPosts.length > 0 && (
        <section className="space-y-6">
          {regularPosts.map((post) => (
            <article
              key={post.id}
              onClick={() => onSelectPost(post)}
              className="group cursor-pointer bg-white dark:bg-stone-900/50 border border-stone-200/90 dark:border-stone-800/90 hover:border-stone-400/80 dark:hover:border-stone-700 rounded-xl p-5 sm:p-6 transition-all hover:shadow-xs"
            >
              <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-2">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 font-sans">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(post.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {post.readingTime} min
                  </span>
                  {post.views > 0 && (
                    <span className="hidden sm:flex items-center gap-1 text-stone-400">
                      <Eye className="w-3.5 h-3.5" />
                      {post.views}
                    </span>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleBookmark(post.id);
                  }}
                  className="p-1 text-stone-400 hover:text-amber-600 transition-colors"
                  title="Guardar en marcadores"
                >
                  <Bookmark
                    className={`w-4 h-4 ${
                      bookmarks.includes(post.id) ? 'fill-amber-500 text-amber-500' : ''
                    }`}
                  />
                </button>
              </div>

              <h3 className="font-serif text-xl sm:text-2xl font-medium text-stone-900 dark:text-stone-100 group-hover:text-stone-600 dark:group-hover:text-stone-300 transition-colors mb-2 leading-snug">
                {post.title}
              </h3>

              <p className="text-stone-600 dark:text-stone-400 text-sm sm:text-base leading-relaxed mb-4 line-clamp-2">
                {post.excerpt}
              </p>

              <div className="flex items-center justify-between text-xs pt-3 border-t border-stone-100 dark:border-stone-800/60">
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.map(tag => (
                    <span
                      key={tag}
                      className="bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 px-2 py-0.5 rounded font-sans text-[11px]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <span className="inline-flex items-center gap-1 text-xs font-medium text-stone-800 dark:text-stone-200 group-hover:translate-x-0.5 transition-transform">
                  Leer <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </article>
          ))}
        </section>
      )}

      {/* Minimal Footer */}
      <footer className="mt-16 pt-8 border-t border-stone-200 dark:border-stone-800 text-center text-xs text-stone-500 dark:text-stone-400 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>© 2026 Atelier • Publicado con esmero tipográfico y calma.</p>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[11px]">Backend Node.js & Express</span>
          <span className="text-stone-300 dark:text-stone-700">•</span>
          <span className="font-mono text-[11px]">JSON Store</span>
        </div>
      </footer>
    </main>
  );
};
