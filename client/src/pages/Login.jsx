import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
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
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-14">
      <div className="w-full max-w-sm animate-slide-up">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="text-white font-semibold text-xl flex items-center justify-center gap-2">
            <Zap className="h-4 w-4 text-accent fill-accent" /> pico.url
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-white/30 text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Glass card */}
        <div className="glass-card p-6 space-y-4" style={{ boxShadow: '0 16px 40px rgba(0,0,0,0.4)' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-white/40 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="glass-input px-4 py-2.5"
              />
            </div>
            <div>
              <label className="block text-sm text-white/40 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="glass-input px-4 py-2.5"
              />
            </div>

            {error && (
              <div className="px-3 py-2.5 rounded-lg text-red-400 text-sm animate-fade-in"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="glass-btn w-full py-2.5 rounded-lg gap-2 text-sm">
              {loading && <LoadingSpinner size="sm" />}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-white/30 text-sm mt-4">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent hover:text-accent-light transition-colors">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
