import React, { useState } from 'react';
import { Shield, Lock, User, Eye, EyeOff, X, KeyRound, AlertCircle, Sparkles } from 'lucide-react';
import { apiLogin, setStoredAuth } from '../lib/api';
import { AuthUser } from '../types';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
  onShowToast: (msg: string) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onShowToast,
}) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await apiLogin(username.trim(), password);
      if (res.success && res.token && res.user) {
        setStoredAuth(res.token, res.user);
        onLoginSuccess(res.user);
        onShowToast('¡Sesión iniciada con éxito!');
        onClose();
      } else {
        setErrorMessage(res.error || 'Credenciales inválidas. Usa admin / admin');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const fillDefaults = () => {
    setUsername('admin');
    setPassword('admin');
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-md shadow-2xl p-6 sm:p-8 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          title="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-stone-100 dark:bg-stone-800 rounded-2xl flex items-center justify-center mx-auto mb-3 text-stone-900 dark:text-stone-100">
            <Shield className="w-6 h-6 text-stone-800 dark:text-stone-200" />
          </div>
          <h2 className="font-serif text-2xl font-semibold text-stone-900 dark:text-stone-100">
            Acceso al Panel de Administración
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Gestiona tus artículos, crea nuevas publicaciones y analiza lecturas.
          </p>
        </div>

        {/* Default credentials banner */}
        <div className="mb-5 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 rounded-xl p-3 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
          <KeyRound className="w-4 h-4 shrink-0 mt-0.5 text-amber-700 dark:text-amber-400" />
          <div className="flex-1">
            <span className="font-medium block mb-0.5">Credenciales requeridas por defecto:</span>
            <div className="font-mono text-[11px] flex items-center justify-between">
              <span>Usuario: <strong className="bg-white/60 dark:bg-black/40 px-1 py-0.5 rounded">admin</strong> | Clave: <strong className="bg-white/60 dark:bg-black/40 px-1 py-0.5 rounded">admin</strong></span>
              <button
                type="button"
                onClick={fillDefaults}
                className="underline hover:text-amber-950 dark:hover:text-white font-sans text-[11px] font-semibold"
              >
                Autocompletar
              </button>
            </div>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mb-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 rounded-xl p-3 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5 font-mono">
              Usuario
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 dark:focus:ring-stone-600 transition-all font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5 font-mono">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 dark:focus:ring-stone-600 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 font-medium text-sm hover:bg-stone-800 dark:hover:bg-stone-200 transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-stone-400 border-t-stone-100 dark:border-stone-600 dark:border-t-stone-900 rounded-full animate-spin" />
            ) : (
              <>
                <span>Ingresar al panel</span>
                <Sparkles className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 text-center text-[11px] text-stone-400">
          Autenticación básica por token seguro con persistencia de sesión.
        </div>
      </div>
    </div>
  );
};
