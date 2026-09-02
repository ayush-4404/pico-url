import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
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
    <button onClick={copy} title="Copy short URL" className="p-1.5 rounded hover:bg-zinc-700 text-zinc-500 hover:text-white transition-all text-xs">
      {copied ? '✓' : '⎘'}
    </button>
  );
}

function DeleteConfirm({ shortId, onConfirm, onCancel, loading }) {
  return (
    <div className="flex items-center gap-2 animate-fade-in">
      <span className="text-xs text-zinc-400">Delete this link?</span>
      <button
        onClick={onConfirm}
        disabled={loading}
        className="px-2.5 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded-md transition-all flex items-center gap-1 disabled:opacity-50"
      >
        {loading && <LoadingSpinner size="sm" />}
        Confirm
      </button>
      <button
        onClick={onCancel}
        className="px-2.5 py-1 text-xs text-zinc-400 hover:text-white rounded-md transition-colors"
      >
        Cancel
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
      <div className="text-6xl mb-4">🔗</div>
      <h3 className="text-white font-medium text-lg mb-1">No links yet</h3>
      <p className="text-zinc-500 text-sm mb-6">Shorten your first URL to get started.</p>
      <Link
        to="/"
        className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-all"
      >
        Create a link →
      </Link>
    </div>
  );
}

export default function Dashboard() {
  const [urls, setUrls]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [deletingId, setDeletingId] = useState(null);   // shortId confirming delete
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const fetchUrls = useCallback(async () => {
    try {
      setError('');
      const res = await getMyUrls();
      setUrls(res.data.urls);
    } catch {
      setError('Failed to load your links. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUrls(); }, [fetchUrls]);

  const handleToggle = async (shortId, currentState) => {
    setTogglingId(shortId);
    try {
      await toggleActive(shortId, !currentState);
      setUrls((prev) =>
        prev.map((u) => u.shortId === shortId ? { ...u, isActive: !currentState } : u)
      );
    } catch {
      // silently fail, could add toast here
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
      // silently fail
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">My Links</h1>
            <p className="text-zinc-500 text-sm mt-0.5">
              {urls.length > 0 ? `${urls.length} link${urls.length !== 1 ? 's' : ''}` : 'Manage all your shortened URLs'}
            </p>
          </div>
          <Link
            to="/"
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-all"
          >
            + New Link
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-24">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-400">{error}</div>
        ) : urls.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3 animate-fade-in">
            {urls.map((url) => {
              const shortUrl = `${baseUrl}/${url.shortId}`;
              const isExpired = url.expiresAt && new Date(url.expiresAt) < new Date();

              return (
                <div
                  key={url.shortId}
                  className={`group bg-zinc-900 border rounded-xl px-5 py-4 transition-all ${
                    url.isActive && !isExpired ? 'border-zinc-800 hover:border-zinc-700' : 'border-zinc-800/50 opacity-60'
                  }`}
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <a
                          href={shortUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent font-medium hover:underline text-sm truncate"
                        >
                          {shortUrl}
                        </a>
                        <CopyButton text={shortUrl} />

                        {/* Status badges */}
                        {isExpired && (
                          <span className="text-xs px-2 py-0.5 bg-zinc-800 text-zinc-500 rounded-full">Expired</span>
                        )}
                        {!url.isActive && !isExpired && (
                          <span className="text-xs px-2 py-0.5 bg-zinc-800 text-zinc-500 rounded-full">Disabled</span>
                        )}
                      </div>

                      <p className="text-zinc-500 text-xs mt-1 truncate max-w-md" title={url.redirectUrl}>
                        → {url.redirectUrl}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-1 text-zinc-400 text-sm flex-shrink-0">
                      <span className="text-white font-medium">
                        {url.visitHistory?.length ?? 0}
                      </span>
                      <span className="text-zinc-600 text-xs">clicks</span>
                    </div>
                  </div>

                  {/* Bottom row */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-zinc-600">
                      <span>Created {new Date(url.createdAt).toLocaleDateString()}</span>
                      {url.expiresAt && (
                        <span className={isExpired ? 'text-red-500' : ''}>
                          {isExpired ? 'Expired' : 'Expires'} {new Date(url.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Analytics */}
                      <Link
                        to={`/analytics/${url.shortId}`}
                        className="text-xs text-zinc-500 hover:text-zinc-300 px-2.5 py-1 rounded-md hover:bg-zinc-800 transition-all"
                      >
                        Analytics ↗
                      </Link>

                      {/* Toggle active */}
                      <button
                        onClick={() => handleToggle(url.shortId, url.isActive)}
                        disabled={togglingId === url.shortId}
                        className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 px-2.5 py-1 rounded-md hover:bg-zinc-800 transition-all disabled:opacity-50"
                      >
                        {togglingId === url.shortId
                          ? <LoadingSpinner size="sm" />
                          : <span className={`h-2 w-2 rounded-full ${url.isActive ? 'bg-green-500' : 'bg-zinc-600'}`} />
                        }
                        {url.isActive ? 'Active' : 'Inactive'}
                      </button>

                      {/* Delete */}
                      {deletingId === url.shortId ? (
                        <DeleteConfirm
                          shortId={url.shortId}
                          onConfirm={() => handleDelete(url.shortId)}
                          onCancel={() => setDeletingId(null)}
                          loading={deleteLoading === url.shortId}
                        />
                      ) : (
                        <button
                          onClick={() => setDeletingId(url.shortId)}
                          className="text-xs text-zinc-600 hover:text-red-400 px-2.5 py-1 rounded-md hover:bg-zinc-800 transition-all"
                        >
                          Delete
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
