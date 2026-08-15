import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Cpu, GitBranch, Bell, Shield, CheckCircle2 } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);

  // Form State
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [aiProvider, setAiProvider] = useState('gemini');

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'ai', label: 'AI Preferences', icon: Cpu },
    { id: 'github', label: 'GitHub Connection', icon: GitBranch },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Data', icon: Shield },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Account & Platform Settings</h1>
        <p className="text-xs text-slate-400 mt-1">Manage profile, authentication security, AI providers, and GitHub connection preferences</p>
      </div>

      {saved && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3.5 rounded-xl text-xs flex items-center gap-2 font-mono">
          <CheckCircle2 className="w-4 h-4" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Settings Navigation Tabs */}
        <div className="bg-dark-surface border border-dark-border p-2 rounded-xl h-fit space-y-1 shadow-xl">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === t.id
                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-dark-hover'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Area */}
        <div className="md:col-span-3 bg-dark-surface border border-dark-border p-6 rounded-xl space-y-6 shadow-xl">
          {activeTab === 'profile' && (
            <form onSubmit={handleSave} className="space-y-4 text-xs max-w-md">
              <h3 className="text-sm font-bold text-white mb-2">Personal Profile</h3>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full bg-dark-bg/50 border border-dark-border rounded-xl p-3 text-slate-500 font-mono cursor-not-allowed"
                />
              </div>

              <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30">
                Save Profile
              </button>
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handleSave} className="space-y-4 text-xs max-w-md">
              <h3 className="text-sm font-bold text-white mb-2">Change Password</h3>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30">
                Update Password
              </button>
            </form>
          )}

          {activeTab === 'ai' && (
            <form onSubmit={handleSave} className="space-y-4 text-xs max-w-md">
              <h3 className="text-sm font-bold text-white mb-2">AI Engine Provider Preferences</h3>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Active AI Provider</label>
                <select
                  value={aiProvider}
                  onChange={(e) => setAiProvider(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-white font-mono focus:outline-none focus:border-indigo-500"
                >
                  <option value="gemini">Google Gemini (Recommended)</option>
                  <option value="openai">OpenAI GPT-4 Turbo</option>
                  <option value="mock">Development Mock Mode</option>
                </select>
              </div>

              <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30">
                Save AI Preference
              </button>
            </form>
          )}

          {activeTab === 'github' && (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-white">GitHub OAuth Connection</h3>
              <p className="text-slate-400 leading-relaxed">Connected account enables repository scanning and PR code reviews.</p>
              <div className="p-4 bg-dark-bg border border-dark-border rounded-xl flex items-center justify-between font-mono">
                <span className="text-emerald-400 font-bold">Status: Connected</span>
                <button onClick={handleSave} className="text-red-400 hover:underline">
                  Disconnect
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-white">Notification Preferences</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 text-slate-300 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-dark-border text-indigo-600 focus:ring-0 bg-dark-bg" />
                  <span>Email me when critical security vulnerabilities are detected</span>
                </label>
                <label className="flex items-center gap-3 text-slate-300 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-dark-border text-indigo-600 focus:ring-0 bg-dark-bg" />
                  <span>Notify when PR reviews are ready for developer comment approval</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-rose-400">Data Privacy & Account Deletion</h3>
              <p className="text-slate-400 leading-relaxed">
                Deleting your account will purge all associated projects, code review history, findings, and connected OAuth credentials.
              </p>
              <button
                onClick={() => alert('Account deletion requested')}
                className="bg-red-600/10 border border-red-500/30 text-red-400 hover:bg-red-600 hover:text-white font-bold px-4 py-2.5 rounded-xl transition-all"
              >
                Delete Account & Purge Data
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
