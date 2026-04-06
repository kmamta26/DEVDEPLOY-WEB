import React, { useState, useEffect, useRef } from 'react';
import { 
    Server, Cpu, Activity, Zap, RefreshCw, 
    Search, Terminal, Shield, Play, Square, Settings, 
    ArrowRight, Globe 
} from 'lucide-react';
import api from '../services/api';

const AWSPage = () => {
    const [instances, setInstances] = useState([
        { id: 'i-09f123456789abcde', name: 'prod-web-01', status: 'running', type: 't3.medium', region: 'us-east-1' },
        { id: 'i-08a987654321defgh', name: 'dev-api-02', status: 'stopped', type: 't2.micro', region: 'us-east-1' }
    ]);
    const [logs, setLogs] = useState([]);
    const logRef = useRef(null);

    useEffect(() => {
        setLogs([
            '[2026-04-06 19:40:15] INFO: Initializing EC2 instance manager...',
            '[2026-04-06 19:40:17] INFO: Fetching instance status for region: us-east-1',
            '[2026-04-06 19:40:20] SUCCESS: 2 instances retrieved.',
            '[2026-04-06 19:42:05] WARNING: Load balancer latency spike detected (150ms)',
            '[2026-04-06 19:43:10] INFO: Auto-scaling group check: 3 nodes healthy.'
        ]);
    }, []);

    useEffect(() => {
        if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    }, [logs]);

    const addLog = (msg) => {
        const time = new Date().toISOString().replace('T', ' ').split('.')[0];
        setLogs(prev => [...prev, `[${time}] ${msg}`]);
    };

    const toggleInstance = (id) => {
        setInstances(prev => prev.map(inst => {
            if (inst.id === id) {
                const newStatus = inst.status === 'running' ? 'stopped' : 'running';
                addLog(`${newStatus === 'running' ? 'STARTING' : 'STOPPING'} instance ${inst.name}...`);
                return { ...inst, status: newStatus };
            }
            return inst;
        }));
    };

    return (
        <div className="animate-fade">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800' }}>AWS Console</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Active EC2 instances and infrastructure management.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ 
                        padding: '10px 20px', background: '#dcfce7', color: '#166534', 
                        borderRadius: '12px', fontSize: '0.875rem', fontWeight: '800', 
                        display: 'flex', alignItems: 'center', gap: '8px' 
                    }}>
                        <Shield size={16} /> Cloud Shield Active
                    </div>
                    <button className="btn-secondary"><Settings size={20} /></button>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.1fr', gap: '2.5rem' }}>
                <div className="premium-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h4 style={{ fontWeight: '800', fontSize: '1.25rem' }}>Active Instances</h4>
                        <button className="btn-ghost" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => addLog('Refreshing instance list...')}>
                            <RefreshCw size={14} className="mr-2" /> Refresh
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {instances.map((inst) => (
                            <div key={inst.id} style={{ 
                                padding: '1.25rem', background: '#f8fafc', borderRadius: '16px', 
                                border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '1rem' 
                            }}>
                                <div style={{ 
                                    width: '44px', height: '44px', borderRadius: '10px', 
                                    background: inst.status === 'running' ? '#dcfce7' : '#fee2e2',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                    color: inst.status === 'running' ? '#166534' : '#991b1b',
                                    boxShadow: 'var(--shadow-sm)'
                                }}>
                                    <Server size={22} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h5 style={{ fontWeight: '700', fontSize: '1rem' }}>{inst.name}</h5>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{inst.id} • {inst.type} • {inst.region}</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '800', color: inst.status === 'running' ? '#16a34a' : '#ef4444', textTransform: 'uppercase' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: inst.status === 'running' ? '#16a34a' : '#ef4444' }} />
                                            {inst.status}
                                        </div>
                                    </div>
                                    <button 
                                        className="btn-primary" 
                                        style={{ width: '40px', height: '40px', padding: 0, borderRadius: '10px', background: inst.status === 'running' ? '#ef4444' : 'var(--primary)' }}
                                        onClick={() => toggleInstance(inst.id)}
                                    >
                                        {inst.status === 'running' ? <Square size={18} fill="white" /> : <Play size={18} fill="white" />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '2.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                                <Cpu size={16} /> <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Global CPU</span>
                            </div>
                            <h3 style={{ fontSize: '1.6rem', fontWeight: '800' }}>14.2%</h3>
                        </div>
                        <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                                <Activity size={16} /> <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Memory used</span>
                            </div>
                            <h3 style={{ fontSize: '1.6rem', fontWeight: '800' }}>2.1 GB</h3>
                        </div>
                    </div>
                </div>

                <div className="terminal-window" style={{ display: 'flex', flexDirection: 'column', background: '#0f172a', border: '2px solid #1e293b' }}>
                    <div className="terminal-header" style={{ background: '#1e293b' }}>
                        <div className="dot red"></div>
                        <div className="dot yellow"></div>
                        <div className="dot green"></div>
                        <span style={{ color: '#94a3b8', fontSize: '0.75rem', marginLeft: '10px', display: 'flex', alignItems: 'center' }}>
                            <Terminal size={14} style={{ marginRight: '6px' }} /> ec2-admin@devdeploy-console:~
                        </span>
                    </div>
                    <div className="terminal-body" style={{ color: '#e2e8f0', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem' }} ref={logRef}>
                        {logs.map((log, i) => (
                            <div key={i} style={{ marginBottom: '8px', lineHeight: '1.6', display: 'flex', gap: '10px' }}>
                                <span style={{ color: 'var(--primary)', opacity: 0.8 }}>$</span> {log}
                            </div>
                        ))}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                            <span style={{ color: 'var(--primary)', fontWeight: '800' }}>➜</span>
                            <span style={{ color: 'white', fontWeight: '800' }}>~</span>
                            <span style={{ width: '8px', height: '18px', background: 'white', animation: 'blink 1s infinite' }}></span>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes blink { 50% { opacity: 0; } }
            `}</style>
        </div>
    );
};

export default AWSPage;
