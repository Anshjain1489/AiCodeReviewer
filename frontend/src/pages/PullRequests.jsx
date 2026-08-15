import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { GitPullRequest, ArrowLeft, Play, GitBranch } from 'lucide-react';
import api from '../services/api';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

const PullRequests = () => {
  const { repositoryId } = useParams();
  const [pulls, setPulls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPRs = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/github/repositories/${repositoryId}/pulls`);
        if (res.success && res.data.pulls) {
          setPulls(res.data.pulls);
        }
      } catch (err) {
        console.error('Failed to load pull requests:', err);
        setError('Failed to load pull requests.');
      } finally {
        setLoading(false);
      }
    };
    fetchPRs();
  }, [repositoryId]);

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/github" className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Open Pull Requests</h1>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton variant="card" count={3} />
        </div>
      ) : pulls.length === 0 ? (
        <EmptyState
          icon={GitPullRequest}
          title="No Open Pull Requests"
          description="There are currently no open pull requests found for this repository."
        />
      ) : (
        <div className="space-y-4">
          {pulls.map((pr) => (
            <div key={pr.id} className="bg-dark-surface border border-dark-border p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-emerald-400 font-bold">#{pr.number}</span>
                  <span className="text-slate-400">by {pr.author}</span>
                </div>
                <h3 className="text-base font-bold text-white">{pr.title}</h3>
                <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <GitBranch className="w-3.5 h-3.5 text-indigo-400" /> {pr.branchName} → {pr.baseBranch}
                  </span>
                  <span>• {pr.changedFiles} Changed Files</span>
                </div>
              </div>

              <div>
                <Link
                  to={`/github/pulls/${pr.id}`}
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md shadow-indigo-600/20"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Review PR & Diff</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PullRequests;
