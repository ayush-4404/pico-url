import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Link2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) return setError('All fields are required');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 pb-24">
      <div className="w-full max-w-sm space-y-6 animate-fade-in">
        {/* Logo Mark */}
        <div className="text-center flex flex-col items-center gap-2">
          <Link to="/" className="w-12 h-12 rounded-full border border-white/[0.08] bg-white/[0.02] flex items-center justify-center shadow-inner hover:scale-105 transition-transform">
            <Link2 className="w-5 h-5 text-blue-500" />
          </Link>
          <h1 className="text-xl font-medium tracking-tight text-white mt-1">
            PICO<span className="text-blue-500">.</span>URL
          </h1>
          <p className="text-xs font-mono uppercase tracking-widest text-zinc-500">
            Sign in to account
          </p>
        </div>

        {/* Clean card */}
        <div className="clean-card p-6 bg-[#0c0c0c]/90 space-y-4 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                autoComplete="email"
                required
                className="clean-input text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="clean-input text-xs"
              />
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-red-500/[0.08] border border-red-500/20 text-red-400 text-xs text-center animate-fade-in">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-white w-full py-2.5 text-xs font-medium"
            >
              {loading && <LoadingSpinner size="sm" />}
              <span>{loading ? 'Authenticating…' : 'Sign In'}</span>
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-zinc-500">
          Need an account?{' '}
          <Link to="/register" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
