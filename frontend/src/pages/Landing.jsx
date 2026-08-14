import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Zap, Code2, GitPullRequest, ArrowRight, CheckCircle2, Lock } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-dark-bg text-slate-100 flex flex-col">
      {/* Header */}
      <header className="h-20 border-b border-dark-border px-8 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Shield className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-xl text-white tracking-tight">AI Code Reviewer</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-xs font-semibold text-slate-300 hover:text-white px-4 py-2 transition-colors">
            Sign In
          </Link>
          <Link to="/register" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-all shadow-md shadow-indigo-600/20">
            Get Started Free
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-8 text-center max-w-4xl mx-auto my-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold mb-6">
          <Zap className="w-3.5 h-3.5" /> Next-Gen AI & Deterministic Code Intelligence
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
          Detect Bugs & Security Flaws <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400">
            Before They Hit Production
          </span>
        </h1>
        <p className="text-slate-400 text-base md:text-lg mt-6 max-w-2xl mx-auto leading-relaxed">
          Combine deterministic ESLint and Semgrep static analysis with Google Gemini reasoning. Receive instant fixes, side-by-side code diffs, and score cards.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/register" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2">
            <span>Start Code Review</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/login" className="w-full sm:w-auto bg-dark-surface border border-dark-border hover:bg-dark-hover text-slate-200 font-semibold px-8 py-3.5 rounded-xl transition-all">
            Explore Demo
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left">
          <div className="bg-dark-surface border border-dark-border p-6 rounded-xl">
            <Code2 className="w-8 h-8 text-indigo-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Monaco Code Editor</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Write or paste source code with IDE syntax highlighting, line numbers, and issue markers.
            </p>
          </div>

          <div className="bg-dark-surface border border-dark-border p-6 rounded-xl">
            <Lock className="w-8 h-8 text-emerald-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Static + AI Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              ESLint and Semgrep static analysis combined with AI context reasoning for 100% reliable findings.
            </p>
          </div>

          <div className="bg-dark-surface border border-dark-border p-6 rounded-xl">
            <GitPullRequest className="w-8 h-8 text-sky-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">GitHub PR Approval</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Review pull request diffs, preview AI findings, and approve comments before publishing.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-border py-8 text-center text-xs text-slate-500 font-mono">
        © 2026 AI Code Reviewer & Bug Detection Platform.
      </footer>
    </div>
  );
};

export default Landing;
