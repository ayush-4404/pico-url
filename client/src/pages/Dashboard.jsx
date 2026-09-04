import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Check, Trash2, BarChart2, Link as LinkIcon, Plus, Circle, CheckCircle2 } from 'lucide-react';
import { getMyUrls, deleteUrl, toggleActive } from '../api/urls';
import LoadingSpinner from '../components/LoadingSpinner';

// Tiny inline glass action button for rows
const rowBtn = 'flex items-center gap-1.5 text-xs text-white/30 hover:text-white/70 px-2.5 py-1.5 rounded-lg transition-all';
const rowBtnHover = `${rowBtn} hover:bg-white/[0.06]`;

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} title="Copy short URL"
      className="p-1.5 rounded-lg hover:bg-white/[0.08] text-white/30 hover:text-white transition-all">
      {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

function DeleteConfirm({ onConfirm, onCancel, loading }) {
  return (
    <div className="flex items-center gap-2 animate-fade-in">
      <span className="text-xs text-white/30">Delete this link?</span>
      <button onClick={onConfirm} disabled={loading}
        className="glass-btn px-2.5 py-1 text-xs rounded-md gap-1"
        style={{ background: 'rgba(239,68,68,0.18)', borderColor: 'rgba(239,68,68,0.30)', color: '#fca5a5' }}>
        {loading && <LoadingSpinner size="sm" />} Confirm
      </button>
      <button onClick={onCancel} className="text-xs text-white/30 hover:text-white/60 px-2 py-1 rounded transition-colors">
        Cancel
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
      <div className="p-4 glass-card mb-5 inline-block">
        <LinkIcon className="h-8 w-8 text-white/20" />
      </div>
      <h3 className="text-white font-medium text-lg mb-1">No links yet</h3>
      <p className="text-white/30 text-sm mb-6">Shorten your first URL to get started.</p>
      <Link to="/" className="glass-btn text-sm px-5 py-2.5 rounded-lg gap-2">
        <Plus className="h-4 w-4" /> Create a link
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
    } catch { setError('Failed to load your links. Please refresh.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUrls(); }, [fetchUrls]);

  const handleToggle = async (shortId, currentState) => {
    setTogglingId(shortId);
    try {
      await toggleActive(shortId, !currentState);
      setUrls((prev) => prev.map((u) => u.shortId === shortId ? { ...u, isActive: !currentState } : u));
    } catch { /* silent */ }
    finally { setTogglingId(null); }
  };

  const handleDelete = async (shortId) => {
    setDeleteLoading(shortId);
    try {
      await deleteUrl(shortId);
      setUrls((prev) => prev.filter((u) => u.shortId !== shortId));
      setDeletingId(null);
    } catch { /* silent */ }
    finally { setDeleteLoading(null); }
  };

  return (
    <div className="min-h-screen pt-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">My Links</h1>
            <p className="text-white/30 text-sm mt-0.5">
              {urls.length > 0 ? `${urls.length} link${urls.length !== 1 ? 's' : ''}` : 'Manage all your shortened URLs'}
            </p>
          </div>
          <Link to="/" className="glass-btn text-sm px-4 py-2 rounded-lg gap-2">
            <Plus className="h-4 w-4" /> New Link
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-24"><LoadingSpinner size="lg" /></div>
        ) : error ? (
          <div className="text-center py-16 text-red-400">{error}</div>
        ) : urls.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-2.5 animate-fade-in">
            {urls.map((url) => {
              const shortUrl  = `${baseUrl}/${url.shortId}`;
              const isExpired = url.expiresAt && new Date(url.expiresAt) < new Date();

              return (
                <div key={url.shortId}
                  className={`glass-card px-5 py-4 transition-all ${!url.isActive || isExpired ? 'opacity-50' : 'hover:border-white/[0.20]'}`}
                  style={{ borderRadius: '10px' }}>

                  {/* Top row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <a href={shortUrl} target="_blank" rel="noopener noreferrer"
                          className="text-accent font-medium hover:underline text-sm truncate">
                          {shortUrl}
                        </a>
                        <CopyButton text={shortUrl} />
                        {isExpired && (
                          <span className="text-xs px-2 py-0.5 rounded-full text-white/30"
                            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)' }}>
                            Expired
                          </span>
                        )}
                        {!url.isActive && !isExpired && (
                          <span className="text-xs px-2 py-0.5 rounded-full text-white/30"
                            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)' }}>
                            Disabled
                          </span>
                        )}
                      </div>
                      <p className="text-white/25 text-xs mt-1 truncate max-w-md" title={url.redirectUrl}>
                        {url.redirectUrl}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-white font-medium text-sm">{url.visitHistory?.length ?? 0}</span>
                      <span className="text-white/25 text-xs">clicks</span>
                    </div>
                  </div>

                  {/* Bottom row */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-white/20">
                      <span>Created {new Date(url.createdAt).toLocaleDateString()}</span>
                      {url.expiresAt && (
                        <span className={isExpired ? 'text-red-400/70' : ''}>
                          {isExpired ? 'Expired' : 'Expires'} {new Date(url.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-0.5">
                      <Link to={`/analytics/${url.shortId}`} className={rowBtnHover}>
                        <BarChart2 className="h-3.5 w-3.5" /> Analytics
                      </Link>

                      <button onClick={() => handleToggle(url.shortId, url.isActive)}
                        disabled={togglingId === url.shortId}
                        className={`${rowBtnHover} disabled:opacity-50`}>
                        {togglingId === url.shortId ? <LoadingSpinner size="sm" />
                          : url.isActive ? <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                          : <Circle className="h-3.5 w-3.5" />}
                        {url.isActive ? 'Active' : 'Inactive'}
                      </button>

                      {deletingId === url.shortId ? (
                        <DeleteConfirm onConfirm={() => handleDelete(url.shortId)}
                          onCancel={() => setDeletingId(null)} loading={deleteLoading === url.shortId} />
                      ) : (
                        <button onClick={() => setDeletingId(url.shortId)}
                          className={`${rowBtn} hover:text-red-400/80 hover:bg-red-500/[0.06]`}>
                          <Trash2 className="h-3.5 w-3.5" /> Delete
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
