import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FolderGit2, Plus, ArrowRight, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import api from '../services/api';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Project Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/projects');
      if (res.success && res.data.projects) {
        setProjects(res.data.projects);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError('Failed to load projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/projects', { name, description, language, repositoryUrl });
      setIsModalOpen(false);
      setName('');
      setDescription('');
      fetchProjects();
    } catch (err) {
      alert(err.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProject = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this project workspace?')) return;
    try {
      await api.delete(`/projects/${id}`);
      fetchProjects();
    } catch (err) {
      alert('Failed to delete project');
    }
  };

  if (error) {
    return <ErrorState message={error} onRetry={fetchProjects} />;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Project Workspaces</h1>
          <p className="text-xs text-slate-400 mt-1">Organize source code reviews and quality scores by repository project</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/30 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <Skeleton variant="card" count={6} />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          title="No Project Workspaces"
          description="Create a project workspace to track code reviews, quality scores, and file history."
          actionLabel="Create Project"
          onAction={() => setIsModalOpen(true)}
          actionIcon={Plus}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="bg-dark-surface border border-dark-border hover:border-indigo-500/40 p-5 rounded-xl transition-all space-y-4 flex flex-col justify-between group shadow-sm"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
                    {proj.language || 'javascript'}
                  </span>
                  <button
                    onClick={(e) => handleDeleteProject(proj.id, e)}
                    className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors"
                    title="Delete project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">{proj.name}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{proj.description || 'No description provided.'}</p>
              </div>

              <div className="pt-4 border-t border-dark-border flex items-center justify-between text-xs">
                <span className="text-slate-500 font-mono">{proj._count?.reviews || 0} reviews</span>
                <Link
                  to={`/projects/${proj.id}`}
                  className="font-bold text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <span>Project Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Project Workspace">
        <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Project Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Authentication Microservice"
              className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of repository scope or service requirements..."
              className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 h-20"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Primary Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-white font-mono focus:outline-none focus:border-indigo-500"
            >
              <option value="javascript">JavaScript / Node.js</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="go">Go</option>
            </select>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-dark-border">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30"
            >
              {creating ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Projects;
