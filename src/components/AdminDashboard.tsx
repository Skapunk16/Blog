import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import {
  Plus, Edit3, Trash2, Eye, LogOut, CheckCircle2, Clock, FileText,
  RefreshCw, BarChart2, Tag, Calendar, AlertTriangle, X, Check,
  BookOpen, Sparkles, ArrowLeft, ExternalLink, Bold, Italic, Heading1, Heading2, Quote, Code, List
} from 'lucide-react';
import { Post, AdminStats, AuthUser } from '../types';
import {
  fetchAdminPosts,
  fetchAdminStats,
  apiCreatePost,
  apiUpdatePost,
  apiDeletePost,
  apiResetDemoData,
  apiLogout
} from '../lib/api';

interface AdminDashboardProps {
  user: AuthUser;
  onLogout: () => void;
  onViewPost: (post: Post) => void;
  onExitToBlog: () => void;
  onShowToast: (msg: string) => void;
  onOpenSupabase: () => void;
  isSupabaseConfigured: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  onLogout,
  onViewPost,
  onExitToBlog,
  onShowToast,
  onOpenSupabase,
  isSupabaseConfigured,
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Form / Editor state
  const [isEditing, setIsEditing] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formExcerpt, setFormExcerpt] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formStatus, setFormStatus] = useState<'published' | 'draft'>('published');
  const [formAuthor, setFormAuthor] = useState(user.name.split(' (')[0] || 'Alejandro Silva');
  const [formDate, setFormDate] = useState('');
  const [editorTab, setEditorTab] = useState<'write' | 'preview'>('write');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Deletion modal state
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Reset modal state
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedPosts, fetchedStats] = await Promise.all([
        fetchAdminPosts(),
        fetchAdminStats(),
      ]);
      setPosts(fetchedPosts);
      setStats(fetchedStats);
    } catch (err: any) {
      onShowToast(err.message || 'Error al cargar datos del panel');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openNewPostForm = () => {
    setIsEditing(true);
    setEditingPostId(null);
    setFormTitle('');
    setFormExcerpt('');
    setFormContent(`# Nuevo Artículo\n\nComienza a escribir tus pensamientos aquí usando formato Markdown...\n\n## Subtítulo de ejemplo\n\nPuedes agregar listas, citas y código.`);
    setFormTags('Tecnología, Reflexiones');
    setFormStatus('published');
    setFormAuthor(user.name.split(' (')[0] || 'Alejandro Silva');
    setFormDate(new Date().toISOString().split('T')[0]);
    setEditorTab('write');
    setFormError(null);
  };

  const openEditPostForm = (post: Post) => {
    setIsEditing(true);
    setEditingPostId(post.id);
    setFormTitle(post.title);
    setFormExcerpt(post.excerpt);
    setFormContent(post.content || '');
    setFormTags(post.tags.join(', '));
    setFormStatus(post.status);
    setFormAuthor(post.author || 'Alejandro Silva');
    setFormDate(post.date);
    setEditorTab('write');
    setFormError(null);
  };

  const closeEditor = () => {
    setIsEditing(false);
    setEditingPostId(null);
    setFormError(null);
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError('El título es obligatorio.');
      return;
    }
    if (!formContent.trim()) {
      setFormError('El contenido no puede estar vacío.');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const payload = {
      title: formTitle.trim(),
      excerpt: formExcerpt.trim(),
      content: formContent,
      tags: formTags.split(',').map(t => t.trim()).filter(Boolean),
      status: formStatus,
      author: formAuthor.trim(),
      date: formDate || new Date().toISOString().split('T')[0],
    };

    try {
      if (editingPostId) {
        await apiUpdatePost(editingPostId, payload);
        onShowToast('Publicación actualizada correctamente');
      } else {
        await apiCreatePost(payload);
        onShowToast('Nueva publicación creada con éxito');
      }
      closeEditor();
      await loadData();
    } catch (err: any) {
      setFormError(err.message || 'Error al guardar la publicación');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!postToDelete) return;
    setDeleting(true);
    try {
      await apiDeletePost(postToDelete.id);
      onShowToast(`"${postToDelete.title}" ha sido eliminada`);
      setPostToDelete(null);
      await loadData();
    } catch (err: any) {
      onShowToast(err.message || 'Error al eliminar la publicación');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (post: Post) => {
    const nextStatus = post.status === 'published' ? 'draft' : 'published';
    try {
      await apiUpdatePost(post.id, { status: nextStatus });
      onShowToast(
        nextStatus === 'published'
          ? `Publicación puesta en línea`
          : `Publicación movida a borradores`
      );
      await loadData();
    } catch (err: any) {
      onShowToast(err.message || 'Error al cambiar estado');
    }
  };

  const handleResetData = async () => {
    setResetting(true);
    try {
      await apiResetDemoData();
      onShowToast('Datos de demostración restaurados');
      setShowResetConfirm(false);
      await loadData();
    } catch (err: any) {
      onShowToast(err.message || 'Error al restaurar datos');
    } finally {
      setResetting(false);
    }
  };

  // Markdown helper insertion
  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formContent;
    const selected = text.substring(start, end);

    const replacement = `${prefix}${selected || 'texto'}${suffix}`;
    const newText = text.substring(0, start) + replacement + text.substring(end);
    setFormContent(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected ? selected.length : 5));
    }, 50);
  };

  // Filter posts
  const filteredPosts = posts.filter(p => {
    const matchesSearch =
      searchFilter === '' ||
      p.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(searchFilter.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 pb-16 transition-colors">
      
      {/* Admin Top Bar */}
      <div className="bg-stone-900 text-stone-100 dark:bg-black border-b border-stone-800 sticky top-16 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onExitToBlog}
              className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-100 transition-colors"
              title="Volver a la vista pública del blog"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ver Blog Público</span>
            </button>
            <span className="text-stone-700">|</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono font-medium text-stone-300">
                Panel de Administración
              </span>
            </div>
            
            <button
              onClick={onOpenSupabase}
              className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-md transition-colors ${
                isSupabaseConfigured
                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                  : 'bg-stone-800 text-stone-300 hover:text-white border border-stone-700'
              }`}
              title="Configurar Supabase Cloud para despliegue en Vercel"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
              <span>{isSupabaseConfigured ? 'BD: Supabase Cloud' : 'BD: Conectar Supabase'}</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-stone-400 hidden sm:inline">
              Conectado como <strong className="text-stone-200">admin</strong>
            </span>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        
        {/* If editor is open, show full-screen post editor */}
        {isEditing ? (
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-sm p-6 sm:p-8 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-stone-200 dark:border-stone-800">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-stone-900 dark:text-stone-100">
                  {editingPostId ? 'Editar Entrada de Blog' : 'Crear Nueva Entrada'}
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Redacta en formato Markdown con vista previa instantánea y control de publicación.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeEditor}
                  className="px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSavePost}
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 text-xs font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition-all shadow-xs disabled:opacity-50"
                >
                  {submitting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>{editingPostId ? 'Guardar Cambios' : 'Publicar Entrada'}</span>
                </button>
              </div>
            </div>

            {formError && (
              <div className="mb-6 p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSavePost} className="space-y-6">
              {/* Title & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-3">
                  <label className="block text-xs font-mono font-semibold uppercase text-stone-600 dark:text-stone-400 mb-1.5">
                    Título del artículo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Ej. El arte de la simplicidad en el software"
                    className="w-full bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl px-4 py-2.5 text-base font-serif font-medium focus:ring-2 focus:ring-stone-400 dark:focus:ring-stone-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold uppercase text-stone-600 dark:text-stone-400 mb-1.5">
                    Estado
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl px-3 py-2.5 text-sm font-sans focus:ring-2 focus:ring-stone-400 dark:focus:ring-stone-600 focus:outline-none"
                  >
                    <option value="published">🟢 Publicado</option>
                    <option value="draft">🟡 Borrador</option>
                  </select>
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-stone-600 dark:text-stone-400 mb-1.5">
                  Resumen / Extracto (Breve descripción para la lista)
                </label>
                <textarea
                  rows={2}
                  value={formExcerpt}
                  onChange={(e) => setFormExcerpt(e.target.value)}
                  placeholder="Una frase sintética que capture la esencia del artículo..."
                  className="w-full bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl px-3.5 py-2 text-sm font-sans focus:ring-2 focus:ring-stone-400 dark:focus:ring-stone-600 focus:outline-none"
                />
              </div>

              {/* Content Editor with Toolbar & Tabbed Preview */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-mono font-semibold uppercase text-stone-600 dark:text-stone-400 mr-2">
                      Contenido (Markdown) *
                    </span>
                    {editorTab === 'write' && (
                      <div className="hidden sm:flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-lg border border-stone-200 dark:border-stone-700">
                        <button
                          type="button"
                          onClick={() => insertMarkdown('## ')}
                          className="p-1 rounded hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300"
                          title="Encabezado H2"
                        >
                          <Heading2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown('**', '**')}
                          className="p-1 rounded hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300"
                          title="Negrita"
                        >
                          <Bold className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown('*', '*')}
                          className="p-1 rounded hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300"
                          title="Cursiva"
                        >
                          <Italic className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown('> ')}
                          className="p-1 rounded hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300"
                          title="Cita"
                        >
                          <Quote className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown('- ')}
                          className="p-1 rounded hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300"
                          title="Lista"
                        >
                          <List className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown('```\n', '\n```')}
                          className="p-1 rounded hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300"
                          title="Bloque de código"
                        >
                          <Code className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg border border-stone-200 dark:border-stone-700 text-xs">
                    <button
                      type="button"
                      onClick={() => setEditorTab('write')}
                      className={`px-3 py-1 rounded-md font-medium transition-colors ${
                        editorTab === 'write'
                          ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                          : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                      }`}
                    >
                      Escribir
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorTab('preview')}
                      className={`px-3 py-1 rounded-md font-medium transition-colors ${
                        editorTab === 'preview'
                          ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                          : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                      }`}
                    >
                      Vista previa
                    </button>
                  </div>
                </div>

                {editorTab === 'write' ? (
                  <textarea
                    id="content-editor"
                    rows={14}
                    required
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    placeholder="Escribe el contenido en formato Markdown..."
                    className="w-full font-mono text-sm bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl p-4 focus:ring-2 focus:ring-stone-400 dark:focus:ring-stone-600 focus:outline-none leading-relaxed"
                  />
                ) : (
                  <div className="min-h-[350px] bg-stone-50 dark:bg-stone-850/60 border border-stone-200 dark:border-stone-700 rounded-xl p-6 overflow-y-auto">
                    <div
                      className="prose-editorial max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: marked.parse(formContent || '*Escribe algo en la pestaña "Escribir" para ver la vista previa.*') as string,
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Tags, Author & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-mono font-semibold uppercase text-stone-600 dark:text-stone-400 mb-1.5">
                    Etiquetas (separadas por comas)
                  </label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="Filosofía, Diseño, Código"
                    className="w-full bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-stone-400 dark:focus:ring-stone-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold uppercase text-stone-600 dark:text-stone-400 mb-1.5">
                    Autor
                  </label>
                  <input
                    type="text"
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    placeholder="Alejandro Silva"
                    className="w-full bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-stone-400 dark:focus:ring-stone-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold uppercase text-stone-600 dark:text-stone-400 mb-1.5">
                    Fecha de publicación
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-stone-400 dark:focus:ring-stone-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={closeEditor}
                  className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 text-xs font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition-all shadow-xs disabled:opacity-50"
                >
                  {submitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>{editingPostId ? 'Guardar Cambios' : 'Publicar Ahora'}</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Main Dashboard Overview & Posts Table */
          <div className="space-y-8">
            
            {/* Top Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 p-5 rounded-2xl shadow-2xs">
                <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-1">
                  Total Artículos
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">
                    {stats ? stats.totalPosts : posts.length}
                  </span>
                  <FileText className="w-5 h-5 text-stone-400" />
                </div>
              </div>

              <div className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 p-5 rounded-2xl shadow-2xs">
                <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-1">
                  Publicados en Línea
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-serif font-bold text-emerald-700 dark:text-emerald-400">
                    {stats ? stats.publishedCount : posts.filter(p => p.status === 'published').length}
                  </span>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
              </div>

              <div className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 p-5 rounded-2xl shadow-2xs">
                <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-1">
                  Borradores
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-serif font-bold text-amber-700 dark:text-amber-400">
                    {stats ? stats.draftCount : posts.filter(p => p.status === 'draft').length}
                  </span>
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
              </div>

              <div className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 p-5 rounded-2xl shadow-2xs">
                <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-1">
                  Lecturas Totales
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">
                    {stats ? stats.totalViews : 0}
                  </span>
                  <Eye className="w-5 h-5 text-stone-400" />
                </div>
              </div>
            </div>

            {/* Posts Management Section */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-sm overflow-hidden">
              
              {/* Header with Search and Actions */}
              <div className="p-5 sm:p-6 border-b border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif text-xl font-semibold text-stone-900 dark:text-stone-100">
                    Gestión de Entradas
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Crea, edita, publica o elimina publicaciones de tu blog.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-medium transition-colors"
                    title="Restaurar artículos de demostración iniciales"
                  >
                    Restablecer datos demo
                  </button>

                  <button
                    onClick={openNewPostForm}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 text-xs font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition-all shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nueva Entrada</span>
                  </button>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="px-5 py-3.5 bg-stone-50 dark:bg-stone-850/50 border-b border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="w-full sm:w-72">
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Buscar por título o etiqueta..."
                    className="w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-stone-400 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-1 text-xs self-start sm:self-auto">
                  <span className="text-stone-400 mr-1">Filtrar:</span>
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      statusFilter === 'all'
                        ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 font-medium'
                        : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
                    }`}
                  >
                    Todos ({posts.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('published')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      statusFilter === 'published'
                        ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 font-medium'
                        : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
                    }`}
                  >
                    Publicados ({posts.filter(p => p.status === 'published').length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('draft')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      statusFilter === 'draft'
                        ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 font-medium'
                        : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
                    }`}
                  >
                    Borradores ({posts.filter(p => p.status === 'draft').length})
                  </button>
                </div>
              </div>

              {/* Table / List */}
              {loading ? (
                <div className="p-8 text-center text-stone-400 text-sm">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-stone-400" />
                  Cargando publicaciones...
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="p-12 text-center text-stone-400">
                  <p className="text-sm">No hay publicaciones que coincidan.</p>
                  <button
                    onClick={openNewPostForm}
                    className="mt-3 text-xs text-stone-900 dark:text-stone-100 font-semibold underline"
                  >
                    Crear una publicación ahora
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-stone-100 dark:divide-stone-800">
                  {filteredPosts.map((post) => (
                    <div
                      key={post.id}
                      className="p-4 sm:p-5 hover:bg-stone-50/70 dark:hover:bg-stone-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1 pr-4">
                        <div className="flex items-center gap-2 text-xs">
                          <button
                            onClick={() => handleToggleStatus(post)}
                            className={`inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                              post.status === 'published'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 hover:bg-emerald-100'
                                : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 hover:bg-amber-100'
                            }`}
                            title="Haz clic para alternar estado (Publicado / Borrador)"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${post.status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            {post.status === 'published' ? 'Publicado' : 'Borrador'}
                          </button>

                          <span className="text-stone-400">•</span>
                          <span className="text-stone-500 dark:text-stone-400">{post.date}</span>
                          <span className="text-stone-400">•</span>
                          <span className="text-stone-500 dark:text-stone-400">{post.views || 0} visitas</span>
                        </div>

                        <h4 className="font-serif text-lg font-medium text-stone-900 dark:text-stone-100">
                          {post.title}
                        </h4>

                        <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-1 max-w-2xl">
                          {post.excerpt}
                        </p>

                        <div className="flex items-center gap-1.5 pt-1">
                          {post.tags.map(t => (
                            <span key={t} className="text-[10px] font-mono bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 px-1.5 py-0.5 rounded">
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                        <button
                          onClick={() => onViewPost(post)}
                          className="p-2 rounded-lg text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                          title="Ver en el blog"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => openEditPostForm(post)}
                          className="p-2 rounded-lg text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                          title="Editar publicación"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setPostToDelete(post)}
                          className="p-2 rounded-lg text-stone-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          title="Eliminar publicación"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {postToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center text-red-600 mb-4">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2">
              ¿Eliminar esta publicación?
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-6">
              Estás a punto de borrar permanentemente: <br />
              <strong className="text-stone-900 dark:text-stone-200 mt-1 block">
                "{postToDelete.title}"
              </strong>
              Esta acción no se puede deshacer.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setPostToDelete(null)}
                className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeletePost}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Demo Data Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="font-serif text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2">
              ¿Restaurar datos de demostración?
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-6">
              Esta opción reemplazará la lista actual con los 5 artículos de demostración iniciales con métricas de prueba.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleResetData}
                disabled={resetting}
                className="px-4 py-2 rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-xs font-medium hover:bg-stone-800 transition-colors disabled:opacity-50"
              >
                {resetting ? 'Restaurando...' : 'Restaurar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
