import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Zap, Rocket, Shield, Github, Server, 
    ArrowRight, CheckCircle2, Globe, Cpu 
} from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    const features = [
        { icon: <Rocket size={24} />, title: "Instant Deployment", desc: "Push your code and watch it go live in seconds with our optimized build pipeline." },
        { icon: <Shield size={24} />, title: "Secure by Default", desc: "Enterprise-grade SSL termination and isolated environments for every project." },
        { icon: <Github size={24} />, title: "GitHub Sync", desc: "Automatic deployments on every push. Perfect CI/CD integration with your workflow." },
        { icon: <Server size={24} />, title: "AWS Powered", desc: "Scale instantly with deep AWS integration. Manage EC2 and S3 without the complexity." },
        { icon: <Globe size={24} />, title: "Global CDN", desc: "Your users get sub-millisecond latency with our high-performance edge network." },
        { icon: <Cpu size={24} />, title: "Edge Computing", desc: "Run your serverless functions closer to your users for maximum performance." }
    ];

    return (
        <div className="bg-white min-h-screen overflow-x-hidden">
            {/* Header / Nav */}
            <header style={{ 
                position: 'fixed', top: 0, width: '100%', padding: '1.5rem 2rem', 
                background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                zIndex: 100, borderBottom: '1px solid var(--border-subtle)' 
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ 
                        width: '32px', height: '32px', background: 'var(--primary-gradient)', 
                        borderRadius: '8px', display: 'flex', alignItems: 'center', 
                        justifyContent: 'center', color: 'white', fontWeight: '800' 
                    }}>
                        <Zap size={18} fill="white" />
                    </div>
                    <span style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.025em' }}>DevDeploy</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn-ghost" onClick={() => navigate('/login')}>Login</button>
                    <button className="btn-primary" onClick={() => navigate('/register')}>Start Deploying <ArrowRight size={18} /></button>
                </div>
            </header>

            {/* Hero Section */}
            <main>
                <section className="hero-section" style={{ paddingTop: '10rem' }}>
                    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1rem' }}>
                        <div className="animate-fade" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '100px', fontSize: '0.875rem', fontWeight: '700', marginBottom: '2rem' }}>
                            <Zap size={14} fill="currentColor" /> Latest: AWS Phase 2 Integration Active
                        </div>
                        <h1 className="animate-fade" style={{ fontSize: 'clamp(3rem, 8vw, 4.5rem)', lineHeight: '1.1', marginBottom: '1.5rem', fontWeight: '800', letterSpacing: '-0.04em' }}>
                            Deploy Your Vision with <span className="gradient-text">DevDeploy</span>
                        </h1>
                        <p className="animate-fade" style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '3rem', maxWidth: '650px', margin: '0 auto 3rem' }}>
                            A high-performance deployment platform for modern developers. Zero configuration, maximum scalability, and beautiful management.
                        </p>
                        <div className="animate-fade" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                            <button className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }} onClick={() => navigate('/register')}>Get Started for Free</button>
                            <button className="btn-secondary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>Read Docs</button>
                        </div>
                    </div>

                    <div style={{ marginTop: '5rem', position: 'relative' }} className="animate-fade">
                        <div style={{ 
                            maxWidth: '1000px', margin: '0 auto', background: 'white', 
                            padding: '1rem', borderRadius: '24px', boxShadow: 'var(--shadow-xl)', 
                            border: '1px solid var(--border-subtle)', position: 'relative', zindex: 10 
                        }}>
                             <img src="https://images.unsplash.com/photo-1551288049-bbb6532831ad?auto=format&fit=crop&q=80&w=2000" 
                                  alt="Dashboard Preview" 
                                  style={{ width: '100%', borderRadius: '16px', display: 'block' }} 
                             />
                        </div>
                        {/* Abstract Background Blurs */}
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80%', height: '80%', background: 'var(--primary-light)', filter: 'blur(100px)', borderRadius: '50%', opacity: 0.4, zIndex: 0 }}></div>
                    </div>
                </section>

                {/* Features section */}
                <section style={{ padding: '8rem 2rem', background: '#fbfbff' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Built for the Modern Workflow</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Everything you need to go from idea to production in minutes.</p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2.5rem' }}>
                            {features.map((f, i) => (
                                <div key={i} className="premium-card">
                                    <div style={{ width: '56px', height: '56px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                        {f.icon}
                                    </div>
                                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{f.title}</h3>
                                    <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Call to action */}
                <section style={{ padding: '6rem 2rem' }}>
                    <div style={{ 
                        maxWidth: '1200px', margin: '0 auto', background: 'var(--primary-gradient)', 
                        padding: '4rem 2rem', borderRadius: '32px', textAlign: 'center', color: 'white' 
                    }}>
                        <h2 style={{ fontSize: '2.5rem', color: 'white', marginBottom: '1rem' }}>Ready to Scale Your App?</h2>
                        <p style={{ fontSize: '1.2rem', marginBottom: '2.5rem', opacity: 0.9 }}>Join 10,000+ developers deploying on DevDeploy.</p>
                        <button className="btn-primary" style={{ background: 'white', color: 'var(--primary)', margin: '0 auto' }} onClick={() => navigate('/register')}>Start Deploying Today</button>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer style={{ padding: '4rem 2rem', borderTop: '1px solid var(--border-subtle)', background: 'white' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '3rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
                            <div style={{ width: '24px', height: '24px', background: 'var(--primary-gradient)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                <Zap size={14} fill="white" />
                            </div>
                            <span style={{ fontWeight: '800' }}>DevDeploy</span>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '300px' }}>
                            The premium multi-cloud deployment platform for high-performance teams.
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '4rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Product</h4>
                            <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Features</a>
                            <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Integrations</a>
                            <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Status</a>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Company</h4>
                            <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>About</a>
                            <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Careers</a>
                            <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Contact</a>
                        </div>
                    </div>
                </div>
                <div style={{ maxWidth: '1200px', margin: '3rem auto 0', paddingTop: '2rem', borderTop: '1px solid var(--border-subtle)', color: 'var(--text-light)', fontSize: '0.875rem' }}>
                    © 2026 DevDeploy Cloud. All rights reserved. Built for professional developers.
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
