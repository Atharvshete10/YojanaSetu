import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const [stats, setStats] = useState({ schemesCount: 0, tendersCount: 0, jobsCount: 0 });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/stats');
                const result = await response.json();
                if (result.success) {
                    setStats({
                        schemesCount: result.data.totalSchemes || 0,
                        tendersCount: result.data.totalTenders || 0,
                        jobsCount: result.data.totalJobs || 0
                    });
                }
            } catch (error) {
                console.error('Error loading stats:', error);
            }
        };
        fetchStats();
    }, []);

    return (
        <div id="dashboard-view" className="section">
            <h1>Unified Government Portal</h1>
            <p>Welcome to YojanaSetu. Get real-time updates on Schemes, Tenders, and Recruitments.</p>

            <div className="dashboard-grid">
                <div className="dash-card" onClick={() => navigate('/schemes')}>
                    <div className="dash-icon"><i className="fas fa-hand-holding-heart"></i></div>
                    <div className="dash-info">
                        <h2 id="scheme-count">{stats.schemesCount}</h2>
                        <p>Schemes Available</p>
                    </div>
                </div>
                <div className="dash-card" onClick={() => navigate('/tenders')}>
                    <div className="dash-icon"><i className="fas fa-file-contract"></i></div>
                    <div className="dash-info">
                        <h2 id="tender-count">{stats.tendersCount}</h2>
                        <p>Active Tenders</p>
                    </div>
                </div>
                <div className="dash-card" onClick={() => navigate('/jobs')}>
                    <div className="dash-icon"><i className="fas fa-user-graduate"></i></div>
                    <div className="dash-info">
                        <h2 id="job-count">{stats.jobsCount}</h2>
                        <p>Job Openings</p>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '3rem', textAlign: 'center', padding: '2rem', background: '#f0f4f8', borderRadius: '12px' }}>
                <h3>About YojanaSetu</h3>
                <p style={{ maxWidth: '800px', margin: '1rem auto' }}>
                    YojanaSetu is a centralized portal designed to provide easy access to various government opportunities. 
                    Our system automatically aggregates data from multiple official sources using advanced scraping techniques, 
                    ensuring you stay updated with the latest information.
                </p>
            </div>
        </div>
    );
};

export default Home;
