import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Upload, Code2, FolderGit2, AlertTriangle, Sparkles, FileText } from 'lucide-react';
import api from '../services/api';
import AnalysisProgress from '../components/AnalysisProgress';

const DEFAULT_SAMPLE_CODE = `// Sample JavaScript Code with Security & Quality Vulnerabilities
const express = require('express');
const app = express();

var userSecretKey = "secret_key_12345"; // Hardcoded credential

app.post('/api/user/query', (req, res) => {
  const userId = req.body.userId;
  
  // Potential RCE vulnerability
  eval("console.log('Query user: ' + " + userId + ")");

  // Potential SQL Injection
  const rawSql = "SELECT * FROM users WHERE id = '" + userId + "'";
  
  res.json({ status: "success", query: rawSql });
});

app.listen(3000, () => console.log('Server started on port 3000'));
`;

const NewReview = () => {
  const [code, setCode] = useState(DEFAULT_SAMPLE_CODE);
  const [language, setLanguage] = useState('javascript');
  const [projectId, setProjectId] = useState('');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState('PREPARING');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects');
        if (res.success && res.data.projects) {
          setProjects(res.data.projects);
          if (res.data.projects.length > 0) {
            setProjectId(res.data.projects[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch user projects:', err);
      }
    };
    fetchProjects();
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCode(event.target.result);
    };
    reader.readAsText(file);
  };

  const handleStartReview = async () => {
    if (!code.trim()) {
      setError('Please provide source code to analyze.');
      return;
    }

    setError('');
    setLoading(true);
    setCurrentStage('PREPARING');

    try {
      const res = await api.post('/reviews', {
        projectId: projectId || undefined,
        code,
        language,
        sourceType: 'MANUAL',
      });

      if (res.success && res.data.reviewId) {
        const reviewId = res.data.reviewId;

        // Simulated progress stages correlating to backend evaluation
        setCurrentStage('STATIC');
        setTimeout(() => setCurrentStage('AI_REASONING'), 800);
        setTimeout(() => setCurrentStage('SCORING'), 1600);

        const pollInterval = setInterval(async () => {
          try {
            const check = await api.get(`/reviews/${reviewId}`);
            if (check.success && check.data.review) {
              const status = check.data.review.status;
              if (status === 'COMPLETED' || status === 'FAILED') {
                setCurrentStage('RECOMMENDATIONS');
                clearInterval(pollInterval);
                setTimeout(() => navigate(`/reviews/${reviewId}`), 400);
              }
            }
          } catch (pollErr) {
            clearInterval(pollInterval);
            navigate(`/reviews/${reviewId}`);
          }
        }, 1200);
      }
    } catch (err) {
      setError(err.message || 'Failed to initiate code review.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">New Code Review Workspace</h1>
          <p className="text-xs text-slate-400 mt-1">Paste code or upload files for instant ESLint, Semgrep, and Gemini AI analysis</p>
        </div>
      </div>

      {/* Workspace Header Toolbar */}
      <div className="bg-dark-surface border border-dark-border p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <Code2 className="w-4 h-4 text-indigo-400" />
            <span>Language:</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-dark-bg border border-dark-border text-white rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-indigo-500"
            >
              <option value="javascript">JavaScript / Node.js</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="go">Go</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <FolderGit2 className="w-4 h-4 text-sky-400" />
            <span>Project:</span>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="bg-dark-bg border border-dark-border text-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="">(Standalone Code Review)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <button
            type="button"
            onClick={() => setCode(DEFAULT_SAMPLE_CODE)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-dark-bg border border-dark-border px-3 py-1.5 rounded-lg transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>Load Preset Sample</span>
          </button>

          <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-dark-bg border border-dark-border px-3 py-1.5 rounded-lg transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File</span>
            <input type="file" accept=".js,.ts,.jsx,.tsx,.py,.java,.go,.txt" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={handleStartReview}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 py-2 rounded-lg transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'Analyzing Code...' : 'Analyze Code'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Analysis Pipeline Progress Overlay */}
      {loading ? (
        <div className="py-8">
          <AnalysisProgress currentStage={currentStage} />
        </div>
      ) : (
        /* Monaco Code Editor Workspace */
        <div className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden shadow-2xl">
          <div className="bg-dark-bg/80 border-b border-dark-border px-4 py-2.5 flex items-center justify-between text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span>editor.js — Source Code Editor Workspace</span>
            </div>
            <div>{code.split('\n').length} Lines</div>
          </div>

          <div className="h-[550px] w-full">
            <Editor
              height="100%"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                fontSize: 13,
                fontFamily: 'JetBrains Mono',
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                lineNumbers: 'on',
                padding: { top: 12, bottom: 12 },
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default NewReview;
