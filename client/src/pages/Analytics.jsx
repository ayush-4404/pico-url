import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart2, ExternalLink, Clock, ShieldCheck, Globe } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getAnalytics } from '../api/urls';
import LoadingSpinner from '../components/LoadingSpinner';

function StatCard({ label, value, sub }) {
  return (
    <div className="clean-card p-4 bg-[#0d0d0d]/80">
      <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-500 mb-1">{label}</p>
      <p className="text-xl sm:text-2xl font-medium tracking-tight text-white">{value}</p>
      {sub && <p className="text-[11px] text-zinc-500 font-mono mt-1">{sub}</p>}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="clean-card px-3 py-2 text-xs bg-[#111111]/95 border-white/10 shadow-xl">
      <p className="text-zinc-500 font-mono mb-0.5">{label}</p>
      <p className="text-white font-medium">{payload[0].value} click{payload[0].value !== 1 ? 's' : ''}</p>
    </div>
  );
}

function groupByDay(visitHistory) {
  const map = {};
  visitHistory.forEach(({ timeStamp }) => {
    const day = new Date(timeStamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    map[day] = (map[day] || 0) + 1;
  });
  return Object.entries(map)
    .map(([date, clicks]) => ({ date, clicks }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

export default function Analytics() {
  const { shortId } = useParams();
  const navigate    = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    async function load() {
      try {
        const res = await getAnalytics(shortId);
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load analytics.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [shortId]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-red-400 text-xs font-mono">{error}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-secondary text-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </button>
      </div>
    );
  }

  const chartData = groupByDay(data.visitHistory);
  const shortUrl  = `${baseUrl}/${data.shortId}`;
  const last7     = chartData.slice(-7).reduce((s, d) => s + d.clicks, 0);

  return (
    <div className="min-h-screen pt-20 pb-24 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        {/* Top bar back */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="nav-pill"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Back</span>
          </button>
          <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
            Link Analytics
          </span>
        </div>

        {/* URL Header info */}
        <div className="clean-card p-4 bg-[#0d0d0d]/80 space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-mono font-medium text-white truncate">
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline inline-flex items-center gap-1.5"
              >
                {shortUrl}
                <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
              </a>
            </h1>
          </div>
          <p className="text-xs text-zinc-500 truncate" title={data.redirectUrl}>
            → {data.redirectUrl}
          </p>
        </div>

        {/* Stats 4-card grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <StatCard label="Total Clicks" value={data.totalClicks} />
          <StatCard label="Last 7 Days" value={last7} />
          <StatCard
            label="Created"
            value={new Date(data.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          />
          <StatCard
            label="Status"
            value={data.isActive ? 'Active' : 'Paused'}
            sub={data.expiresAt ? `Exp: ${new Date(data.expiresAt).toLocaleDateString()}` : 'No expiration'}
          />
        </div>

        {/* Chart Card */}
        <div className="clean-card p-5 bg-[#0d0d0d]/80 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono uppercase tracking-[0.14em] text-zinc-400">Clicks over time</h2>
            <span className="text-[10px] font-mono text-zinc-600">Daily frequency</span>
          </div>

          {chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-44 text-center gap-2">
              <BarChart2 className="w-6 h-6 text-zinc-700" />
              <p className="text-xs text-zinc-600 font-mono">No click events recorded yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="clicks"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 3.5, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#60a5fa' }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent Visits list */}
        {data.visitHistory.length > 0 && (
          <div className="clean-card bg-[#0d0d0d]/80 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.04]">
              <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                Recent Referrals ({data.visitHistory.length})
              </h2>
            </div>
            <div className="divide-y divide-white/[0.03]">
              {[...data.visitHistory].reverse().slice(0, 15).map((v, i) => (
                <div key={i} className="px-4 py-2.5 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-zinc-500">
                    {new Date(v.timeStamp).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span className="text-zinc-400 max-w-xs truncate hidden sm:block">
                    {v.userAgent ? v.userAgent.split(' ')[0] : 'Direct'}
                  </span>
                  <span className="text-zinc-600">{v.ip || '—'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
