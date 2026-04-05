import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Lazy loading pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Schemes = lazy(() => import('./pages/Schemes'));
const Tenders = lazy(() => import('./pages/Tenders'));
const Jobs = lazy(() => import('./pages/Recruitments')); // Map to Recruitments.jsx for now
const Login = lazy(() => import('./pages/Login'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

const App = () => {
    // Check if we are on the admin path
    const isAdminPath = window.location.pathname.startsWith('/admin');

    return (
        <Router>
            <div className="app-wrapper">
                {!isAdminPath && <Navbar />}
                <main className={isAdminPath ? "" : "content-container"}>
                    <Suspense fallback={<div className="loading"><i className="fas fa-spinner fa-spin"></i> Loading...</div>}>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/schemes" element={<Schemes />} />
                            <Route path="/tenders" element={<Tenders />} />
                            <Route path="/jobs" element={<Jobs />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/admin" element={<AdminDashboard />} />
                            <Route path="*" element={<div className="section"><h1>404</h1><p>Page Not Found</p></div>} />
                        </Routes>
                    </Suspense>
                </main>
                {!isAdminPath && <Footer />}
            </div>
        </Router>
    );
};

export default App;
