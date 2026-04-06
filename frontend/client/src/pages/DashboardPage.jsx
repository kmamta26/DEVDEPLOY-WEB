import React, { useState, useEffect } from 'react';
import { 
    Zap, Activity, Cpu, Cloud, Github, Server, 
    ArrowRight, Clock, Plus, ExternalLink, Globe 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const DashboardPage = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total: 12,
        active: 8,
        uptime: '99.98%',
        bandwidth: '4.2 TB'
    });
    const [recentProjects, setRecentProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/projects');
            setRecentProjects(data.slice(0, 3));
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-0.025em' }}>Overview</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Welcome back to DevDeploy. Your multi-cloud infrastructure is healthy.</p>
                </div>
                <button className="btn-primary" onClick={() => navigate('/upload')}>
                    <Plus size={20} /> Deploy New App
                </button>
            </header>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="premium-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '10px' }}>
                        <Cloud size={16} /> Total Projects
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>{stats.total}</h2>
                </div>
                <div className="premium-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '10px' }}>
                        <Zap size={16} color="#16a34a" /> <span style={{ color: '#16a34a' }}>Active Now</span>
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>{stats.active}</h2>
                </div>
                <div className="premium-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '10px' }}>
                        <Clock size={16} /> Avg Uptime
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>{stats.uptime}</h2>
                </div>
                <div className="premium-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '10px' }}>
                        <Activity size={16} /> Bandwidth / m
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>{stats.bandwidth}</h2>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                {/* Main Action / Recent */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="premium-card" style={{ background: 'var(--primary-gradient)', color: 'white', border: 'none', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'relative', zIndex: 2 }}>
                            <h2 style={{ color: 'white', fontSize: '1.75rem', marginBottom: '0.75rem' }}>Fast-Track Deployment</h2>
                            <p style={{ opacity: 0.9, marginBottom: '2rem', maxWidth: '400px' }}>Connect your GitHub repository to enable automatic CI/CD and atomic deployments on every push.</p>
                            <button className="btn-primary" style={{ background: 'white', color: 'var(--primary)', fontWeight: '700' }} onClick={() => navigate('/github')}>Connect GitHub Account</button>
                        </div>
                        <div style={{ position: 'absolute', right: '-20px', top: '-10px', opacity: 0.2 }}>
                            <Github size={200} />
                        </div>
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem' }}>Recent Activity</h3>
                            <button className="btn-ghost" onClick={() => navigate('/projects')}>View All Projects <ArrowRight size={16} /></button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {recentProjects.map((p, i) => (
                                <div key={i} className="premium-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                    <div style={{ width: '44px', height: '44px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Globe size={22} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ fontSize: '1rem' }}>{p.name}</h4>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.url || 'pending deployment...'}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: p.status === 'Live' ? '#16a34a' : '#854d0e', marginBottom: '4px' }}>{p.status}</div>
                                        <button className="btn-ghost" style={{ padding: '4px 8px' }} onClick={() => navigate(`/projects/${p.id || p._id}`)}><ArrowRight size={16} /></button>
                                    </div>
                                </div>
                            ))}
                            {!loading && recentProjects.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '2rem', border: '1px dashed var(--border-subtle)', borderRadius: '12px' }}>
                                    No active projects. Start by <span style={{ color: 'var(--primary)', cursor: 'pointer' }} onClick={() => navigate('/upload')}>uploading</span> one.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="premium-card">
                        <h3 style={{ marginBottom: '1.5rem' }}>System Health</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                                    <span style={{ fontWeight: '600' }}>CPU USAGE</span>
                                    <span style={{ fontWeight: '800' }}>14%</span>
                                </div>
                                <div className="progress-container"><div className="progress-bar" style={{ width: '14%' }}></div></div>
                            </div>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                                    <span style={{ fontWeight: '600' }}>MEM USAGE</span>
                                    <span style={{ fontWeight: '800' }}>2.1GB / 8GB</span>
                                </div>
                                <div className="progress-container"><div className="progress-bar" style={{ width: '28%', background: '#ff5f56' }}></div></div>
                            </div>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                                    <span style={{ fontWeight: '600' }}>DISC I/O</span>
                                    <span style={{ fontWeight: '800' }}>NORMAL</span>
                                </div>
                                <div className="progress-container"><div className="progress-bar" style={{ width: '100%', background: '#16a34a' }}></div></div>
                            </div>
                        </div>
                    </div>

                    <div className="premium-card" style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                            <Server size={20} color="var(--primary)" />
                            <h3 style={{ fontSize: '1.1rem' }}>Active Infrastructure</h3>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                            All nodes in <strong>us-east-1</strong> are healthy. Current latency 12ms.
                        </p>
                        <button className="btn-ghost" style={{ width: '100%', border: '1px solid #e2e8f0', marginTop: '1.5rem', background: 'white' }}>System Status</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
