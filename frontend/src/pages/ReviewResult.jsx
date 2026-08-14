import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ScoreCard from '../components/ScoreCard';
import SeverityBadge from '../components/SeverityBadge';
import Drawer from '../components/Drawer';
import DiffViewer from '../components/DiffViewer';
import api from '../services/api';
import { AlertCircle, CheckCircle2, RotateCw, MessageSquare, Sparkles, Filter, ChevronRight, HelpCircle, ArrowLeft, Bug } from 'lucide-react';

const ReviewResult = () => {
  const { reviewId } = useParams();
  const [review, setReview] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering state
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Selected Issue Drawer
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [aiExplanation, setAiExplanation] = useState('');
  const [explaining, setExplaining] = useState(false);

  // AI Fix State
  const [aiFix, setAiFix] = useState(null);
  const [generatingFix, setGeneratingFix] = useState(false);

  // AI Chat Drawer
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [userQuery, setUserQuery] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const fetchReviewData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/reviews/${reviewId}`);
      if (res.success && res.data.review) {
        setReview(res.data.review);
        setIssues(res.data.review.issues || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load review results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewData();
  }, [reviewId]);

  const handleReanalyze = async () => {
    try {
      setLoading(true);
      await api.post(`/reviews/${reviewId}/reanalyze`);
      setTimeout(fetchReviewData, 2000);
    } catch (err) {
      setError('Re-analysis failed');
      setLoading(false);
    }
  };

  const handleExplainIssue = async (issueId) => {
    setExplaining(true);
    setAiExplanation('');
    try {
      const res = await api.post(`/issues/${issueId}/explain`);
      if (res.success && res.data.explanation) {
        setAiExplanation(res.data.explanation);
      }
    } catch (err) {
      setAiExplanation('Failed to generate AI explanation.');
    } finally {
      setExplaining(false);
    }
  };

  const handleGenerateFix = async (issueId) => {
    setGeneratingFix(true);
    setAiFix(null);
    try {
      const res = await api.post(`/issues/${issueId}/fix`);
      if (res.success && res.data.fix) {
        setAiFix(res.data.fix);
      }
    } catch (err) {
      setError('Failed to generate AI fix.');
    } finally {
      setGeneratingFix(false);
    }
  };

  const handleAcceptFix = async (issueId, fixId) => {
    try {
      await api.post(`/issues/${issueId}/accept-fix`, { fixId });
      setSelectedIssue(null);
      setAiFix(null);
      setTimeout(fetchReviewData, 2000);
    } catch (err) {
      setError('Failed to accept fix');
    }
  };

  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!userQuery.trim()) return;

    const newMsg = { role: 'user', content: userQuery };
    setChatMessages((prev) => [...prev, newMsg]);
    const currentQuery = userQuery;
    setUserQuery('');
    setChatLoading(true);

    try {
      const res = await api.post(`/reviews/${reviewId}/chat`, { message: currentQuery });
      if (res.success && res.data.message) {
        setChatMessages((prev) => [...prev, { role: 'assistant', content: res.data.message }]);
      }
    } catch (err) {
      setChatMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, AI chat service error.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-slate-400">Loading code review findings & quality score...</span>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-xl text-center space-y-4">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Review Not Found</h3>
        <p className="text-xs text-slate-400">{error || 'Review record could not be loaded.'}</p>
        <Link to="/reviews/new" className="inline-block bg-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-lg">
          Start New Review
        </Link>
      </div>
    );
  }

  const filteredIssues = issues.filter((issue) => {
    if (severityFilter !== 'ALL' && issue.severity !== severityFilter) return false;
    if (categoryFilter !== 'ALL' && issue.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Review Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link to="/reviews" className="text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Review Result</h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-dark-surface border border-dark-border text-slate-400">
              {review.id.substring(0, 8)}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Language: <span className="text-slate-200 font-mono">{review.language}</span> • Status:{' '}
            <span className="text-emerald-400 font-semibold">{review.status}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsChatOpen(true)}
            className="inline-flex items-center gap-2 bg-dark-surface border border-dark-border hover:bg-dark-hover text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors"
          >
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <span>Ask AI Assistant</span>
          </button>

          <button
            onClick={handleReanalyze}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-all shadow-md shadow-indigo-600/20"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Re-analyze</span>
          </button>
        </div>
      </div>

      {/* Score Card */}
      <ScoreCard scores={review} />

      {/* Issue Explorer Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-dark-border">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Bug className="w-4 h-4 text-rose-400" />
            <span>Identified Issues ({filteredIssues.length})</span>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Filter className="w-3.5 h-3.5" />
              <span>Severity:</span>
            </div>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-1 rounded-md border transition-all ${
                  severityFilter === sev
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold'
                    : 'bg-dark-surface border-dark-border text-slate-400 hover:text-white'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Issue Cards List */}
        {filteredIssues.length === 0 ? (
          <div className="bg-dark-surface border border-dark-border rounded-xl p-12 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="text-base font-bold text-white">No Issues Matching Filters</h4>
            <p className="text-xs text-slate-400">Your code passed all static and AI rules under the selected filter criteria.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredIssues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => {
                  setSelectedIssue(issue);
                  setAiExplanation('');
                  setAiFix(null);
                }}
                className="bg-dark-surface border border-dark-border hover:border-indigo-500/50 p-4 rounded-xl transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <SeverityBadge severity={issue.severity} />
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-dark-bg text-slate-400 border border-dark-border">
                      {issue.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {issue.filePath}:{issue.lineStart || 1}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{issue.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2">{issue.description}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-semibold text-indigo-400 group-hover:underline flex items-center gap-1">
                    Inspect Details
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Issue Details Drawer */}
      <Drawer isOpen={!!selectedIssue} onClose={() => setSelectedIssue(null)} title={selectedIssue?.title || 'Issue Details'}>
        {selectedIssue && (
          <div className="space-y-6 text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-dark-border">
              <SeverityBadge severity={selectedIssue.severity} />
              <span className="font-mono text-slate-400">
                Rule ID: <span className="text-slate-200">{selectedIssue.ruleId || 'generic'}</span>
              </span>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-white text-sm">Problem Description</h4>
              <p className="text-slate-300 leading-relaxed bg-dark-bg p-3.5 rounded-lg border border-dark-border">
                {selectedIssue.description}
              </p>
            </div>

            {selectedIssue.impact && (
              <div className="space-y-2">
                <h4 className="font-bold text-rose-400 text-sm">Security & Quality Impact</h4>
                <p className="text-slate-300 leading-relaxed bg-rose-500/5 p-3.5 rounded-lg border border-rose-500/20">
                  {selectedIssue.impact}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="font-bold text-emerald-400 text-sm">Recommendation</h4>
              <p className="text-slate-300 leading-relaxed bg-emerald-500/5 p-3.5 rounded-lg border border-emerald-500/20">
                {selectedIssue.recommendation || 'Refactor code adhering to security best practices.'}
              </p>
            </div>

            {/* AI Explanation Action */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => handleExplainIssue(selectedIssue.id)}
                disabled={explaining}
                className="w-full bg-dark-bg border border-dark-border hover:bg-dark-hover text-slate-200 font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <HelpCircle className="w-4 h-4 text-indigo-400" />
                <span>{explaining ? 'Generating Explanation...' : 'Explain Issue with AI'}</span>
              </button>

              {aiExplanation && (
                <div className="bg-indigo-950/20 border border-indigo-500/30 p-4 rounded-xl space-y-2">
                  <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase">AI Explanation</span>
                  <div className="text-slate-200 text-xs whitespace-pre-wrap leading-relaxed">{aiExplanation}</div>
                </div>
              )}
            </div>

            {/* AI Fix Action & Diff */}
            <div className="space-y-3 pt-4 border-t border-dark-border">
              <button
                onClick={() => handleGenerateFix(selectedIssue.id)}
                disabled={generatingFix}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                <Sparkles className="w-4 h-4" />
                <span>{generatingFix ? 'Generating AI Fix...' : 'Generate AI Fix & Patch'}</span>
              </button>

              {aiFix && (
                <div className="space-y-4 pt-2">
                  <DiffViewer original={aiFix.originalCode} suggested={aiFix.suggestedCode} />
                  <button
                    onClick={() => handleAcceptFix(selectedIssue.id, aiFix.id)}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Accept Fix & Re-analyze</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* AI Chat Drawer */}
      <Drawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} title="AI Review Assistant">
        <div className="flex flex-col h-[500px] justify-between text-xs">
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-lg text-indigo-300">
              👋 Hi! I am your AI Code Reviewer Assistant. Ask me anything about the issues detected or refactoring recommendations for this review.
            </div>

            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl max-w-[85%] ${
                  msg.role === 'user' ? 'bg-indigo-600 text-white ml-auto' : 'bg-dark-bg border border-dark-border text-slate-200'
                }`}
              >
                {msg.content}
              </div>
            ))}

            {chatLoading && (
              <div className="text-slate-400 font-mono text-[11px] animate-pulse">AI is thinking...</div>
            )}
          </div>

          <form onSubmit={handleSendChatMessage} className="pt-4 border-t border-dark-border flex gap-2">
            <input
              type="text"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="Ask a question about this code review..."
              className="flex-1 bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-lg">
              Send
            </button>
          </form>
        </div>
      </Drawer>
    </div>
  );
};

export default ReviewResult;
