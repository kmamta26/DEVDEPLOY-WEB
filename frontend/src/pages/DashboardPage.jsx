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
            
            // Fetch Projects
            const { data: projectsData } = await api.get('/projects');
            setRecentProjects(projectsData.slice(0, 3));

            // Fetch Stats
            const { data: statsData } = await api.get('/dashboard/stats');
            setStats({
                total: statsData.totalProjects,
                active: statsData.activeProjects,
                uptime: statsData.avgUptime + '%',
                bandwidth: statsData.bandwidth
            });

        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: '800', letterSpacing: '-0.025em', color: '#111827' }}>Overview</h1>
                    <p style={{ color: '#64748b', fontSize: '1.05rem', marginTop: '4px' }}>Welcome back to DevDeploy. Your multi-cloud infrastructure is healthy.</p>
                </div>
                <button className="btn-primary" onClick={() => navigate('/upload')} style={{ borderRadius: '12px', padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}>
                    <Plus size={20} strokeWidth={2.5} /> Deploy New App
                </button>
            </header>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {[
                    { label: 'Total Projects', value: stats.total, icon: <Cloud size={18} /> },
                    { label: 'Active Now', value: stats.active, icon: <Zap size={18} />, color: '#10b981' },
                    { label: 'Avg Uptime', value: stats.uptime, icon: <Clock size={18} /> },
                    { label: 'Bandwidth / m', value: stats.bandwidth, icon: <Activity size={18} /> }
                ].map((stat, i) => (
                    <div key={i} className="premium-card" style={{ padding: '1.75rem', borderRadius: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>
                            <span style={{ color: stat.color || 'inherit' }}>{stat.icon}</span>
                            <span style={{ color: stat.color || 'inherit' }}>{stat.label}</span>
                        </div>
                        <h2 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#111827' }}>{stat.value}</h2>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.5rem' }}>
                {/* Main Action Banner */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="premium-card" style={{ 
                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', 
                        color: 'white', 
                        border: 'none', 
                        position: 'relative', 
                        overflow: 'hidden',
                        minHeight: '260px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        padding: '2.5rem'
                    }}>
                        <div style={{ position: 'relative', zIndex: 2 }}>
                            <h2 style={{ color: 'white', fontSize: '2rem', fontWeight: '700', marginBottom: '1rem' }}>Fast-Track Deployment</h2>
                            <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '2rem', maxWidth: '420px', lineHeight: '1.6' }}>
                                Connect your GitHub repository to enable automatic CI/CD and atomic deployments on every push.
                            </p>
                            <button className="btn-primary" style={{ background: 'white', color: '#4f46e5', fontWeight: '700', borderRadius: '10px' }} onClick={() => navigate('/github')}>
                                Connect GitHub Account
                            </button>
                        </div>
                        <div style={{ position: 'absolute', right: '10px', bottom: '-40px', opacity: 0.15 }}>
                            <Github size={280} />
                        </div>
                    </div>
                </div>

                {/* System Health Card */}
                <div className="premium-card" style={{ borderRadius: '20px', padding: '2rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '2rem', color: '#111827' }}>System Health</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                        {[
                            { label: 'CPU USAGE', value: '14%', color: 'var(--primary)' },
                            { label: 'MEM USAGE', value: '2.1GB / 8GB', color: '#f59e0b' },
                            { label: 'DISC I/O', value: 'NORMAL', color: '#10b981' }
                        ].map((metric, i) => (
                            <div key={i}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                                    <span style={{ fontWeight: '600', color: '#475569' }}>{metric.label}</span>
                                    <span style={{ fontWeight: '800', color: '#1e293b' }}>{metric.value}</span>
                                </div>
                                <div className="progress-container" style={{ background: '#f1f5f9' }}>
                                    <div className="progress-bar" style={{ width: metric.value === 'NORMAL' ? '100%' : metric.value, background: metric.color }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
