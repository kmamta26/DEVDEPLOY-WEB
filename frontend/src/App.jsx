import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import GithubPage from './pages/GithubPage';
import AWSPage from './pages/AWSPage';
import RegisterPage from './pages/RegisterPage';

// Protected Layout
const DashboardLayout = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('devdeploy_token');
    
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="app-container">
            <Sidebar />
            <main className="main-content">
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

function App() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected Dashboard Routes */}
            <Route path="/" element={<DashboardLayout />}>
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="upload" element={<UploadPage />} />
                <Route path="projects" element={<ProjectsPage />} />
                <Route path="projects/:id" element={<ProjectDetailsPage />} />
                <Route path="github" element={<GithubPage />} />
                <Route path="aws" element={<AWSPage />} />
            </Route>
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
