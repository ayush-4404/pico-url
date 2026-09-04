import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
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
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password)     errs.password = 'Password is required';
    else if (form.password.length < 8)         errs.password = 'Minimum 8 characters';
    else if (!/[A-Z]/.test(form.password))     errs.password = 'Needs an uppercase letter';
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

  const inputCls = (field) =>
    `glass-input px-4 py-2.5 ${errors[field] ? 'error' : ''}`;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-14 py-8">
      <div className="w-full max-w-sm animate-slide-up">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="text-white font-semibold text-xl flex items-center justify-center gap-2">
            <Zap className="h-4 w-4 text-accent fill-accent" /> pico.url
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-white">Create an account</h1>
          <p className="text-white/30 text-sm mt-1">Free forever. No credit card.</p>
        </div>

        {/* Glass card */}
        <div className="glass-card p-6 space-y-4" style={{ boxShadow: '0 16px 40px rgba(0,0,0,0.4)' }}>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            <div>
              <label className="block text-sm text-white/40 mb-1.5">Full name</label>
              <input type="text" value={form.name} onChange={set('name')}
                placeholder="Alex Johnson" className={inputCls('name')} />
              {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm text-white/40 mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={set('email')}
                placeholder="you@example.com" autoComplete="email" className={inputCls('email')} />
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm text-white/40 mb-1.5">Password</label>
              <input type="password" value={form.password} onChange={set('password')}
                placeholder="••••••••" autoComplete="new-password" className={inputCls('password')} />
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
              <PasswordStrength password={form.password} />
            </div>

            {apiError && (
              <div className="px-3 py-2.5 rounded-lg text-red-400 text-sm animate-fade-in"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)' }}>
                {apiError}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="glass-btn w-full py-2.5 rounded-lg gap-2 text-sm">
              {loading && <LoadingSpinner size="sm" />}
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-white/30 text-sm mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:text-accent-light transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
