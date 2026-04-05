import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminStats } from '../services/api';
import CrawlerManager from '../components/CrawlerManager';
import ModerationQueue from '../components/ModerationQueue';
import AuditLogs from '../components/AuditLogs';
import '../Admin.css';

const AdminDashboard = () => {
    const [activeView, setActiveView] = useState('dashboard');
    const [stats, setStats] = useState({ pendingReviews: 0, approvedSchemes: 0, approvedTenders: 0, approvedRecruitments: 0 });
    const [adminName, setAdminName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (!token) {
            navigate('/login');
            return;
        }
        setAdminName(localStorage.getItem('admin_name') || 'Admin');
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const data = await getAdminStats();
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Error fetching admin stats:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_name');
        navigate('/login');
    };

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-th-large' },
        { id: 'pending', label: 'Pending Reviews', icon: 'fas fa-clipboard-check' },
        { id: 'crawlers', label: 'Crawler Manager', icon: 'fas fa-robot' },
        { id: 'logs', label: 'System Logs', icon: 'fas fa-history' }
    ];

    return (
        <div className="admin-dashboard-layout">
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <i className="fas fa-landmark"></i>
                    <span>YojanaSetu</span>
                </div>
                
                <nav className="sidebar-menu">
                    {menuItems.map(item => (
                        <button 
                            key={item.id}
                            className={`sidebar-item ${activeView === item.id ? 'active' : ''}`}
                            onClick={() => setActiveView(item.id)}
                        >
                            <i className={item.icon}></i>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt"></i>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            <main className="admin-main">
                <header className="view-header">
                    <h1>{menuItems.find(i => i.id === activeView)?.label}</h1>
                    <div className="user-profile">
                        <small>Welcome back,</small>
                        <strong> {adminName}</strong>
                    </div>
                </header>

                <div className="view-content">
                    {activeView === 'dashboard' && (
                        <>
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-icon pending"><i className="fas fa-clock"></i></div>
                                    <div className="stat-info">
                                        <h3>{stats.pendingReviews}</h3>
                                        <p>Pending Reviews</p>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon schemes"><i className="fas fa-hand-holding-heart"></i></div>
                                    <div className="stat-info">
                                        <h3>{stats.approvedSchemes}</h3>
                                        <p>Approved Schemes</p>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon tenders"><i className="fas fa-file-contract"></i></div>
                                    <div className="stat-info">
                                        <h3>{stats.approvedTenders}</h3>
                                        <p>Approved Tenders</p>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon jobs"><i className="fas fa-user-graduate"></i></div>
                                    <div className="stat-info">
                                        <h3>{stats.approvedRecruitments}</h3>
                                        <p>Approved Jobs</p>
                                    </div>
                                </div>
                            </div>

                            <div className="quick-actions card" style={{ padding: '2rem' }}>
                                <h3 style={{ marginBottom: '1.5rem' }}>Quick Actions</h3>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button className="btn btn-primary" onClick={() => setActiveView('pending')}>
                                        <i className="fas fa-search" style={{ marginRight: '8px' }}></i>
                                        Review Pending Items
                                    </button>
                                    <button className="btn btn-secondary" onClick={() => setActiveView('crawlers')}>
                                        <i className="fas fa-cog" style={{ marginRight: '8px' }}></i>
                                        Manage Crawlers
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {activeView === 'pending' && <ModerationQueue />}
                    {activeView === 'crawlers' && <CrawlerManager />}
                    {activeView === 'logs' && <AuditLogs />}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
