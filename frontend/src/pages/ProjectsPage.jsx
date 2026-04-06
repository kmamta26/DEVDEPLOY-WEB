import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Search, Filter, Plus, ExternalLink, Trash2, 
    Clock, Monitor, Link as LinkIcon, MoreVertical,
    CheckCircle2, Loader2, Globe
} from 'lucide-react';
import api from '../services/api';

const ProjectsPage = () => {
    const [projects, setProjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/projects');
            setProjects(data);
        } catch (err) {
            console.error('Failed to fetch projects:', err);
        } finally {
            setLoading(false);
        }
    };

    const deleteProject = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm('Delete this project?')) return;
        try {
            await api.delete(`/projects/${id}`);
            setProjects(prev => prev.filter(p => p.id !== id && p._id !== id));
        } catch (err) { alert('Delete failed.'); }
    };

    const filteredProjects = projects.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-fade">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800' }}>My Projects</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Active deployments across all cloud clusters.</p>
                </div>
                <button className="btn-primary" onClick={() => navigate('/upload')}>
                    <Plus size={20} /> Create New
                </button>
            </header>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} size={18} />
                    <input 
                        type="text" 
                        className="form-input" 
                        placeholder="Search projects..." 
                        style={{ paddingLeft: '3rem' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="btn-secondary"><Filter size={18} /></button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '5rem' }}>
                    <Loader2 className="animate-spin" size={40} color="var(--primary)" />
                </div>
            ) : (
                <div className="projects-grid">
                    {filteredProjects.map((project) => {
                        const isLive = project.status === 'Live' || project.status === 'running';
                        return (
                            <div 
                                key={project.id || project._id} 
                                className="premium-card" 
                                style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
                                onClick={() => navigate(`/projects/${project.id || project._id}`)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                    <div style={{ 
                                        width: '48px', height: '48px', background: 'var(--primary-light)', 
                                        borderRadius: '12px', display: 'flex', alignItems: 'center', 
                                        justifyContent: 'center', color: 'var(--primary)' 
                                    }}>
                                        <Monitor size={24} />
                                    </div>
                                    <span className={`badge ${isLive ? 'badge-success' : 'badge-warning'}`}>
                                        {project.status}
                                    </span>
                                </div>

                                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{project.name}</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }} className="sidebar-label">
                                    <Globe size={12} inline /> {project.url || 'subdomain.devdeploy.io'}
                                </p>

                                <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        <Clock size={14} /> 2 days ago
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className="btn-ghost" style={{ padding: '8px', borderRadius: '8px' }} onClick={(e) => { e.stopPropagation(); window.open(project.url, '_blank'); }}>
                                            <ExternalLink size={16} />
                                        </button>
                                        <button 
                                            className="btn-ghost" 
                                            style={{ padding: '8px', borderRadius: '8px', color: '#ef4444' }}
                                            onClick={(e) => deleteProject(project.id || project._id, e)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {!loading && filteredProjects.length === 0 && (
                <div style={{ textAlign: 'center', padding: '5rem', background: '#f8fafc', borderRadius: '24px', border: '2px dashed var(--border-subtle)' }}>
                    <Monitor size={48} color="var(--text-light)" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ marginBottom: '0.5rem' }}>No projects found</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Try a different search or create your first deployment.</p>
                </div>
            )}
        </div>
    );
};

export default ProjectsPage;
