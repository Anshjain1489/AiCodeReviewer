import React, { useState } from 'react';
import { Copy, Check, Code, ArrowRight } from 'lucide-react';

const DiffViewer = ({ original = '', suggested = '', onAccept, onReject }) => {
  const [copied, setCopied] = useState(false);
  const [mobileTab, setMobileTab] = useState('split'); // 'split' | 'original' | 'suggested'

  const origLines = original.split('\n');
  const sugLines = suggested.split('\n');

  const handleCopySuggested = () => {
    navigator.clipboard.writeText(suggested);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3 font-mono text-xs">
      {/* Mobile Tab Selector & Actions Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-dark-bg p-3 rounded-t-xl border border-dark-border">
        {/* Mobile View Toggle */}
        <div className="flex sm:hidden bg-dark-surface p-1 rounded-lg border border-dark-border text-[11px]">
          <button
            onClick={() => setMobileTab('original')}
            className={`px-2.5 py-1 rounded transition-colors ${mobileTab === 'original' ? 'bg-red-500/20 text-red-400 font-bold' : 'text-slate-400'}`}
          >
            Original
          </button>
          <button
            onClick={() => setMobileTab('suggested')}
            className={`px-2.5 py-1 rounded transition-colors ${mobileTab === 'suggested' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-400'}`}
          >
            Suggested
          </button>
          <button
            onClick={() => setMobileTab('split')}
            className={`px-2.5 py-1 rounded transition-colors ${mobileTab === 'split' ? 'bg-indigo-500/20 text-indigo-400 font-bold' : 'text-slate-400'}`}
          >
            Stack
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-slate-400 text-xs">
          <Code className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-white">Side-by-Side Patch Comparison</span>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={handleCopySuggested}
            className="inline-flex items-center gap-1.5 bg-dark-surface border border-dark-border hover:bg-dark-hover text-slate-300 px-3 py-1.5 rounded-lg text-[11px] transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Fix'}</span>
          </button>

          {onReject && (
            <button
              onClick={onReject}
              className="bg-dark-surface border border-dark-border hover:bg-red-500/10 hover:text-red-400 text-slate-400 px-3 py-1.5 rounded-lg text-[11px] transition-colors"
            >
              Reject
            </button>
          )}

          {onAccept && (
            <button
              onClick={onAccept}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-1.5 rounded-lg text-[11px] transition-all shadow-md shadow-emerald-600/20"
            >
              Accept Fix
            </button>
          )}
        </div>
      </div>

      {/* Code Diff Display Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-dark-border border-x border-b border-dark-border rounded-b-xl overflow-hidden">
        {/* Original Code Panel */}
        <div className={`p-4 bg-dark-bg ${mobileTab === 'suggested' ? 'hidden md:block' : ''}`}>
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-dark-border text-red-400 font-bold uppercase text-[10px]">
            <span>Original Code</span>
            <span className="px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20">- Removed</span>
          </div>
          <div className="overflow-x-auto space-y-1 max-h-96">
            {origLines.map((line, idx) => (
              <div key={idx} className="flex gap-3 hover:bg-red-500/10 px-1.5 py-0.5 rounded bg-red-500/5">
                <span className="text-slate-600 select-none w-6 text-right shrink-0">{idx + 1}</span>
                <span className="text-slate-300 font-mono whitespace-pre">{line || ' '}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Fix Panel */}
        <div className={`p-4 bg-dark-surface ${mobileTab === 'original' ? 'hidden md:block' : ''}`}>
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-dark-border text-emerald-400 font-bold uppercase text-[10px]">
            <span>AI Suggested Fix</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">+ Added</span>
          </div>
          <div className="overflow-x-auto space-y-1 max-h-96">
            {sugLines.map((line, idx) => (
              <div key={idx} className="flex gap-3 hover:bg-emerald-500/15 px-1.5 py-0.5 rounded bg-emerald-500/10">
                <span className="text-emerald-500/70 select-none w-6 text-right shrink-0">{idx + 1}</span>
                <span className="text-emerald-200 font-mono whitespace-pre">{line || ' '}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiffViewer;
