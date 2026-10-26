import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { PostList } from './components/PostList';
import { PostDetail } from './components/PostDetail';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AboutModal } from './components/AboutModal';
import { InstructionsModal } from './components/InstructionsModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { SearchOverlay } from './components/SearchOverlay';
import { Post, AuthUser } from './types';
import { getSupabaseConfig } from './lib/supabase';
import {
  fetchPublishedPosts,
  fetchPostDetail,
  fetchTags,
  getStoredUser,
  getStoredToken,
  apiLogout,
  getStoredBookmarks,
  toggleBookmark,
} from './lib/api';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'post' | 'admin'>('home');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [tags, setTags] = useState<Record<string, number>>({});
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Auth state
  const [adminUser, setAdminUser] = useState<AuthUser | null>(getStoredUser());
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Modals state
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [instructionsModalOpen, setInstructionsModalOpen] = useState(false);
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState<boolean>(() => {
    return getSupabaseConfig().isConfigured;
  });

  // Bookmarks
  const [bookmarks, setBookmarks] = useState<string[]>(getStoredBookmarks());

  // Dark Mode state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('atelier_theme') === 'dark';
    } catch {
      return false;
    }
  });

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(current => (current === msg ? null : current));
    }, 3200);
  };

  // Sync dark mode class on document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('atelier_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('atelier_theme', 'light');
    }
  }, [darkMode]);

  // Load public posts
  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedPosts, fetchedTags] = await Promise.all([
        fetchPublishedPosts(selectedTag || undefined, searchQuery || undefined),
        fetchTags(),
      ]);
      setPosts(fetchedPosts);
      setTags(fetchedTags);
    } catch (err: any) {
      showToast('Error al conectar con la base de datos de publicaciones');
    } finally {
      setLoading(false);
    }
  }, [selectedTag, searchQuery]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Handle URL hash changes for deep linking (e.g. #post/el-elogio..., #admin)
  useEffect(() => {
    const handleHashChange = async () => {
      const hash = window.location.hash;
      if (hash.startsWith('#post/')) {
        const slug = hash.replace('#post/', '');
        try {
          const post = await fetchPostDetail(slug);
          setSelectedPost(post);
          setCurrentView('post');
        } catch {
          setCurrentView('home');
        }
      } else if (hash === '#admin') {
        if (getStoredToken() && getStoredUser()) {
          setCurrentView('admin');
        } else {
          setLoginModalOpen(true);
        }
      } else {
        setCurrentView('home');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Navigation handlers
  const handleNavigateHome = () => {
    setCurrentView('home');
    setSelectedPost(null);
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPost = async (post: Post) => {
    try {
      const fullPost = await fetchPostDetail(post.slug || post.id);
      setSelectedPost(fullPost);
      setCurrentView('post');
      window.location.hash = `#post/${post.slug}`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      showToast('No se pudo cargar el artículo');
    }
  };

  const handleOpenAdmin = () => {
    if (adminUser && getStoredToken()) {
      setCurrentView('admin');
      window.location.hash = '#admin';
    } else {
      setLoginModalOpen(true);
    }
  };

  const handleLoginSuccess = (user: AuthUser) => {
    setAdminUser(user);
    setCurrentView('admin');
    window.location.hash = '#admin';
  };

  const handleLogout = async () => {
    await apiLogout();
    setAdminUser(null);
    setCurrentView('home');
    window.location.hash = '';
    showToast('Sesión de administrador cerrada');
    loadPosts();
  };

  const handleToggleBookmark = (postId: string) => {
    toggleBookmark(postId);
    const updated = getStoredBookmarks();
    setBookmarks(updated);
    if (updated.includes(postId)) {
      showToast('Guardado en marcadores');
    } else {
      showToast('Marcador eliminado');
    }
  };

  const handleSelectTagFromDetail = (tag: string) => {
    setSelectedTag(tag);
    handleNavigateHome();
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100 transition-colors duration-200">
      
      {/* Global Header */}
      <Header
        currentView={currentView}
        onNavigateHome={handleNavigateHome}
        onOpenAdmin={handleOpenAdmin}
        onOpenAbout={() => setAboutModalOpen(true)}
        onOpenInstructions={() => setInstructionsModalOpen(true)}
        onOpenSupabase={() => setSupabaseModalOpen(true)}
        isSupabaseConfigured={isSupabaseConfigured}
        adminUser={adminUser}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        searchOpen={searchOverlayOpen}
        onToggleSearch={() => setSearchOverlayOpen(!searchOverlayOpen)}
      />

      {/* Main View Router */}
      <div className="flex-1">
        {currentView === 'home' && (
          <PostList
            posts={posts}
            selectedTag={selectedTag}
            onSelectTag={setSelectedTag}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelectPost={handleSelectPost}
            allTags={tags}
            bookmarks={bookmarks}
            onToggleBookmark={handleToggleBookmark}
            loading={loading}
          />
        )}

        {currentView === 'post' && selectedPost && (
          <PostDetail
            post={selectedPost}
            onBack={handleNavigateHome}
            isBookmarked={bookmarks.includes(selectedPost.id)}
            onToggleBookmark={handleToggleBookmark}
            onSelectTag={handleSelectTagFromDetail}
            onShowToast={showToast}
          />
        )}

        {currentView === 'admin' && adminUser && (
          <AdminDashboard
            user={adminUser}
            onLogout={handleLogout}
            onViewPost={(post) => {
              handleSelectPost(post);
            }}
            onExitToBlog={handleNavigateHome}
            onShowToast={showToast}
            onOpenSupabase={() => setSupabaseModalOpen(true)}
            isSupabaseConfigured={isSupabaseConfigured}
          />
        )}
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 px-4 py-2.5 rounded-xl shadow-xl text-xs sm:text-sm font-medium border border-stone-800 dark:border-stone-200 flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-150">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <AdminLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onShowToast={showToast}
      />

      <AboutModal
        isOpen={aboutModalOpen}
        onClose={() => setAboutModalOpen(false)}
      />

      <InstructionsModal
        isOpen={instructionsModalOpen}
        onClose={() => setInstructionsModalOpen(false)}
        onShowToast={showToast}
      />

      <SupabaseConfigModal
        isOpen={supabaseModalOpen}
        onClose={() => setSupabaseModalOpen(false)}
        onConfigChanged={() => {
          setIsSupabaseConfigured(getSupabaseConfig().isConfigured);
          loadPosts();
        }}
        onShowToast={showToast}
      />

      <SearchOverlay
        isOpen={searchOverlayOpen}
        onClose={() => setSearchOverlayOpen(false)}
        posts={posts}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectPost={handleSelectPost}
      />
    </div>
  );
}
