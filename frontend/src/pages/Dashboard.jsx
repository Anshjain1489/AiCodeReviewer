import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Code2, Bug, AlertOctagon, Plus, ArrowRight, ShieldCheck, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

const Dashboard = () => {
  const [summary, setSummary] = useState({ totalReviews: 0, totalIssues: 0, criticalIssues: 0, averageScore: 100 });
  const [trends, setTrends] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [sumRes, trendRes, revRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/dashboard/trends'),
        api.get('/reviews?limit=5'),
      ]);

      if (sumRes.success) setSummary(sumRes.data);
      if (trendRes.success) setTrends(trendRes.data.trends || []);
      if (revRes.success) setRecentReviews(revRes.data.reviews || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (error) {
    return <ErrorState message={error} onRetry={fetchDashboardData} />;
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Developer Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">Overview of static analysis metrics, AI code reviews, and quality trends</p>
        </div>

        <Link
          to="/reviews/new"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/30 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Code Review</span>
        </Link>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading ? (
          <>
            <Skeleton variant="card" count={4} />
          </>
        ) : (
          <>
            <div className="bg-dark-surface border border-dark-border p-5 rounded-xl flex items-center justify-between hover:border-indigo-500/30 transition-colors shadow-sm">
              <div>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider font-mono">Average Score</span>
                <div className="text-3xl font-extrabold text-white mt-1 font-mono">
                  {summary.averageScore} <span className="text-xs text-slate-500 font-normal">/100</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <Activity className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-dark-surface border border-dark-border p-5 rounded-xl flex items-center justify-between hover:border-sky-500/30 transition-colors shadow-sm">
              <div>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider font-mono">Total Reviews</span>
                <div className="text-3xl font-extrabold text-white mt-1 font-mono">{summary.totalReviews}</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center shrink-0">
                <Code2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-dark-surface border border-dark-border p-5 rounded-xl flex items-center justify-between hover:border-amber-500/30 transition-colors shadow-sm">
              <div>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider font-mono">Total Issues</span>
                <div className="text-3xl font-extrabold text-white mt-1 font-mono">{summary.totalIssues}</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Bug className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-dark-surface border border-dark-border p-5 rounded-xl flex items-center justify-between hover:border-red-500/30 transition-colors shadow-sm">
              <div>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider font-mono">Critical Issues</span>
                <div className="text-3xl font-extrabold text-red-400 mt-1 font-mono">{summary.criticalIssues}</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center shrink-0">
                <AlertOctagon className="w-6 h-6" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Score Trend Chart */}
      <div className="bg-dark-surface border border-dark-border p-6 rounded-xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">Code Quality Score Trend</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Last 30 Reviews</span>
        </div>

        <div className="h-64 w-full">
          {loading ? (
            <Skeleton variant="card" className="h-full" />
          ) : trends.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-500 font-mono">
              No historical review trend data yet. Complete your first code review to populate trends.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#4B5563" fontSize={10} tickLine={false} />
                <YAxis stroke="#4B5563" fontSize={10} domain={[0, 100]} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0E131F',
                    borderColor: '#1E2638',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#FFF',
                  }}
                />
                <Area type="monotone" dataKey="score" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#scoreColor)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Reviews Table Panel */}
      <div className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden space-y-3 p-6 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-dark-border">
          <h3 className="text-sm font-bold text-white tracking-tight">Recent Code Reviews</h3>
          <Link to="/reviews" className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1">
            <span>View All History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            <Skeleton variant="table-row" count={3} />
          </div>
        ) : recentReviews.length === 0 ? (
          <EmptyState
            title="No Code Reviews Yet"
            description="Submit your first code snippet or repository to begin tracking code health."
            actionLabel="Start Code Review"
            onAction={() => (window.location.href = '/reviews/new')}
            actionIcon={Plus}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-dark-border text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Review ID</th>
                  <th className="py-3 px-4">Language</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Issues</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border text-slate-300">
                {recentReviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-dark-hover transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">{rev.id.substring(0, 8)}</td>
                    <td className="py-3.5 px-4">{rev.language || 'javascript'}</td>
                    <td className="py-3.5 px-4 font-bold text-indigo-400">
                      {rev.overallScore ? `${Math.round(rev.overallScore)}/100` : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-amber-400 font-bold">{rev._count?.issues ?? rev.totalIssues ?? 0}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {rev.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link to={`/reviews/${rev.id}`} className="text-indigo-400 hover:underline font-semibold">
                        View Result
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
