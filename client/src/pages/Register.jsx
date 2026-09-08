import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Link2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import PasswordStrength from '../components/PasswordStrength';

export default function Register() {
  const [form, setForm]         = useState({ name: '', email: '', password: '' });
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]   = useState(false);

  const { register } = useAuth();
  const navigate     = useNavigate();

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim())  errs.name     = 'Name is required';
    if (!form.email.trim()) errs.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email address';
    if (!form.password)     errs.password = 'Password is required';
    else if (form.password.length < 8)         errs.password = 'At least 8 characters required';
    else if (!/[A-Z]/.test(form.password))     errs.password = 'At least one uppercase letter required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.error || 'Registration failed. Please try again.');
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
            Create free account
          </p>
        </div>

        {/* Clean card */}
        <div className="clean-card p-6 bg-[#0c0c0c]/90 space-y-4 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={set('name')}
                placeholder="Alex Morgan"
                required
                className="clean-input text-xs"
              />
              {errors.name && <p className="text-[11px] text-red-400 font-mono">{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="you@domain.com"
                autoComplete="email"
                required
                className="clean-input text-xs"
              />
              {errors.email && <p className="text-[11px] text-red-400 font-mono">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={set('password')}
                placeholder="••••••••"
                autoComplete="new-password"
                required
                className="clean-input text-xs"
              />
              {errors.password && <p className="text-[11px] text-red-400 font-mono">{errors.password}</p>}
              <PasswordStrength password={form.password} />
            </div>

            {apiError && (
              <div className="p-2.5 rounded-lg bg-red-500/[0.08] border border-red-500/20 text-red-400 text-xs text-center animate-fade-in">
                {apiError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-white w-full py-2.5 text-xs font-medium"
            >
              {loading && <LoadingSpinner size="sm" />}
              <span>{loading ? 'Creating account…' : 'Create Account'}</span>
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-zinc-500">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
