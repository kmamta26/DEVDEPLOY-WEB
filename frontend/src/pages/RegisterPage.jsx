import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, Loader2, ArrowRight, User, Zap, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    useEffect(() => {
        if (localStorage.getItem('token') || localStorage.getItem('devdeploy_token')) {
            navigate('/dashboard');
        }
    }, [navigate]);

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const { data } = await api.post('/register', { username: name, email, password });
            
            const token = data.token || data.data?.token;
            if (!token) throw new Error('Registration failed');

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(data.user || data.data?.user));
            
            setSuccess('Account established successfully!');
            setTimeout(() => navigate('/dashboard'), 1000);

        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please check your data or server status.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '2rem' }}>
            <div style={{ position: 'absolute', top: '2rem', left: '2rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => navigate('/')}>
                <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)' }}>
                    <Zap size={18} fill="white" />
                </div>
                <span style={{ fontWeight: '900', letterSpacing: '-0.03em', fontSize: '1.25rem', color: '#1e293b' }}>DevDeploy</span>
            </div>

            <div className="premium-card" style={{ width: '100%', maxWidth: '440px', padding: '3.5rem 2.8rem', background: '#ffffff', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)', border: '1px solid #f1f5f9' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h1 style={{ fontSize: '2.25rem', marginBottom: '0.6rem', fontWeight: '900', letterSpacing: '-0.04em', color: '#0f172a' }}>Get Started</h1>
                    <p style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: '500' }}>Join the community of modern developers</p>
                </div>

                {error && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#dc2626', padding: '1rem', borderRadius: '16px', fontSize: '0.85rem', marginBottom: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Shield size={18} /> {error}
                    </div>
                )}

                {success && (
                    <div style={{ background: '#f0fdf4', border: '1px solid #dcfce7', color: '#16a34a', padding: '1rem', borderRadius: '16px', fontSize: '0.85rem', marginBottom: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <CheckCircle2 size={18} /> {success}
                    </div>
                )}

                <form onSubmit={handleRegister}>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.6rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
                        <div style={{ position: 'relative' }}>
                            <User style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={20} />
                            <input 
                                type="text" 
                                className="form-input" 
                                style={{ padding: '1rem 1rem 1rem 3.5rem', width: '100%', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', transition: 'all 0.2s' }} 
                                placeholder="Your Name" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required 
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.6rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={20} />
                            <input 
                                type="email" 
                                className="form-input" 
                                style={{ padding: '1rem 1rem 1rem 3.5rem', width: '100%', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', transition: 'all 0.2s' }} 
                                placeholder="name@company.com" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required 
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '2.2rem' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.6rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Security Key</label>
                        <div style={{ position: 'relative' }}>
                            <Lock style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={20} />
                            <input 
                                type="password" 
                                className="form-input" 
                                style={{ padding: '1rem 1rem 1rem 3.5rem', width: '100%', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', transition: 'all 0.2s' }} 
                                placeholder="••••••••" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" 
                        style={{ width: '100%', padding: '1.1rem', background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)', color: 'white', border: 'none', borderRadius: '16px', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 10px 15px -3px rgba(168, 85, 247, 0.4)' }} 
                        disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <>Sign Up <ArrowRight size={20} /></>}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '0.9rem', color: '#64748b', paddingTop: '1.8rem', borderTop: '1px solid #f1f5f9' }}>
                    Already member? <span style={{ color: '#8b5cf6', fontWeight: '800', cursor: 'pointer' }} onClick={() => navigate('/login')}>Sign Back In</span>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;

