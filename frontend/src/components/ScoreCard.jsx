import React from 'react';
import { ShieldCheck, Bug, Zap, Code2, Wrench } from 'lucide-react';

const ScoreCard = ({ scores = {} }) => {
  const overall = Math.round(scores.overallScore ?? 100);

  const getGrade = (score) => {
    if (score >= 90) return { letter: 'A', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
    if (score >= 80) return { letter: 'B', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/30' };
    if (score >= 70) return { letter: 'C', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' };
    if (score >= 60) return { letter: 'D', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30' };
    return { letter: 'F', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' };
  };

  const grade = getGrade(overall);

  const dimensions = [
    { name: 'Security', score: scores.securityScore ?? 100, weight: '25%', icon: ShieldCheck, color: 'text-emerald-400' },
    { name: 'Bugs', score: scores.bugScore ?? 100, weight: '25%', icon: Bug, color: 'text-rose-400' },
    { name: 'Maintainability', score: scores.maintainabilityScore ?? 100, weight: '20%', icon: Wrench, color: 'text-purple-400' },
    { name: 'Performance', score: scores.performanceScore ?? 100, weight: '15%', icon: Zap, color: 'text-amber-400' },
    { name: 'Code Quality', score: scores.qualityScore ?? 100, weight: '15%', icon: Code2, color: 'text-sky-400' },
  ];

  return (
    <div className="bg-dark-surface border border-dark-border rounded-xl p-6 shadow-xl">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-dark-border">
        <div className="flex items-center gap-5">
          <div className={`w-20 h-20 rounded-2xl border flex flex-col items-center justify-center font-bold shadow-lg ${grade.bg}`}>
            <span className={`text-3xl font-black ${grade.color}`}>{grade.letter}</span>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5">GRADE</span>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-white tracking-tight">{overall} <span className="text-sm font-medium text-slate-400">/ 100</span></h3>
            <p className="text-sm font-medium text-slate-400 mt-1">Overall Code Quality Index</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Deterministic Engine + AI Reasoning
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
        {dimensions.map((dim) => {
          const Icon = dim.icon;
          const val = Math.round(dim.score);
          return (
            <div key={dim.name} className="bg-dark-bg p-3.5 rounded-lg border border-dark-border flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <Icon className={`w-4 h-4 ${dim.color}`} />
                <span className="text-[10px] font-mono text-slate-500">{dim.weight}</span>
              </div>
              <div className="mt-3">
                <div className="text-lg font-bold text-white font-mono">{val}%</div>
                <div className="text-xs text-slate-400 font-medium truncate">{dim.name}</div>
              </div>
              <div className="w-full bg-dark-border h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${val}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScoreCard;
