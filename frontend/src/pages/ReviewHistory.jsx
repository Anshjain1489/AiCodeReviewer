import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, Plus, Filter, Trash2 } from 'lucide-react';
import api from '../services/api';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

const ReviewHistory = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const query = statusFilter ? `?status=${statusFilter}` : '';
      const res = await api.get(`/reviews${query}`);
      if (res.success && res.data.reviews) {
        setReviews(res.data.reviews);
      }
    } catch (err) {
      console.error('Failed to load review history:', err);
      setError('Failed to load code review history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [statusFilter]);

  const handleDeleteReview = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this code review record?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      fetchReviews();
    } catch (err) {
      alert('Failed to delete review');
    }
  };

  if (error) {
    return <ErrorState message={error} onRetry={fetchReviews} />;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Review History</h1>
          <p className="text-xs text-slate-400 mt-1">Browse, filter, and inspect past static and AI code reviews</p>
        </div>

        <Link
          to="/reviews/new"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Review</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-dark-surface border border-dark-border p-4 rounded-xl flex items-center justify-between gap-4 text-xs font-mono shadow-sm">
        <div className="flex items-center gap-2 text-slate-400">
          <Filter className="w-4 h-4" />
          <span>Status Filter:</span>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-dark-bg border border-dark-border text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Statuses</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="RUNNING">RUNNING</option>
          <option value="QUEUED">QUEUED</option>
          <option value="FAILED">FAILED</option>
        </select>
      </div>

      {loading ? (
        <div className="bg-dark-surface border border-dark-border rounded-xl p-6 space-y-3">
          <Skeleton variant="table-row" count={5} />
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={History}
          title="No Code Review History"
          description="Submit source code for analysis to build review history records."
          actionLabel="Start Code Review"
          onAction={() => (window.location.href = '/reviews/new')}
          actionIcon={Plus}
        />
      ) : (
        <div className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden p-6 space-y-3 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-dark-border text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Review ID</th>
                  <th className="py-3 px-4">Language</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Issues</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border text-slate-300">
                {reviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-dark-hover transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">{rev.id.substring(0, 8)}</td>
                    <td className="py-3.5 px-4">{rev.language || 'javascript'}</td>
                    <td className="py-3.5 px-4 text-slate-400">{rev.sourceType}</td>
                    <td className="py-3.5 px-4 font-bold text-indigo-400">
                      {rev.overallScore ? `${Math.round(rev.overallScore)}/100` : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-amber-400 font-bold">{rev._count?.issues ?? rev.totalIssues ?? 0}</td>
                    <td className="py-3.5 px-4 text-slate-400">{new Date(rev.createdAt).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4 text-right space-x-3">
                      <Link to={`/reviews/${rev.id}`} className="text-indigo-400 hover:underline font-semibold">
                        View Result
                      </Link>
                      <button onClick={(e) => handleDeleteReview(rev.id, e)} className="text-slate-500 hover:text-red-400">
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewHistory;
