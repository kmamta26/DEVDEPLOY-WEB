import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Github, GitBranch, Terminal, Shield, 
    Zap, Loader2, ArrowRight, BookOpen, 
    CheckCircle2, AlertCircle, RefreshCw, Search,
    Monitor, Globe
} from 'lucide-react';
import api from '../services/api';

const GithubPage = () => {
    const [githubUrl, setGithubUrl] = useState('');
    const [branch, setBranch] = useState('main');
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleDeploy = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);
        try {
            const { data } = await api.post('/github/deploy', { githubUrl, branch });
            setStatus({ type: 'success', message: 'GitHub repository linked. Initializing build pipeline...' });
            setTimeout(() => navigate('/projects'), 3000);
        } catch (err) {
            console.error('Integration Error:', err);
            setStatus({ type: 'error', message: err.response?.data?.error || 'Failed to deploy repository. Check your URL.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade">
            <header style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800' }}>Import from GitHub</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Zero-config CI/CD. Push your code, we do the rest.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem' }}>
                <div className="premium-card">
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Github size={28} /> Connect Repository
                    </h3>
                    
                    <form onSubmit={handleDeploy}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', marginBottom: '0.5rem' }}>Repository URL</label>
                            <input 
                                type="text" 
                                className="form-input" 
                                placeholder="https://github.com/username/repo" 
                                value={githubUrl}
                                onChange={(e) => setGithubUrl(e.target.value)}
                                required 
                            />
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', marginBottom: '0.5rem' }}>Branch (Default)</label>
                            <div style={{ position: 'relative' }}>
                                <GitBranch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} size={18} />
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    style={{ paddingLeft: '3rem' }} 
                                    value={branch}
                                    onChange={(e) => setBranch(e.target.value)}
                                    required 
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem' }} disabled={loading}>
                            {loading ? <Loader2 className="animate-spin" /> : <>Link & Deploy <ArrowRight size={18} /></>}
                        </button>
                    </form>

                    {status && (
                        <div style={{ 
                            marginTop: '2rem', padding: '1.25rem', borderRadius: '16px', 
                            background: status.type === 'success' ? '#f0fdf4' : '#fff1f2',
                            border: `1px solid ${status.type === 'success' ? '#bbf7d0' : '#fecdd3'}`,
                            display: 'flex', alignItems: 'center', gap: '1rem'
                        }}>
                            {status.type === 'success' ? <CheckCircle2 size={24} color="#16a34a" /> : <AlertCircle size={24} color="#ef4444" />}
                            <div>
                                <h4 style={{ fontWeight: '700', color: status.type === 'success' ? '#166534' : '#991b1b' }}>{status.type === 'success' ? 'Perfect!' : 'Integration Error'}</h4>
                                <p style={{ fontSize: '0.9rem', color: status.type === 'success' ? '#166534' : '#991b1b', opacity: 0.8 }}>{status.message}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="premium-card" style={{ background: '#f8fafc' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>How it works</h3>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <li style={{ display: 'flex', gap: '12px', fontSize: '0.95rem' }}>
                                <div style={{ color: 'var(--primary)' }}><Zap size={18} /></div>
                                <span><strong>Cloning:</strong> We securely clone your head revision.</span>
                            </li>
                            <li style={{ display: 'flex', gap: '12px', fontSize: '0.95rem' }}>
                                <div style={{ color: 'var(--primary)' }}><Monitor size={18} /></div>
                                <span><strong>Detection:</strong> Automated build command identification.</span>
                            </li>
                            <li style={{ display: 'flex', gap: '12px', fontSize: '0.95rem' }}>
                                <div style={{ color: 'var(--primary)' }}><Globe size={18} /></div>
                                <span><strong>Live Edge:</strong> Multi-region hosting within minutes.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="premium-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                            <Shield size={20} />
                            <h3 style={{ fontSize: '1.1rem' }}>OAuth Protection</h3>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                            DevDeploy uses GitHub App architecture for granular permissions. We only request read access to code for deployments.
                        </p>
                        <button className="btn-ghost" style={{ width: '100%', border: '1px solid var(--border-subtle)', marginTop: '1.5rem', background: 'white' }}>Security Settings</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GithubPage;
