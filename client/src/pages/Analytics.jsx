import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { getAnalytics } from '../api/urls';
import LoadingSpinner from '../components/LoadingSpinner';

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4">
      <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">{label}</p>
      <p className="text-white text-2xl font-bold">{value}</p>
      {sub && <p className="text-zinc-600 text-xs mt-1">{sub}</p>}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm">
      <p className="text-zinc-400 mb-1">{label}</p>
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
  // sort chronologically
  const sorted = Object.entries(map)
    .map(([date, clicks]) => ({ date, clicks }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  return sorted;
}

export default function Analytics() {
  const { shortId } = useParams();
  const navigate    = useNavigate();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

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
      <div className="min-h-screen bg-[#0a0a0a] pt-14 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] pt-14 flex flex-col items-center justify-center gap-4 text-red-400">
        <p>{error}</p>
        <button onClick={() => navigate('/dashboard')} className="text-sm text-zinc-400 hover:text-white transition-colors">
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  const chartData = groupByDay(data.visitHistory);
  const shortUrl  = `${baseUrl}/${data.shortId}`;

  // last 7 days avg
  const last7 = chartData.slice(-7).reduce((sum, d) => sum + d.clicks, 0);

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-slide-up">
        {/* Back button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm mb-8 group"
        >
          <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
          Back to Dashboard
        </button>

        {/* URL title */}
        <div className="mb-8">
          <h1 className="text-xl font-bold text-white mb-1">
            <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
              {shortUrl}
            </a>
          </h1>
          <p className="text-zinc-500 text-sm truncate">→ {data.redirectUrl}</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard label="Total Clicks" value={data.totalClicks} />
          <StatCard label="Last 7 Days"  value={last7} />
          <StatCard
            label="Created"
            value={new Date(data.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          />
          <StatCard
            label="Expires"
            value={data.expiresAt
              ? new Date(data.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : 'Never'}
            sub={data.isActive ? 'Active' : 'Inactive'}
          />
        </div>

        {/* Chart */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-6">Clicks over time</h2>
          {chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-zinc-600">
              <p className="text-4xl mb-3">📊</p>
              <p className="text-sm">No clicks yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={chartData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#71717a', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: '#71717a', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="clicks"
                  stroke="#7c3aed"
                  strokeWidth={2.5}
                  dot={{ fill: '#7c3aed', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#a78bfa' }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Visit history table (last 20) */}
        {data.visitHistory.length > 0 && (
          <div className="mt-6 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800">
              <h2 className="text-white font-semibold text-sm">Recent Visits</h2>
            </div>
            <div className="divide-y divide-zinc-800">
              {[...data.visitHistory].reverse().slice(0, 20).map((v, i) => (
                <div key={i} className="px-5 py-3 flex items-center justify-between text-xs">
                  <span className="text-zinc-500">
                    {new Date(v.timeStamp).toLocaleString('en-US', {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                  <span className="text-zinc-600 max-w-xs truncate hidden sm:block">{v.userAgent || '—'}</span>
                  <span className="text-zinc-700">{v.ip || '—'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
