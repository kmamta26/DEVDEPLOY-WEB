import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CloudUpload, FolderOpen, Github, Server, LogOut, Shield, Zap } from 'lucide-react';

const Sidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('devdeploy_token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <aside className="sidebar">
            <div className="logo-section" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '3rem', paddingLeft: '0.5rem' }}>
                <div style={{ width: '40px', height: '40px', background: 'var(--primary-gradient)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', boxShadow: '0 4px 10px rgba(124, 58, 237, 0.3)' }}>
                    <Zap size={24} fill="white" />
                </div>
                <h2 className="sidebar-label" style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.02em', background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>DevDeploy</h2>
            </div>

            <nav style={{ flex: 1 }}>
                <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <LayoutDashboard size={20} />
                    <span className="sidebar-label">Dashboard</span>
                </NavLink>

                <NavLink to="/upload" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <CloudUpload size={20} />
                    <span className="sidebar-label">Upload Project</span>
                </NavLink>

                <NavLink to="/projects" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <FolderOpen size={20} />
                    <span className="sidebar-label">My Projects</span>
                </NavLink>

                <div style={{ margin: '1.5rem 0 1rem 0.5rem', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }} className="sidebar-label">
                    Integrations
                </div>

                <NavLink to="/github" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <Github size={20} />
                    <span className="sidebar-label">GitHub Import</span>
                </NavLink>

                <NavLink to="/aws" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <Server size={20} />
                    <span className="sidebar-label">AWS Console</span>
                </NavLink>
            </nav>

            <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
                <button className="nav-link" onClick={handleLogout} style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}>
                    <LogOut size={20} />
                    <span className="sidebar-label">Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
