import React, { useState, useEffect } from 'react';
import { getCrawlerStatus, triggerCrawler as triggerCrawlerApi } from '../services/api';

const CrawlerManager = () => {
    const [status, setStatus] = useState({});
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchStatus = async () => {
        setRefreshing(true);
        try {
            const data = await getCrawlerStatus();
            if (data.success) {
                setStatus(data.status);
            }
        } catch (error) {
            console.error('Error fetching crawler status:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const triggerCrawler = async (source) => {
        setLoading(true);
        try {
            const data = await triggerCrawlerApi(source);
            if (data.success) {
                fetchStatus();
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            alert('Failed to trigger crawler.');
        } finally {
            setLoading(false);
        }
    };

    const sources = [
        { id: 'myscheme', name: 'MyScheme.gov.in', type: 'Schemes' },
        { id: 'tenders', name: 'Government Tenders', type: 'Tenders' },
        { id: 'jobs', name: 'Government Recruitments', type: 'Jobs' }
    ];

    return (
        <div className="crawler-view">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
                <button onClick={fetchStatus} disabled={refreshing} className="btn btn-secondary">
                    <i className={`fas fa-sync ${refreshing ? 'fa-spin' : ''}`} style={{ marginRight: '8px' }}></i>
                    Refresh Status
                </button>
            </div>

            <div className="crawler-grid">
                {sources.map(source => {
                    const s = status[source.id] || { 
                        status: 'idle', 
                        lastRun: null, 
                        totalFetched: 0, 
                        successCount: 0, 
                        failedCount: 0,
                        progress: 0 
                    };
                    
                    return (
                        <div key={source.id} className="crawler-card">
                            <div className="crawler-header">
                                <div className="crawler-name">
                                    <h4>{source.name}</h4>
                                    <small style={{ color: '#64748b' }}>Category: {source.type}</small>
                                </div>
                                <div className={`crawler-status ${s.status === 'running' ? 'status-running' : 'status-idle'}`}>
                                    <i className={`fas ${s.status === 'running' ? 'fa-circle-notch fa-spin' : 'fa-circle'}`}></i>
                                    {s.status.toUpperCase()}
                                </div>
                            </div>

                            <div className="crawler-stats">
                                <div className="crawl-stat-item">
                                    <span className="crawl-stat-val">{s.totalFetched || 0}</span>
                                    <span className="crawl-stat-label">Fetched</span>
                                </div>
                                <div className="crawl-stat-item">
                                    <span className="crawl-stat-val" style={{ color: '#16a34a' }}>{s.successCount || 0}</span>
                                    <span className="crawl-stat-label">Success</span>
                                </div>
                                <div className="crawl-stat-item">
                                    <span className="crawl-stat-val" style={{ color: '#ef4444' }}>{s.failedCount || 0}</span>
                                    <span className="crawl-stat-label">Failed</span>
                                </div>
                            </div>

                            <div className="progress-section">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <small style={{ fontWeight: 600 }}>Crawl Progress</small>
                                    <small>{s.progress || 0}%</small>
                                </div>
                                <div className="progress-container">
                                    <div className="progress-bar" style={{ width: `${s.progress || 0}%` }}></div>
                                </div>
                            </div>

                            <div className="crawler-actions">
                                <button 
                                    className="btn btn-primary" 
                                    style={{ flex: 1 }}
                                    onClick={() => triggerCrawler(source.id)}
                                    disabled={loading || s.status === 'running'}
                                >
                                    {s.status === 'running' ? 'Running Scraper...' : 'Start Scraper'}
                                </button>
                                <button className="btn btn-secondary" disabled>
                                    <i className="fas fa-pause"></i>
                                </button>
                                <button className="btn btn-secondary" disabled>
                                    <i className="fas fa-stop"></i>
                                </button>
                            </div>
                            
                            <div style={{ marginTop: '1.25rem', fontSize: '0.75rem', color: '#64748b' }}>
                                <i className="fas fa-history" style={{ marginRight: '5px' }}></i>
                                Last synchronized: {s.lastRun ? new Date(s.lastRun).toLocaleString() : 'Never'}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CrawlerManager;
