import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link2, Zap, BarChart2, Lock, Scissors, Pencil, Copy, Check, ExternalLink, Clock } from 'lucide-react';
import { createUrl } from '../api/urls';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Landing() {
  const [url, setUrl]             = useState('');
  const [alias, setAlias]         = useState('');
  const [showAlias, setShowAlias] = useState(false);
  const [result, setResult]       = useState(null);
  const [copied, setCopied]       = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCopy = async () => {
    if (!result?.shortUrl) return;
    await navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const res = await createUrl({
        url: url.trim(),
        customAlias: (showAlias && alias.trim()) ? alias.trim() : undefined,
      });
      setResult(res.data);
      setUrl('');
      setAlias('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to shorten URL. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen max-h-screen flex flex-col justify-center pt-14 pb-16 px-4 overflow-y-auto sm:overflow-hidden">
      {/* ── Main Hero Content ────────────────────────────────────────── */}
      <main className="w-full max-w-lg mx-auto flex flex-col items-center justify-center text-center animate-fade-in my-auto py-2">

        {/* 1. Logo Mark (Circle + Icon + Name + Tagline) */}
        <div className="flex flex-col items-center gap-2.5 mb-6">
          <div className="w-16 h-16 rounded-full border border-white/[0.08] bg-white/[0.02] flex items-center justify-center shadow-inner">
            <Link2 className="w-6 h-6 text-blue-500 stroke-[2.2]" />
          </div>

          <h1 className="text-3xl font-medium tracking-tight text-[#f9fafb]">
            PICO<span className="text-blue-500">.</span>URL
          </h1>

          <p className="text-[11px] uppercase tracking-[0.14em] font-mono text-[#4b5563]">
            Shorten · Track · Share
          </p>
        </div>

        {/* 2. Feature Badges (Fast, Analytics, Secure) */}
        <div className="flex items-center justify-center gap-7 sm:gap-9 mb-8">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-center text-[#4b5563] hover:text-zinc-300 hover:border-white/[0.12] transition-colors">
              <Zap className="w-4 h-4" />
            </div>
            <span className="text-[9px] uppercase tracking-[0.12em] font-medium text-[#4b5563]">Fast</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-center text-[#4b5563] hover:text-zinc-300 hover:border-white/[0.12] transition-colors">
              <BarChart2 className="w-4 h-4" />
            </div>
            <span className="text-[9px] uppercase tracking-[0.12em] font-medium text-[#4b5563]">Analytics</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-center text-[#4b5563] hover:text-zinc-300 hover:border-white/[0.12] transition-colors">
              <Lock className="w-4 h-4" />
            </div>
            <span className="text-[9px] uppercase tracking-[0.12em] font-medium text-[#4b5563]">Secure</span>
          </div>
        </div>

        {/* 3. Input Form Section */}
        <div className="w-full max-w-[420px] space-y-3">
          <form onSubmit={handleSubmit} className="space-y-2.5">
            {/* Main Long URL input */}
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste your long URL here..."
              required
              className="clean-input"
            />

            {/* Custom alias input (toggled) */}
            {showAlias && (
              <div className="animate-slide-down flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                <span className="text-[11px] font-mono text-zinc-500 whitespace-nowrap">pico.url/</span>
                <input
                  type="text"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="custom-name"
                  className="w-full bg-transparent text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none font-mono"
                />
              </div>
            )}

            {/* Action Buttons Row */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="btn-white flex-1 py-2.5"
              >
                {loading ? <LoadingSpinner size="sm" /> : <Scissors className="w-3.5 h-3.5" />}
                <span>{loading ? 'Shortening…' : 'Shorten'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAlias(!showAlias)}
                className={`btn-secondary py-2.5 px-3.5 ${showAlias ? 'border-blue-500/40 text-blue-400 bg-blue-500/[0.05]' : ''}`}
                title="Toggle custom alias"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Custom alias</span>
              </button>
            </div>
          </form>

          {/* Sub-hint caption */}
          <div className="text-[10px] tracking-[0.12em] uppercase font-mono text-[#374151]">
            YOU PASTE. WE SHORTEN.
          </div>

          {/* Error display */}
          {error && (
            <div className="p-2.5 rounded-lg bg-red-500/[0.08] border border-red-500/20 text-red-400 text-xs animate-fade-in text-center">
              {error}
            </div>
          )}

          {/* 4. Shortened URL Result Card */}
          {result && (
            <div className="mt-4 p-4 clean-card text-left space-y-3 animate-slide-up border-white/[0.12] bg-[#0e0e0e]">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                <span>Short Link Ready</span>
                <span className="flex items-center gap-1 text-emerald-400">● Active</span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={result.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-sm font-mono text-blue-400 hover:underline truncate"
                >
                  {result.shortUrl}
                </a>

                <button
                  onClick={handleCopy}
                  className="btn-secondary py-1.5 px-3 text-xs gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <a
                  href={result.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] text-zinc-400 hover:text-white transition-colors"
                  title="Open URL"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {result.expiresAt && (
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono">
                  <Clock className="w-3 h-3" />
                  <span>Expires: {new Date(result.expiresAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
