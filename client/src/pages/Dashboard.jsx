import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Check, Trash2, BarChart2, Link2, Plus, Circle, CheckCircle2, ExternalLink } from 'lucide-react';
import { getMyUrls, deleteUrl, toggleActive } from '../api/urls';
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
      title="Copy short URL"
      className="p-1 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.05] transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function DeleteConfirm({ onConfirm, onCancel, loading }) {
  return (
    <div className="flex items-center gap-2 animate-fade-in">
      <span className="text-xs text-zinc-400">Delete this link?</span>
      <button
        onClick={onConfirm}
        disabled={loading}
        className="px-2.5 py-1 text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30 rounded-md hover:bg-red-500/30 transition-colors flex items-center gap-1"
      >
        {loading && <LoadingSpinner size="sm" />}
        Confirm
      </button>
      <button
        onClick={onCancel}
        className="px-2 py-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
      >
        Cancel
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in clean-card border-dashed">
      <div className="w-12 h-12 rounded-full bg-white/[0.02] border border-white/[0.06] flex items-center justify-center text-zinc-500 mb-3">
        <Link2 className="w-5 h-5" />
      </div>
      <h3 className="text-zinc-200 font-medium text-sm mb-1">No links created yet</h3>
      <p className="text-zinc-500 text-xs mb-5">Shorten your first URL to start tracking visits.</p>
      <Link to="/" className="btn-white text-xs">
        <Plus className="w-3.5 h-3.5" />
        <span>Create link</span>
      </Link>
    </div>
  );
}

export default function Dashboard() {
  const [urls, setUrls]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const fetchUrls = useCallback(async () => {
    try {
      setError('');
      const res = await getMyUrls();
      setUrls(res.data.urls);
    } catch {
      setError('Failed to load links. Please check server connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUrls();
  }, [fetchUrls]);

  const handleToggle = async (shortId, currentState) => {
    setTogglingId(shortId);
    try {
      await toggleActive(shortId, !currentState);
      setUrls((prev) =>
        prev.map((u) => (u.shortId === shortId ? { ...u, isActive: !currentState } : u))
      );
    } catch {
      /* silent */
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (shortId) => {
    setDeleteLoading(shortId);
    try {
      await deleteUrl(shortId);
      setUrls((prev) => prev.filter((u) => u.shortId !== shortId));
      setDeletingId(null);
    } catch {
      /* silent */
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-24 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-medium tracking-tight text-[#f9fafb]">Dashboard</h1>
            <p className="text-xs text-zinc-500 mt-0.5 font-mono uppercase tracking-wider">
              {urls.length > 0 ? `${urls.length} link${urls.length !== 1 ? 's' : ''}` : 'Manage links'}
            </p>
          </div>
          <Link to="/" className="btn-white text-xs py-2 px-3.5">
            <Plus className="w-3.5 h-3.5" />
            <span>New Link</span>
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-24">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-red-500/[0.08] border border-red-500/20 text-red-400 text-xs text-center">
            {error}
          </div>
        ) : urls.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-2.5">
            {urls.map((url) => {
              const shortUrl = `${baseUrl}/${url.shortId}`;
              const isExpired = url.expiresAt && new Date(url.expiresAt) < new Date();

              return (
                <div
                  key={url.shortId}
                  className={`clean-card p-4 transition-all bg-[#0c0c0c]/80 ${
                    !url.isActive || isExpired ? 'opacity-50' : 'hover:border-white/[0.14]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <a
                          href={shortUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-mono text-blue-400 hover:underline truncate"
                        >
                          {shortUrl}
                        </a>
                        <CopyButton text={shortUrl} />

                        {isExpired && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-white/[0.05] text-zinc-500 font-mono">
                            Expired
                          </span>
                        )}
                        {!url.isActive && !isExpired && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-white/[0.05] text-zinc-500 font-mono">
                            Disabled
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-zinc-500 truncate max-w-md" title={url.redirectUrl}>
                        {url.redirectUrl}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-mono font-medium text-zinc-200">
                        {url.visitHistory?.length ?? 0}
                      </div>
                      <div className="text-[10px] text-zinc-600 uppercase font-mono tracking-wider">
                        clicks
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs">
                    <div className="text-[11px] text-zinc-500 font-mono">
                      {new Date(url.createdAt).toLocaleDateString()}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Link
                        to={`/analytics/${url.shortId}`}
                        className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.05] transition-colors flex items-center gap-1 text-xs"
                      >
                        <BarChart2 className="w-3.5 h-3.5" />
                        <span>Analytics</span>
                      </Link>

                      <button
                        onClick={() => handleToggle(url.shortId, url.isActive)}
                        disabled={togglingId === url.shortId}
                        className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.05] transition-colors flex items-center gap-1 text-xs disabled:opacity-50"
                      >
                        {togglingId === url.shortId ? (
                          <LoadingSpinner size="sm" />
                        ) : url.isActive ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Circle className="w-3.5 h-3.5" />
                        )}
                        <span>{url.isActive ? 'Active' : 'Paused'}</span>
                      </button>

                      {deletingId === url.shortId ? (
                        <DeleteConfirm
                          onConfirm={() => handleDelete(url.shortId)}
                          onCancel={() => setDeletingId(null)}
                          loading={deleteLoading === url.shortId}
                        />
                      ) : (
                        <button
                          onClick={() => setDeletingId(url.shortId)}
                          className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/[0.06] transition-colors"
                          title="Delete link"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
