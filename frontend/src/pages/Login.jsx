import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('admin_token', data.data.token);
                localStorage.setItem('admin_name', data.data.admin.name || data.data.admin.email);
                navigate('/admin');
            } else {
                setError(data.message || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            setError('Unable to connect to the server. Please try again later.');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="login-screen" className="screen active">
            <div className="login-container">
                <div className="login-card">
                    <h1><i className="fas fa-shield-alt"></i> Admin Login</h1>
                    <form id="login-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Email</label>
                            <input 
                                type="email" 
                                id="login-email" 
                                required 
                                value={credentials.email}
                                onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                                placeholder="admin@yojanasetu.gov.in"
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input 
                                type="password" 
                                id="login-password" 
                                required 
                                value={credentials.password}
                                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                                placeholder="••••••••"
                            />
                        </div>
                        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                            {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Login'}
                        </button>
                        {error && <div id="login-error" className="error-message" style={{ color: '#e53e3e', marginTop: '1rem', textAlign: 'center' }}>{error}</div>}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
