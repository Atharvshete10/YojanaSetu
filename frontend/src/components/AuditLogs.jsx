import React, { useState, useEffect } from 'react';
import { getAdminLogs } from '../services/api';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const data = await getAdminLogs();
            if (data.success) {
                setLogs(data.data);
            }
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActionBadge = (action) => {
        switch (action.toLowerCase()) {
            case 'approve': return <span className="badge success">APPROVE</span>;
            case 'reject': return <span className="badge danger">REJECT</span>;
            case 'login': return <span className="badge" style={{ backgroundColor: '#dbeafe', color: '#2563eb' }}>LOGIN</span>;
            default: return <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>{action.toUpperCase()}</span>;
        }
    };

    return (
        <div className="card">
            <div className="card-header">
                <h3>System Activity Logs</h3>
                <button onClick={fetchLogs} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }}>
                    <i className="fas fa-sync" style={{ marginRight: '5px' }}></i> Refresh
                </button>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Action</th>
                            <th>Resource</th>
                            <th>Details</th>
                            <th>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>Loading logs...</td></tr>
                        ) : logs.length === 0 ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>No activity recorded yet.</td></tr>
                        ) : (
                            logs.map(log => (
                                <tr key={log.id}>
                                    <td style={{ fontWeight: 600 }}>{log.admin_name || 'System'}</td>
                                    <td>{getActionBadge(log.action)}</td>
                                    <td>
                                        <span style={{ textTransform: 'capitalize' }}>{log.entity_type}</span>
                                        <small style={{ color: '#64748b', display: 'block' }}>ID: #{log.entity_id}</small>
                                    </td>
                                    <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {log.details || 'No additional details'}
                                    </td>
                                    <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                                        {new Date(log.created_at).toLocaleString()}
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

export default AuditLogs;
