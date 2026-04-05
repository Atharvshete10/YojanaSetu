import React, { useState, useEffect } from 'react';
import { getPendingItems, approveItem } from '../services/api';

const ModerationQueue = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState('scheme');

    useEffect(() => {
        fetchPending();
    }, [type]);

    const fetchPending = async () => {
        setLoading(true);
        try {
            const data = await getPendingItems(type);
            if (data.success) {
                setItems(data.data);
            }
        } catch (error) {
            console.error('Error fetching pending items:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            const data = await approveItem(id);
            if (data.success) {
                setItems(items.filter(i => i.id !== id));
            }
        } catch (error) {
            alert('Approval failed.');
        }
    };

    return (
        <div className="card">
            <div className="card-header">
                <h3>Pending Approval Queue</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                        className={`btn ${type === 'scheme' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setType('scheme')}
                        style={{ padding: '0.4rem 0.8rem' }}
                    >
                        Schemes
                    </button>
                    <button 
                        className={`btn ${type === 'tender' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setType('tender')}
                        style={{ padding: '0.4rem 0.8rem' }}
                    >
                        Tenders
                    </button>
                    <button 
                        className={`btn ${type === 'recruitment' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setType('recruitment')}
                        style={{ padding: '0.4rem 0.8rem' }}
                    >
                        Jobs
                    </button>
                </div>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Title / Name</th>
                            <th>Category</th>
                            <th>State</th>
                            <th>Crawled Date</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>Loading content...</td></tr>
                        ) : items.length === 0 ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>No pending items in this category.</td></tr>
                        ) : (
                            items.map(item => (
                                <tr key={item.id}>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{item.normalized_data.title || item.normalized_data.name}</div>
                                        <small style={{ color: '#64748b' }}>{item.normalized_data.department || item.normalized_data.organization}</small>
                                    </td>
                                    <td>
                                        <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
                                            {item.type.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>{item.normalized_data.state || 'India'}</td>
                                    <td>{new Date(item.created_at).toLocaleDateString()}</td>
                                    <td><span className="badge warning">Pending</span></td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            <button className="btn btn-primary" style={{ padding: '0.3rem 0.6rem' }} onClick={() => handleApprove(item.id)}>
                                                <i className="fas fa-check"></i>
                                            </button>
                                            <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', color: '#ef4444' }}>
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ModerationQueue;
