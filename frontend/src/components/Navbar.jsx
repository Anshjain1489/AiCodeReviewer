import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Bell, User, LogOut, Code, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-dark-surface/80 backdrop-blur-md border-b border-dark-border sticky top-0 z-30 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-white tracking-tight">AI Code Reviewer</span>
            <span className="ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">PRO</span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <Link
          to="/reviews/new"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-md shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Review</span>
        </Link>

        <div className="h-6 w-px bg-dark-border" />

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-dark-border flex items-center justify-center text-slate-300 font-semibold text-xs">
            {user?.name ? user.name[0].toUpperCase() : <User className="w-4 h-4" />}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-white leading-none">{user?.name || 'Developer'}</div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{user?.email || 'dev@example.com'}</div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            title="Sign out"
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-dark-border rounded-lg transition-colors ml-2"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
