import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Zap, Code2, GitPullRequest, ArrowRight, CheckCircle2, Lock, Sparkles, Terminal, Cpu, ShieldAlert, ArrowDown } from 'lucide-react';

const Landing = () => {
  const [activeStep, setActiveStep] = useState(0);

  const workflowSteps = [
    { title: 'Code Ingestion', desc: 'Paste snippet or connect GitHub repo', icon: Code2, badge: 'Input' },
    { title: 'Static Rule Analysis', desc: 'ESLint & Semgrep deterministic check', icon: Terminal, badge: 'AST Parser' },
    { title: 'Gemini AI Reasoning', desc: 'Deep context & vulnerability evaluation', icon: Cpu, badge: 'LLM Engine' },
    { title: 'Issues Identified', desc: 'Categorized by severity (Critical → Low)', icon: ShieldAlert, badge: 'Triaged' },
    { title: 'Automated AI Fix', desc: 'Side-by-side patch generation', icon: Sparkles, badge: 'Patch Ready' },
    { title: 'Score Boost', desc: 'Code Quality Index upgraded to A', icon: CheckCircle2, badge: 'Approved' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % workflowSteps.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [workflowSteps.length]);

  return (
    <div className="min-h-screen bg-dark-bg text-slate-100 flex flex-col antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Header Navigation */}
      <header className="h-20 border-b border-dark-border px-6 md:px-12 flex items-center justify-between max-w-7xl mx-auto w-full sticky top-0 bg-dark-bg/80 backdrop-blur-md z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Shield className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-lg md:text-xl text-white tracking-tight">AI Code Reviewer</span>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <Link to="/login" className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 transition-colors">
            Sign In
          </Link>
          <Link to="/register" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-all shadow-md shadow-indigo-600/20">
            Get Started Free
          </Link>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 flex flex-col justify-center max-w-6xl mx-auto px-6 py-16 md:py-24 text-center space-y-16">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-mono font-semibold">
            <Zap className="w-4 h-4 text-indigo-400" />
            <span>ESLint + Semgrep + Google Gemini AI</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Ship Better Code With <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400">
              AI-Powered Code Review
            </span>
          </h1>

          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Detect bugs, security vulnerabilities, performance bottlenecks, and code-quality issues before they hit production. Instant fixes with side-by-side diff patches.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 text-sm"
            >
              <span>Start Code Reviewing</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto bg-dark-surface border border-dark-border hover:bg-dark-hover text-slate-200 font-semibold px-8 py-3.5 rounded-xl transition-all text-sm"
            >
              Explore Live Demo
            </Link>
          </div>
        </div>

        {/* Interactive Hero Animated Code Review Pipeline Visualization */}
        <div className="bg-dark-surface border border-dark-border rounded-2xl p-6 md:p-8 shadow-2xl text-left space-y-6 max-w-4xl mx-auto w-full">
          <div className="flex items-center justify-between border-b border-dark-border pb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-mono text-slate-400 ml-2">code-review-pipeline.workflow</span>
            </div>
            <span className="text-[11px] font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20">
              Step {activeStep + 1} of 6
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {workflowSteps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = idx === activeStep;
              const isPast = idx < activeStep;
              return (
                <div
                  key={step.title}
                  onClick={() => setActiveStep(idx)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between h-32 ${
                    isActive
                      ? 'bg-indigo-600/15 border-indigo-500 ring-1 ring-indigo-500/50 shadow-lg'
                      : isPast
                      ? 'bg-dark-card/60 border-emerald-500/30 text-slate-300'
                      : 'bg-dark-card/30 border-dark-border text-slate-500 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : isPast ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-dark-bg text-slate-400 border border-dark-border">
                      {step.badge}
                    </span>
                  </div>

                  <div>
                    <div className={`text-xs font-bold ${isActive ? 'text-white' : isPast ? 'text-slate-200' : 'text-slate-400'}`}>
                      {step.title}
                    </div>
                    <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{step.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-dark-bg p-4 rounded-xl border border-dark-border font-mono text-xs text-slate-300 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span>Active Pipeline Execution: <strong className="text-white">{workflowSteps[activeStep].title}</strong></span>
            </div>
            <span className="text-[11px] text-slate-500 hidden sm:inline">{workflowSteps[activeStep].desc}</span>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-dark-surface border border-dark-border p-6 rounded-xl space-y-3 hover:border-indigo-500/30 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Monaco Code Editor</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Write or paste source code directly with full syntax highlighting, line jump indicators, and real-time validation.
            </p>
          </div>

          <div className="bg-dark-surface border border-dark-border p-6 rounded-xl space-y-3 hover:border-emerald-500/30 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Static + AI Reasoning</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Combines ESLint and Semgrep static analysis with Google Gemini reasoning for zero-hallucination accuracy.
            </p>
          </div>

          <div className="bg-dark-surface border border-dark-border p-6 rounded-xl space-y-3 hover:border-sky-500/30 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
              <GitPullRequest className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">GitHub PR Approval</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Connect GitHub repos, review pull request diffs, draft AI summary comments, and approve before publishing.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-dark-border py-8 text-center text-xs text-slate-500 font-mono">
        © 2026 AI Code Reviewer & Bug Detection Platform. Built for modern developers.
      </footer>
    </div>
  );
};

export default Landing;
