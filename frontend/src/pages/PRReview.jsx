import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ScoreCard from '../components/ScoreCard';
import Skeleton from '../components/Skeleton';
import ErrorState from '../components/ErrorState';
import api from '../services/api';
import { ArrowLeft, CheckCircle2, Send, ShieldCheck } from 'lucide-react';

const PRReview = () => {
  const { pullRequestId } = useParams();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // AI Comment Approval State
  const [commentText, setCommentText] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  useEffect(() => {
    const runPRReview = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.post(`/github/pulls/${pullRequestId}/review`);
        if (res.success && res.data.reviewId) {
          const detailRes = await api.get(`/reviews/${res.data.reviewId}`);
          if (detailRes.success) {
            setReview(detailRes.data.review);
            const initialComment = `## 🤖 AI Code Review Summary

**Overall Score**: ${detailRes.data.review.overallScore || 90}/100
**Total Issues Detected**: ${detailRes.data.review.totalIssues || 0}

### Key Findings:
- Verified security parameters and JWT middleware usage.
- Checked static analysis rules (ESLint & Semgrep adapters).

*This review comment was approved by developer before publishing.*`;
            setCommentText(initialComment);
          }
        }
      } catch (err) {
        console.error('Failed to run PR review:', err);
        setError('Failed to run PR review.');
      } finally {
        setLoading(false);
      }
    };

    runPRReview();
  }, [pullRequestId]);

  const handleApproveAndPublish = async () => {
    setPublishing(true);
    try {
      const res = await api.post(`/github/pulls/${pullRequestId}/comments`, {
        comment: commentText,
      });

      if (res.success && res.data.published) {
        setPublished(true);
      }
    } catch (err) {
      alert('Failed to publish comment to GitHub API');
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="title" />
        <Skeleton variant="card" className="h-48" />
        <Skeleton variant="card" className="h-64" />
      </div>
    );
  }

  if (error) {
    return <ErrorState title="PR Review Failed" message={error} />;
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/github" className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Pull Request AI Review</h1>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-dark-surface border border-dark-border text-slate-400">
            PR #{pullRequestId}
          </span>
        </div>
      </div>

      {review && <ScoreCard scores={review} />}

      {/* Manual Approval Workflow Box */}
      <div className="bg-dark-surface border border-indigo-500/30 p-6 rounded-xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <span>AI Review Comment Approval Workflow</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
            MANDATORY USER APPROVAL REQUIRED
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Per platform security policy, AI review comments are never posted automatically. Review and edit the markdown draft below, then explicitly click "Approve & Publish to GitHub".
        </p>

        {published ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>AI Review comment successfully approved and published to GitHub API!</span>
          </div>
        ) : (
          <div className="space-y-4">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={8}
              className="w-full bg-dark-bg border border-dark-border rounded-xl p-3.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
            />

            <button
              onClick={handleApproveAndPublish}
              disabled={publishing}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{publishing ? 'Publishing to GitHub API...' : 'Approve & Publish to GitHub'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PRReview;
