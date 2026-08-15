import React, { useEffect, useState } from 'react';
import { ShieldCheck, Bug, Zap, Code2, Wrench } from 'lucide-react';

const ScoreCard = ({ scores = {} }) => {
  const overall = Math.round(scores.overallScore ?? 100);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    // Smooth counter animation after real data arrives
    let start = 0;
    const duration = 600;
    const stepTime = 16;
    const steps = duration / stepTime;
    const increment = (overall - start) / steps;
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if ((increment > 0 && current >= overall) || (increment < 0 && current <= overall)) {
        setAnimatedScore(overall);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.round(current));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [overall]);

  const getGrade = (score) => {
    if (score >= 90) return { letter: 'A', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
    if (score >= 80) return { letter: 'B', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/30' };
    if (score >= 70) return { letter: 'C', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' };
    if (score >= 60) return { letter: 'D', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30' };
    return { letter: 'F', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' };
  };

  const grade = getGrade(overall);

  const dimensions = [
    { name: 'Security', score: scores.securityScore ?? 100, weight: '25%', icon: ShieldCheck, color: 'text-emerald-400', barColor: 'bg-emerald-500' },
    { name: 'Bugs', score: scores.bugScore ?? 100, weight: '25%', icon: Bug, color: 'text-rose-400', barColor: 'bg-rose-500' },
    { name: 'Maintainability', score: scores.maintainabilityScore ?? 100, weight: '20%', icon: Wrench, color: 'text-purple-400', barColor: 'bg-purple-500' },
    { name: 'Performance', score: scores.performanceScore ?? 100, weight: '15%', icon: Zap, color: 'text-amber-400', barColor: 'bg-amber-500' },
    { name: 'Code Quality', score: scores.qualityScore ?? 100, weight: '15%', icon: Code2, color: 'text-sky-400', barColor: 'bg-sky-500' },
  ];

  // SVG Circle Calculations
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="bg-dark-surface border border-dark-border rounded-xl p-6 shadow-xl">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-dark-border">
        {/* Main Score Radial Ring */}
        <div className="flex items-center gap-5">
          <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 88 88">
              <circle
                cx="44"
                cy="44"
                r={radius}
                className="text-dark-border stroke-current"
                strokeWidth="7"
                fill="transparent"
              />
              <circle
                cx="44"
                cy="44"
                r={radius}
                className="text-indigo-500 stroke-current transition-all duration-700 ease-out"
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-white font-mono">{animatedScore}</span>
              <span className="text-[9px] font-mono text-slate-400">/ 100</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold text-white tracking-tight">Code Quality Index</h3>
              <div className={`px-2 py-0.5 rounded text-xs font-black border ${grade.bg} ${grade.color}`}>
                GRADE {grade.letter}
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-1">Combined static rules and Gemini AI vulnerability evaluation score</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            ESLint • Semgrep • Gemini
          </span>
        </div>
      </div>

      {/* Sub-Dimension Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mt-6">
        {dimensions.map((dim) => {
          const Icon = dim.icon;
          const val = Math.round(dim.score);
          return (
            <div key={dim.name} className="bg-dark-bg/80 p-3.5 rounded-lg border border-dark-border flex flex-col justify-between hover:border-dark-hover transition-colors">
              <div className="flex items-center justify-between">
                <Icon className={`w-4 h-4 ${dim.color}`} />
                <span className="text-[10px] font-mono text-slate-500">{dim.weight}</span>
              </div>
              <div className="mt-3">
                <div className="text-base font-bold text-white font-mono">{val}%</div>
                <div className="text-[11px] text-slate-400 font-medium truncate">{dim.name}</div>
              </div>
              <div className="w-full bg-dark-border h-1.5 rounded-full mt-2.5 overflow-hidden">
                <div className={`${dim.barColor} h-full rounded-full transition-all duration-700 ease-out`} style={{ width: `${val}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScoreCard;
