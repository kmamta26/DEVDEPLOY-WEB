import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ExternalLink, Terminal, Cpu, Activity, Clock, 
    RefreshCcw, Globe, Shield, Trash2, ArrowLeft, 
    CheckCircle2, AlertCircle, Loader2, Play
} from 'lucide-react';
import api from '../services/api';

const ProjectDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState([]);
    const logContainerRef = useRef(null);

    useEffect(() => {
        fetchProject();
        fetchLogs();

        // Poll logs if project is building
        let interval = null;
        if (project?.status === 'building' || project?.status === 'deploying') {
            interval = setInterval(fetchLogs, 3000);
        }
        return () => clearInterval(interval);
    }, [id, project?.status]);

    const fetchLogs = async () => {
        try {
            const { data } = await api.get(`/projects/${id}/logs`);
            if (data.logs) setLogs(data.logs);
        } catch (err) { /* ignore log fetch errors if project is new */ }
    };

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);

    const fetchProject = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/projects');
            const found = data.find(p => p.id === id || p._id === id);
            if (found) setProject(found);
            else navigate('/projects');
        } catch (err) {
            console.error('Failed to fetch project detail:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you absolutely sure you want to delete this project? This cannot be undone.')) return;
        try {
            await api.delete(`/projects/${project.id || project._id}`);
            navigate('/projects');
        } catch (err) { alert('Failed to delete project.'); }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                <Loader2 className="animate-spin" size={48} color="var(--primary)" />
            </div>
        );
    }

    if (!project) return <div>Project not found.</div>;

    const isLive = project.status === 'Live' || project.status === 'running';

    return (
        <div className="animate-fade">
            <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <button className="btn-ghost" onClick={() => navigate('/projects')} style={{ paddingLeft: 0, marginBottom: '1rem', color: 'var(--primary)', fontWeight: '700' }}>
                        <ArrowLeft size={18} /> Back to Projects
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '800' }}>{project.name}</h1>
                        <span className={`badge ${isLive ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.85rem' }}>
                            {isLive ? <CheckCircle2 size={12} inline /> : <Loader2 size={12} className="animate-spin" inline />} {project.status}
                        </span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '0.5rem' }}>ID: {project.id || project._id} • Region: us-east-1</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn-secondary" onClick={() => window.open(project.url || '#', '_blank')}>
                        <ExternalLink size={18} /> Visit Site
                    </button>
                    <button className="btn-ghost" style={{ color: '#ef4444' }} onClick={handleDelete}>
                        <Trash2 size={18} /> Delete
                    </button>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="premium-card">
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem' }}>URL</div>
                    <a href={project.url} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600', fontSize: '1.1rem' }}>{project.url?.split('//')[1] || 'site.devdeploy.io'}</a>
                </div>
                <div className="premium-card">
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Last Build</div>
                    <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{new Date(project.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="premium-card">
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Environment</div>
                    <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>Production</div>
                </div>
                <div className="premium-card">
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Type</div>
                    <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{project.type || 'React App'}</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700' }}><Terminal size={20} /> Deployment Logs</div>
                        <button className="btn-ghost" style={{ padding: '6px 12px', fontSize: '0.85rem' }} onClick={() => setLogs(prev => [...prev, `[${new Date().toISOString()}] Manual refresh triggered.`])}>
                            <RefreshCcw size={14} /> Clear
                        </button>
                    </div>
                    <div style={{ 
                        background: '#0f172a', color: '#e2e8f0', padding: '1.5rem', 
                        fontFamily: 'JetBrains Mono, monospace', fontSize: '0.875rem', 
                        height: '450px', overflowY: 'auto' 
                    }} ref={logContainerRef}>
                        {logs.map((log, i) => (
                            <div key={i} style={{ marginBottom: '0.5rem', display: 'flex', gap: '1rem' }}>
                                <span style={{ color: '#64748b', userSelect: 'none' }}>{i + 1}</span>
                                <span>{log}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="premium-card">
                        <h3 style={{ marginBottom: '1.5rem' }}>Global Analytics</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>Active Users</span>
                                    <span style={{ fontSize: '0.875rem', fontWeight: '800', color: 'var(--primary)' }}>245</span>
                                </div>
                                <div className="progress-container"><div className="progress-bar" style={{ width: '65%' }}></div></div>
                            </div>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>Cache Hit Rate</span>
                                    <span style={{ fontSize: '0.875rem', fontWeight: '800', color: '#16a34a' }}>98.2%</span>
                                </div>
                                <div className="progress-container"><div className="progress-bar" style={{ width: '98%', background: '#16a34a' }}></div></div>
                            </div>
                        </div>
                    </div>

                    <div className="premium-card" style={{ background: 'var(--primary-light)', borderColor: '#ddd6fe' }}>
                        <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Configuration</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Managing build settings and environment variables.</p>
                        <button className="btn-primary" style={{ width: '100%' }}>Manage Domains</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetailsPage;
