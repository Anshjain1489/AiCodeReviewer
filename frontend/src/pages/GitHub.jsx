import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GitBranch, GitPullRequest, Lock, Globe, ArrowRight, Play } from 'lucide-react';
import api from '../services/api';

const GitHub = () => {
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('main');
  const [analyzing, setAnalyzing] = useState(false);
  const navigate = useNavigate();

  const fetchRepositories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/github/repositories');
      if (res.success && res.data.repositories) {
        setRepositories(res.data.repositories);
      }
    } catch (err) {
      console.error('Failed to fetch GitHub repositories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepositories();
  }, []);

  const handleSelectRepo = async (repo) => {
    setSelectedRepo(repo);
    setSelectedBranch(repo.defaultBranch || 'main');
    try {
      const res = await api.get(`/github/repositories/${repo.id}/branches`);
      if (res.success && res.data.branches) {
        setBranches(res.data.branches);
      }
    } catch (err) {
      setBranches([{ name: repo.defaultBranch || 'main' }]);
    }
  };

  const handleAnalyzeRepository = async () => {
    if (!selectedRepo) return;
    setAnalyzing(true);
    try {
      const res = await api.post(`/github/repositories/${selectedRepo.id}/review`, {
        branch: selectedBranch,
      });

      if (res.success && res.data.reviewId) {
        navigate(`/reviews/${res.data.reviewId}`);
      }
    } catch (err) {
      alert('Failed to analyze repository');
      setAnalyzing(false);
    }
  };

  const handleConnectGitHub = async () => {
    try {
      const res = await api.get('/github/connect');
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      alert('Failed to start GitHub OAuth');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">GitHub Integration</h1>
          <p className="text-xs text-slate-400 mt-1">Connect GitHub repositories and review Pull Requests</p>
        </div>

        <button
          onClick={handleConnectGitHub}
          className="inline-flex items-center gap-2 bg-dark-surface border border-dark-border hover:bg-dark-hover text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          <span>Connect / Re-auth GitHub</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-slate-400">Fetching GitHub repositories...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Repository Cards List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-white tracking-tight">Connected Repositories ({repositories.length})</h3>

            <div className="space-y-3">
              {repositories.map((repo) => (
                <div
                  key={repo.id}
                  onClick={() => handleSelectRepo(repo)}
                  className={`bg-dark-surface border p-4 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    selectedRepo?.id === repo.id ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-dark-border hover:border-slate-600'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{repo.fullName}</span>
                      {repo.private ? (
                        <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Lock className="w-3 h-3" /> Private
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-500/10 text-slate-400 border border-slate-500/20">
                          <Globe className="w-3 h-3" /> Public
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-mono">Default Branch: {repo.defaultBranch}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      to={`/github/repositories/${repo.id}/pulls`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-sky-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <GitPullRequest className="w-3.5 h-3.5" />
                      <span>PRs</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Repository Analysis Control Panel */}
          <div className="bg-dark-surface border border-dark-border p-6 rounded-xl space-y-6 h-fit sticky top-24">
            <h3 className="text-sm font-bold text-white tracking-tight">Repository Analyzer</h3>

            {selectedRepo ? (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-dark-bg rounded-lg border border-dark-border space-y-1">
                  <div className="text-slate-400">Selected Repository:</div>
                  <div className="font-bold text-white font-mono">{selectedRepo.fullName}</div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium flex items-center gap-1.5">
                    <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Select Branch:</span>
                  </label>
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-indigo-500"
                  >
                    {branches.map((b) => (
                      <option key={b.name} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleAnalyzeRepository}
                  disabled={analyzing}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {analyzing ? (
                    'Fetching & Analyzing Repository...'
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Run Repository Analysis</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-500 font-mono">
                Select a repository from the left panel to configure branch and trigger automated code review.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GitHub;
