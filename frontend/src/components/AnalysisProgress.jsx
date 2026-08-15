import React from 'react';
import { CheckCircle2, Loader2, Circle } from 'lucide-react';

const AnalysisProgress = ({ currentStage = 'PREPARING' }) => {
  const stages = [
    { key: 'PREPARING', label: 'Preparing Source Code' },
    { key: 'STATIC', label: 'Static Rules & Vulnerability Analysis' },
    { key: 'AI_REASONING', label: 'Gemini AI Context Reasoning' },
    { key: 'SCORING', label: 'Calculating Code Quality Score' },
    { key: 'RECOMMENDATIONS', label: 'Generating Patch Recommendations' },
  ];

  const getStageStatus = (stageKey) => {
    const order = ['PREPARING', 'STATIC', 'AI_REASONING', 'SCORING', 'RECOMMENDATIONS'];
    const currentIndex = order.indexOf(currentStage);
    const stageIndex = order.indexOf(stageKey);

    if (stageIndex < currentIndex) return 'COMPLETED';
    if (stageIndex === currentIndex) return 'IN_PROGRESS';
    return 'PENDING';
  };

  return (
    <div className="bg-dark-surface border border-dark-border rounded-xl p-6 space-y-4 max-w-lg mx-auto shadow-2xl">
      <div className="flex items-center justify-between border-b border-dark-border pb-3">
        <h3 className="text-sm font-bold text-white tracking-tight">Code Analysis Pipeline</h3>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold animate-pulse">
          RUNNING
        </span>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {stages.map((st) => {
          const status = getStageStatus(st.key);
          return (
            <div key={st.key} className="flex items-center justify-between py-1">
              <div className="flex items-center gap-3">
                {status === 'COMPLETED' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                {status === 'IN_PROGRESS' && <Loader2 className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />}
                {status === 'PENDING' && <Circle className="w-4 h-4 text-slate-600 shrink-0" />}

                <span
                  className={
                    status === 'COMPLETED'
                      ? 'text-slate-300 font-semibold line-through decoration-emerald-500/40'
                      : status === 'IN_PROGRESS'
                      ? 'text-indigo-300 font-bold'
                      : 'text-slate-500'
                  }
                >
                  {st.label}
                </span>
              </div>

              <span className="text-[10px]">
                {status === 'COMPLETED' && <span className="text-emerald-400">✓ Done</span>}
                {status === 'IN_PROGRESS' && <span className="text-indigo-400">● Active</span>}
                {status === 'PENDING' && <span className="text-slate-600">○ Pending</span>}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnalysisProgress;
