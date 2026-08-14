import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FolderGit2, Plus, ArrowLeft, History, Code2 } from 'lucide-react';
import api from '../services/api';

const ProjectDetails = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/projects/${projectId}`);
        if (res.success && res.data.project) {
          setProject(res.data.project);
        }
      } catch (err) {
        console.error('Failed to load project details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjectDetails();
  }, [projectId]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-slate-400">Loading project details...</span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12 text-slate-400 text-xs">
        Project not found. <Link to="/projects" className="text-indigo-400 underline">Return to Projects</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link to="/projects" className="text-slate-400 hover:text-white">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">{project.name}</h1>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {project.language}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">{project.description || 'No description available.'}</p>
        </div>

        <Link
          to={`/reviews/new`}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>New Review for Project</span>
        </Link>
      </div>

      <div className="bg-dark-surface border border-dark-border p-6 rounded-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-dark-border">
          <h3 className="text-sm font-bold text-white tracking-tight">Project Review History</h3>
          <span className="text-xs font-mono text-slate-400">{project.reviews?.length || 0} Total Reviews</span>
        </div>

        {project.reviews?.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 font-mono">
            No code reviews generated for this project yet.
          </div>
        ) : (
          <div className="divide-y divide-dark-border text-xs font-mono">
            {project.reviews.map((rev) => (
              <div key={rev.id} className="py-3.5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Review ID: {rev.id.substring(0, 8)}</div>
                  <div className="text-slate-500 text-[11px]">Source: {rev.sourceType} • Created: {new Date(rev.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-indigo-400">{rev.overallScore ? `${Math.round(rev.overallScore)}/100` : 'N/A'}</span>
                  <Link to={`/reviews/${rev.id}`} className="text-xs font-semibold text-indigo-400 hover:underline">
                    View Results
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;
