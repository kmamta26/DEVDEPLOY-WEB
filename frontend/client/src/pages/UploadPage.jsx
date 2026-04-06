import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    CloudUpload, FileCode, CheckCircle2, 
    AlertCircle, Loader2, ArrowRight, X, Info
} from 'lucide-react';
import api from '../services/api';

const UploadPage = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState(null);
    const navigate = useNavigate();

    const handleFile = (e) => {
        const selected = e.target.files[0];
        if (selected && selected.name.endsWith('.zip')) {
            setFile(selected);
            setStatus(null);
        } else {
            setStatus({ type: 'error', message: 'Please upload a .zip archive.' });
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setStatus(null);
        
        let simProgress = 0;
        const interval = setInterval(() => {
            simProgress += Math.random() * 20;
            if (simProgress >= 90) clearInterval(interval);
            setProgress(Math.min(simProgress, 90));
        }, 300);

        const formData = new FormData();
        formData.append('zipFile', file);
        formData.append('name', file.name.split('.')[0]);

        try {
            const { data } = await api.post('/projects/upload', formData, {
                onUploadProgress: (progressEvent) => {
                    const actualProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    if (actualProgress > simProgress) setProgress(actualProgress);
                }
            });
            clearInterval(interval);
            setProgress(100);
            setStatus({ type: 'success', message: 'Archive uploaded successfully! Redirecting...' });
            setTimeout(() => navigate(`/projects/${data.id || data._id}`), 2000);
        } catch (err) {
            console.error('Frontend Upload Error Details:', err);
            clearInterval(interval);
            const errMsg = err.response?.data?.error || err.response?.data?.details || 'Deployment failed. Check your network.';
            setStatus({ type: 'error', message: errMsg });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="animate-fade">
            <header style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800' }}>Drop a Project</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Deploy static sites or full-stack apps instantly using ZIP archives.</p>
            </header>

            <div className="premium-card" style={{ maxWidth: '800px', margin: '0 auto', borderStyle: 'none' }}>
                <div 
                    className={`drop-zone ${uploading ? 'dragging' : ''}`}
                    style={{ border: '2px dashed var(--border-subtle)', borderRadius: '24px', padding: '6rem 2rem', borderStyle: 'dashed' }}
                    onClick={() => !uploading && document.getElementById('file-upload').click()}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: '80px', height: '80px', background: 'var(--primary-light)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: '2rem' }}>
                            <CloudUpload size={40} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>Click to Browse or Drag ZIP</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Select your build folder compressed as .zip (Max 500MB)</p>
                        
                        <input type="file" id="file-upload" style={{ display: 'none' }} accept=".zip" onChange={handleFile} disabled={uploading} />
                        <button className="btn-secondary">Browse Local Files</button>
                    </div>
                </div>

                {file && !uploading && (
                    <div style={{ marginTop: '2rem', background: 'var(--bg-sub)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div style={{ width: '48px', height: '48px', background: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', boxShadow: 'var(--shadow-sm)' }}>
                            <FileCode size={24} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: '700', fontSize: '1rem' }}>{file.name}</p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to launch</p>
                        </div>
                        <button className="btn-ghost" onClick={() => setFile(null)}><X size={20} /></button>
                        <button className="btn-primary" onClick={handleUpload}>Launch Site <ArrowRight size={18} /></button>
                    </div>
                )}

                {uploading && (
                    <div style={{ marginTop: '2.5rem', padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <span style={{ fontWeight: '700', fontSize: '0.9rem' }} className="gradient-text">Syncing with Cloud Cluster...</span>
                            <span style={{ fontWeight: '800' }}>{Math.round(progress)}%</span>
                        </div>
                        <div className="progress-container"><div className="progress-bar" style={{ width: `${progress}%` }}></div></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', background: 'white', padding: '0.75rem', borderRadius: '8px' }}>
                            <Info size={16} /> Initializing isolated environment and SSL termination...
                        </div>
                    </div>
                )}

                {status && (
                    <div style={{ 
                        marginTop: '2.5rem', padding: '1.5rem', borderRadius: '16px', 
                        background: status.type === 'success' ? '#f0fdf4' : '#fff1f2',
                        border: `1px solid ${status.type === 'success' ? '#bbf7d0' : '#fecdd3'}`,
                        display: 'flex', alignItems: 'center', gap: '1rem'
                    }}>
                        {status.type === 'success' ? <CheckCircle2 size={24} color="#16a34a" /> : <AlertCircle size={24} color="#ef4444" />}
                        <div>
                            <h4 style={{ fontWeight: '700', color: status.type === 'success' ? '#166534' : '#991b1b' }}>{status.type === 'success' ? 'Success!' : 'Error'}</h4>
                            <p style={{ fontSize: '0.9rem', color: status.type === 'success' ? '#166534' : '#991b1b', opacity: 0.8 }}>{status.message}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UploadPage;
