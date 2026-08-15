import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderGit2, History, GitPullRequest, BarChart3, Settings, X } from 'lucide-react';

const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Projects', path: '/projects', icon: FolderGit2 },
    { label: 'Review History', path: '/reviews', icon: History },
    { label: 'GitHub Repos & PRs', path: '/github', icon: GitPullRequest },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const renderNavContent = () => (
    <div className="flex flex-col h-full justify-between">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
          Platform Workspace
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-dark-hover'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="bg-dark-bg/80 border border-dark-border p-3.5 rounded-xl space-y-1.5 mt-auto">
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Analyzers Online</span>
        </div>
        <p className="text-[11px] text-slate-400 font-mono">ESLint + Semgrep + Gemini AI</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-dark-surface border-r border-dark-border min-h-[calc(100vh-4rem)] p-4 flex-col justify-between shrink-0">
        {renderNavContent()}
      </aside>

      {/* Mobile Navigation Slide-out Drawer Overlay */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onCloseMobile} aria-hidden="true" />
          <nav
            aria-label="Mobile Navigation"
            className="relative z-50 w-72 max-w-[80vw] bg-dark-surface border-r border-dark-border p-4 flex flex-col justify-between h-full shadow-2xl animate-slideUp"
          >
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-dark-border">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Navigation Menu</span>
              <button
                onClick={onCloseMobile}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-dark-hover"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderNavContent()}
          </nav>
        </div>
      )}
    </>
  );
};

export default Sidebar;
