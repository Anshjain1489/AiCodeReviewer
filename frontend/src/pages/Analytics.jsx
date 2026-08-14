import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import api from '../services/api';

const COLORS = ['#EF4444', '#F97316', '#F59E0B', '#3B82F6', '#6B7280'];

const Analytics = () => {
  const [trends, setTrends] = useState([]);
  const [issuesDist, setIssuesDist] = useState({ bySeverity: [], byCategory: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [tRes, iRes] = await Promise.all([
          api.get('/dashboard/trends'),
          api.get('/dashboard/issues'),
        ]);

        if (tRes.success) setTrends(tRes.data.trends || []);
        if (iRes.success) setIssuesDist(iRes.data);
      } catch (err) {
        console.error('Failed to load analytics data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-slate-400">Loading code intelligence analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Code Review Analytics</h1>
        <p className="text-xs text-slate-400 mt-1">Deep analytics on vulnerability frequency, code score stability, and issue distributions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score & Security Trend */}
        <div className="bg-dark-surface border border-dark-border p-6 rounded-xl space-y-4">
          <h3 className="text-sm font-bold text-white tracking-tight">Security & Quality Trend</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends}>
                <XAxis dataKey="date" stroke="#4B5563" fontSize={10} />
                <YAxis stroke="#4B5563" fontSize={10} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="score" stroke="#6366F1" fill="#6366F1" fillOpacity={0.2} name="Overall Score" />
                <Area type="monotone" dataKey="security" stroke="#10B981" fill="#10B981" fillOpacity={0.1} name="Security Score" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="bg-dark-surface border border-dark-border p-6 rounded-xl space-y-4">
          <h3 className="text-sm font-bold text-white tracking-tight">Issue Severity Breakdown</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={issuesDist.bySeverity}>
                <XAxis dataKey="name" stroke="#4B5563" fontSize={10} />
                <YAxis stroke="#4B5563" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="value" fill="#4F46E5" radius={[4, 4, 0, 0]}>
                  {issuesDist.bySeverity.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
