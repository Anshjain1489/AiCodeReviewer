import React from 'react';

const DiffViewer = ({ original = '', suggested = '' }) => {
  const origLines = original.split('\n');
  const sugLines = suggested.split('\n');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono rounded-lg overflow-hidden border border-dark-border bg-dark-bg">
      {/* Original Code */}
      <div className="p-4 border-b md:border-b-0 md:border-r border-dark-border">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-dark-border text-red-400 font-semibold uppercase tracking-wider text-[10px]">
          <span>Original Code</span>
          <span>Before</span>
        </div>
        <pre className="overflow-x-auto space-y-1">
          {origLines.map((line, idx) => (
            <div key={idx} className="flex gap-3 hover:bg-red-500/5 px-1 py-0.5 rounded">
              <span className="text-slate-600 select-none w-6 text-right font-mono">{idx + 1}</span>
              <span className="text-slate-300 font-mono">{line || ' '}</span>
            </div>
          ))}
        </pre>
      </div>

      {/* Suggested Fix */}
      <div className="p-4 bg-emerald-950/10">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-dark-border text-emerald-400 font-semibold uppercase tracking-wider text-[10px]">
          <span>AI Suggested Fix</span>
          <span>After</span>
        </div>
        <pre className="overflow-x-auto space-y-1">
          {sugLines.map((line, idx) => (
            <div key={idx} className="flex gap-3 hover:bg-emerald-500/10 px-1 py-0.5 rounded bg-emerald-500/5">
              <span className="text-emerald-600/70 select-none w-6 text-right font-mono">{idx + 1}</span>
              <span className="text-emerald-200 font-mono">{line || ' '}</span>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
};

export default DiffViewer;
