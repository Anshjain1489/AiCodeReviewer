import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-dark-bg text-slate-100 flex flex-col justify-center items-center p-4 antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      <div className="mb-8 flex flex-col items-center text-center">
        <Link to="/" className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 mb-3 transition-transform hover:scale-105">
          <Shield className="w-7 h-7" />
        </Link>
        <h1 className="text-2xl font-black text-white tracking-tight">AI Code Reviewer</h1>
        <p className="text-xs text-slate-400 mt-1 font-mono">Automated Static Analysis & AI Bug Detection</p>
      </div>

      <div className="w-full max-w-md bg-dark-surface border border-dark-border rounded-2xl p-8 shadow-2xl animate-fadeIn">
        <Outlet />
      </div>

      <footer className="mt-8 text-xs text-slate-500 font-mono text-center">
        © 2026 AI Code Reviewer Platform. Built for developers.
      </footer>
    </div>
  );
};

export default AuthLayout;
