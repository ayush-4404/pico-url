import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Copy, Check, ArrowRight, Plus, Minus, Zap, Clock } from 'lucide-react';
import { createUrl } from '../api/urls';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="glass-btn flex-shrink-0 text-sm px-4 py-2 rounded-lg gap-1.5">
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

export default function Landing() {
  const [url, setUrl]             = useState('');
  const [alias, setAlias]         = useState('');
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [showAlias, setShowAlias]   = useState(false);
  const [showExpiry, setShowExpiry] = useState(false);
  const [expiryOption, setExpiryOption] = useState('7d'); // '24h', '7d', '30d', 'custom'
  const [customExpiry, setCustomExpiry] = useState('');

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    if (!url.trim()) return setError('Please enter a URL');
    if (!isAuthenticated) { navigate('/login'); return; }

    let expiresAt = undefined;
    if (showExpiry) {
      const now = new Date();
      if (expiryOption === '24h') {
        expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
      } else if (expiryOption === '7d') {
        expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      } else if (expiryOption === '30d') {
        expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
      } else if (expiryOption === 'custom') {
        if (!customExpiry) {
          return setError('Please choose an expiration date and time');
        }
        const selected = new Date(customExpiry);
        if (selected <= now) {
          return setError('Expiration date must be in the future');
        }
        expiresAt = selected.toISOString();
      }
    }

    setLoading(true);
    try {
      const res = await createUrl({
        url: url.trim(),
        customAlias: alias.trim() || undefined,
        expiresAt,
      });
      setResult(res.data);
      setUrl('');
      setAlias('');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-24 pb-16">
        <div className="w-full max-w-2xl animate-slide-up">

          {/* Badge */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 text-xs font-medium text-accent bg-accent-subtle border border-accent/20 px-3 py-1 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              Fast · Minimal · Open
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-center text-4xl sm:text-5xl font-bold text-white mb-3 leading-tight">
            Shorten any link.<br />
            <span className="text-accent">Track every click.</span>
          </h1>
          <p className="text-center text-white/40 text-lg mb-10">
            Clean, fast URL shortener with real-time analytics.
          </p>

          {/* Input form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste your long URL here..."
                className="glass-input flex-1 h-13 px-4 py-3.5 text-base"
              />
              <button
                type="submit"
                disabled={loading}
                className="glass-btn px-6 py-3.5 rounded-xl gap-2 whitespace-nowrap text-sm"
                style={{ boxShadow: '0 0 24px rgba(147,197,253,0.12)' }}
              >
                {loading ? <LoadingSpinner size="sm" /> : <ArrowRight className="h-4 w-4" />}
                {loading ? 'Shortening…' : 'Shorten'}
              </button>
            </div>

            {/* Options toggles */}
            <div className="flex items-center gap-4 pt-1">
              <button
                type="button"
                onClick={() => setShowAlias(!showAlias)}
                className="flex items-center gap-1 text-xs text-white/40 hover:text-white/80 transition-colors"
              >
                {showAlias ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                {showAlias ? 'Remove' : 'Add'} custom alias
              </button>

              <button
                type="button"
                onClick={() => setShowExpiry(!showExpiry)}
                className="flex items-center gap-1 text-xs text-white/40 hover:text-white/80 transition-colors"
              >
                {showExpiry ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                {showExpiry ? 'Remove' : 'Set'} expiration
              </button>
            </div>

            {/* Custom alias input */}
            {showAlias && (
              <div className="animate-slide-down flex items-center gap-2">
                <span className="text-white/30 text-sm whitespace-nowrap">pico.url/</span>
                <input
                  type="text"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="my-brand"
                  className="glass-input flex-1 px-4 py-2.5"
                />
              </div>
            )}

            {/* Expiration options */}
            {showExpiry && (
              <div className="animate-slide-down p-3.5 glass-card space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-white/70 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-accent" /> Link Expiration
                  </span>
                  <span className="text-[11px] text-white/30">Auto-deactivates after expiry</span>
                </div>

                {/* Preset pills */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: '24h', label: '24 Hours' },
                    { id: '7d', label: '7 Days' },
                    { id: '30d', label: '30 Days' },
                    { id: 'custom', label: 'Custom' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setExpiryOption(opt.id)}
                      className={`py-1.5 text-xs rounded-lg transition-all border ${
                        expiryOption === opt.id
                          ? 'bg-accent/20 border-accent/60 text-white font-medium shadow-[0_0_12px_rgba(147,197,253,0.15)]'
                          : 'bg-white/[0.04] border-white/10 text-white/50 hover:text-white hover:bg-white/[0.08]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Custom date-time input */}
                {expiryOption === 'custom' && (
                  <div className="animate-fade-in pt-1">
                    <input
                      type="datetime-local"
                      value={customExpiry}
                      min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                      onChange={(e) => setCustomExpiry(e.target.value)}
                      className="glass-input px-3 py-2 text-xs"
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>
                )}
              </div>
            )}

            {error && <p className="text-red-400 text-sm animate-fade-in">{error}</p>}
          </form>

          {/* Result */}
          {result && (
            <div className="mt-6 p-4 glass-card animate-slide-up"
              style={{ borderColor: 'rgba(147,197,253,0.22)', boxShadow: '0 0 32px rgba(147,197,253,0.08)' }}>
              <p className="text-xs text-white/30 mb-2 uppercase tracking-widest">Your short link</p>
              <div className="flex items-center gap-3">
                <a href={result.shortUrl} target="_blank" rel="noopener noreferrer"
                  className="flex-1 text-accent font-medium text-lg hover:underline truncate">
                  {result.shortUrl}
                </a>
                <CopyButton text={result.shortUrl} />
              </div>
              {result.expiresAt && (
                <p className="mt-2 text-xs text-white/40 flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-accent" />
                  Expires: {new Date(result.expiresAt).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>
      </main>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        className="py-6 text-center text-white/20 text-sm flex items-center justify-center gap-1.5">
        <Zap className="h-3.5 w-3.5 text-accent fill-accent" />
        <span>Pico URL</span>
      </footer>
    </div>
  );
}
