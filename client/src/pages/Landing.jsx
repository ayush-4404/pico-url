import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Copy, Check, ArrowRight, Plus, Minus, Zap } from 'lucide-react';
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
    <button
      onClick={copy}
      className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-sm font-medium transition-all"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

export default function Landing() {
  const [url, setUrl]         = useState('');
  const [alias, setAlias]     = useState('');
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showAlias, setShowAlias] = useState(false);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!url.trim()) return setError('Please enter a URL');

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const res = await createUrl({ url: url.trim(), customAlias: alias.trim() || undefined });
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
          <p className="text-center text-zinc-400 text-lg mb-10">
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
                className="flex-1 h-13 px-4 py-3.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-base"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3.5 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap"
              >
                {loading ? <LoadingSpinner size="sm" /> : <ArrowRight className="h-4 w-4" />}
                {loading ? 'Shortening…' : 'Shorten'}
              </button>
            </div>

            {/* Custom alias toggle */}
            <div>
              <button
                type="button"
                onClick={() => setShowAlias(!showAlias)}
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showAlias
                  ? <Minus className="h-3 w-3" />
                  : <Plus className="h-3 w-3" />
                }
                {showAlias ? 'Remove' : 'Add'} custom alias
              </button>
            </div>

            {showAlias && (
              <div className="animate-slide-down flex items-center gap-2">
                <span className="text-zinc-500 text-sm whitespace-nowrap">pico.url/</span>
                <input
                  type="text"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="my-brand"
                  className="flex-1 px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm"
                />
              </div>
            )}

            {error && (
              <p className="text-red-400 text-sm animate-fade-in">{error}</p>
            )}
          </form>

          {/* Result */}
          {result && (
            <div className="mt-6 p-4 rounded-xl bg-zinc-900/70 backdrop-blur-xl border border-zinc-700 animate-slide-up">
              <p className="text-xs text-zinc-500 mb-2 uppercase tracking-widest">Your short link</p>
              <div className="flex items-center gap-3">
                <a
                  href={result.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-accent font-medium text-lg hover:underline truncate"
                >
                  {result.shortUrl}
                </a>
                <CopyButton text={result.shortUrl} />
              </div>
              {result.expiresAt && (
                <p className="mt-2 text-xs text-zinc-500">
                  Expires: {new Date(result.expiresAt).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-6 text-center text-zinc-600 text-sm flex items-center justify-center gap-1.5">
        <Zap className="h-3.5 w-3.5 text-accent fill-accent" />
        <span>Pico URL</span>
      </footer>
    </div>
  );
}
