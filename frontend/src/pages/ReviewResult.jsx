import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import ScoreCard from '../components/ScoreCard';
import SeverityBadge from '../components/SeverityBadge';
import Drawer from '../components/Drawer';
import DiffViewer from '../components/DiffViewer';
import Skeleton from '../components/Skeleton';
import ErrorState from '../components/ErrorState';
import api from '../services/api';
import {
  AlertCircle,
  CheckCircle2,
  RotateCw,
  MessageSquare,
  Sparkles,
  Filter,
  ChevronRight,
  HelpCircle,
  ArrowLeft,
  Bug,
  Code2,
  Layers,
} from 'lucide-react';

const ReviewResult = () => {
  const { reviewId } = useParams();
  const [review, setReview] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Mobile Workspace View Tab: 'issues' | 'editor'
  const [mobileTab, setMobileTab] = useState('issues');

  // Filtering state
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Selected Issue & Monaco ref
  const [selectedIssue, setSelectedIssue] = useState(null);
  const editorRef = useRef(null);

  // AI Explanation State
  const [aiExplanation, setAiExplanation] = useState('');
  const [explaining, setExplaining] = useState(false);

  // AI Fix State
  const [aiFix, setAiFix] = useState(null);
  const [generatingFix, setGeneratingFix] = useState(false);

  // AI Chat Drawer State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [userQuery, setUserQuery] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const fetchReviewData = async () => {
    try {
      setLoading(true);
      setError('');
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

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
  };

  const handleSelectIssue = (issue) => {
    setSelectedIssue(issue);
    setAiExplanation('');
    setAiFix(null);

    // Jump Monaco Editor to line if available
    if (editorRef.current && issue.lineStart) {
      editorRef.current.revealLineInCenter(issue.lineStart);
      editorRef.current.setPosition({ lineNumber: issue.lineStart, column: 1 });
    }
  };

  const handleReanalyze = async () => {
    try {
      setLoading(true);
      await api.post(`/reviews/${reviewId}/reanalyze`);
      setTimeout(fetchReviewData, 1500);
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
      setTimeout(fetchReviewData, 1500);
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
      <div className="space-y-6">
        <Skeleton variant="table-row" className="h-12" />
        <Skeleton variant="card" className="h-48" />
        <Skeleton variant="card" count={3} />
      </div>
    );
  }

  if (error || !review) {
    return <ErrorState title="Review Load Error" message={error || 'Review record could not be found.'} onRetry={fetchReviewData} />;
  }

  const filteredIssues = issues.filter((issue) => {
    if (severityFilter !== 'ALL' && issue.severity !== severityFilter) return false;
    if (categoryFilter !== 'ALL' && issue.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Review Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link to="/reviews" className="text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Review Findings & Fix Workspace</h1>
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
            className="inline-flex items-center gap-2 bg-dark-surface border border-dark-border hover:bg-dark-hover text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <span>Ask AI Assistant</span>
          </button>

          <button
            onClick={handleReanalyze}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/20"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Re-analyze</span>
          </button>
        </div>
      </div>

      {/* Score Card Component */}
      <ScoreCard scores={review} />

      {/* Mobile Tab View Selector */}
      <div className="flex lg:hidden bg-dark-surface p-1 rounded-xl border border-dark-border text-xs font-mono">
        <button
          onClick={() => setMobileTab('issues')}
          className={`flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
            mobileTab === 'issues' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bug className="w-4 h-4" />
          <span>Issues ({filteredIssues.length})</span>
        </button>
        <button
          onClick={() => setMobileTab('editor')}
          className={`flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
            mobileTab === 'editor' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Monaco Editor</span>
        </button>
      </div>

      {/* Main Workspace Split (Issues List + Monaco Code Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Filterable Issue List */}
        <div className={`lg:col-span-6 space-y-4 ${mobileTab === 'editor' ? 'hidden lg:block' : ''}`}>
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-dark-border">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Bug className="w-4 h-4 text-rose-400" />
              <span>Identified Issues ({filteredIssues.length})</span>
            </div>

            {/* Severity Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
              {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2 py-1 rounded-md border transition-all ${
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

          {/* Issue Cards */}
          {filteredIssues.length === 0 ? (
            <div className="bg-dark-surface border border-dark-border rounded-xl p-10 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="text-base font-bold text-white">No Issues Found</h4>
              <p className="text-xs text-slate-400">Code passed all static and AI checks for the selected filter.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {filteredIssues.map((issue) => (
                <div
                  key={issue.id}
                  onClick={() => handleSelectIssue(issue)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 group ${
                    selectedIssue?.id === issue.id
                      ? 'bg-indigo-950/20 border-indigo-500 ring-1 ring-indigo-500/40 shadow-lg'
                      : 'bg-dark-surface border-dark-border hover:border-dark-hover'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <SeverityBadge severity={issue.severity} />
                    <span className="text-[10px] font-mono text-slate-400 bg-dark-bg px-2 py-0.5 rounded border border-dark-border">
                      Line {issue.lineStart || 1}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{issue.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{issue.description}</p>

                  <div className="pt-2 flex items-center justify-between border-t border-dark-border/50 text-[11px] font-mono text-indigo-400">
                    <span>Category: {issue.category}</span>
                    <span className="font-semibold underline flex items-center gap-1">
                      Inspect & Fix <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Monaco Code Viewer with Line Navigation */}
        <div className={`lg:col-span-6 space-y-3 ${mobileTab === 'issues' ? 'hidden lg:block' : ''}`}>
          <div className="flex items-center justify-between pb-2 border-b border-dark-border">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Code2 className="w-4 h-4 text-indigo-400" />
              <span>Source File View</span>
            </div>
            <span className="text-xs font-mono text-slate-400">Read-only Code Marker</span>
          </div>

          <div className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden shadow-2xl h-[580px]">
            <Editor
              height="100%"
              language={review.language || 'javascript'}
              theme="vs-dark"
              value={review.code || ''}
              onMount={handleEditorMount}
              options={{
                readOnly: true,
                fontSize: 12,
                fontFamily: 'JetBrains Mono',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                lineNumbers: 'on',
                padding: { top: 12, bottom: 12 },
              }}
            />
          </div>
        </div>
      </div>

      {/* Selected Issue Drawer */}
      <Drawer isOpen={!!selectedIssue} onClose={() => setSelectedIssue(null)} title={selectedIssue?.title || 'Issue Details'}>
        {selectedIssue && (
          <div className="space-y-6 text-xs animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-dark-border">
              <SeverityBadge severity={selectedIssue.severity} />
              <span className="font-mono text-slate-400">
                Rule ID: <span className="text-slate-200 font-bold">{selectedIssue.ruleId || 'generic-static'}</span>
              </span>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-white text-sm">Vulnerability Description</h4>
              <p className="text-slate-300 leading-relaxed bg-dark-bg p-4 rounded-xl border border-dark-border font-mono">
                {selectedIssue.description}
              </p>
            </div>

            {selectedIssue.impact && (
              <div className="space-y-2">
                <h4 className="font-bold text-rose-400 text-sm">Security & Quality Impact</h4>
                <p className="text-slate-300 leading-relaxed bg-rose-500/5 p-4 rounded-xl border border-rose-500/20 font-mono">
                  {selectedIssue.impact}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="font-bold text-emerald-400 text-sm">Recommendation</h4>
              <p className="text-slate-300 leading-relaxed bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/20 font-mono">
                {selectedIssue.recommendation || 'Refactor code adhering to security best practices.'}
              </p>
            </div>

            {/* AI Explanation Section */}
            <div className="space-y-3 pt-2 border-t border-dark-border">
              <button
                onClick={() => handleExplainIssue(selectedIssue.id)}
                disabled={explaining}
                className="w-full bg-dark-bg border border-dark-border hover:bg-dark-hover text-slate-200 font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <HelpCircle className="w-4 h-4 text-indigo-400" />
                <span>{explaining ? 'Generating AI Explanation...' : 'Explain Issue with Gemini AI'}</span>
              </button>

              {aiExplanation && (
                <div className="bg-indigo-950/20 border border-indigo-500/30 p-4 rounded-xl space-y-2">
                  <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase">AI Explanation</span>
                  <div className="text-slate-200 text-xs whitespace-pre-wrap leading-relaxed font-mono">{aiExplanation}</div>
                </div>
              )}
            </div>

            {/* AI Fix & Patch Section */}
            <div className="space-y-3 pt-4 border-t border-dark-border">
              <button
                onClick={() => handleGenerateFix(selectedIssue.id)}
                disabled={generatingFix}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                <Sparkles className="w-4 h-4" />
                <span>{generatingFix ? 'Generating AI Patch...' : 'Generate AI Fix & Diff Patch'}</span>
              </button>

              {aiFix && (
                <div className="space-y-4 pt-2">
                  <DiffViewer
                    original={aiFix.originalCode}
                    suggested={aiFix.suggestedCode}
                    onAccept={() => handleAcceptFix(selectedIssue.id, aiFix.id)}
                    onReject={() => setAiFix(null)}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* AI Assistant Chat Drawer */}
      <Drawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} title="Gemini AI Code Review Assistant">
        <div className="flex flex-col h-[520px] justify-between text-xs font-sans">
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            <div className="bg-indigo-500/10 border border-indigo-500/20 p-3.5 rounded-xl text-indigo-300">
              👋 Hi! I am your AI Code Review Assistant. Ask me questions regarding static analysis rules, security risks, or refactoring strategies for this review.
            </div>

            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl max-w-[85%] font-mono ${
                  msg.role === 'user' ? 'bg-indigo-600 text-white ml-auto' : 'bg-dark-bg border border-dark-border text-slate-200'
                }`}
              >
                {msg.content}
              </div>
            ))}

            {chatLoading && (
              <div className="text-slate-400 font-mono text-[11px] animate-pulse flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Gemini AI is reasoning...</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSendChatMessage} className="pt-4 border-t border-dark-border flex gap-2">
            <input
              type="text"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="Ask a question about this code review..."
              className="flex-1 bg-dark-bg border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl">
              Send
            </button>
          </form>
        </div>
      </Drawer>
    </div>
  );
};

export default ReviewResult;
