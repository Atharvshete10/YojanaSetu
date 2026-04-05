import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';

const Navbar = () => {
    const [showAbout, setShowAbout] = useState(false);

    return (
        <header>
            <nav className="navbar">
                <div className="nav-container">
                    <Link to="/" className="logo">
                        <i className="fas fa-landmark"></i>
                        <span>YojanaSetu</span>
                    </Link>
                    <ul className="nav-links">
                        <li className="nav-item">
                            <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>
                                <i className="fas fa-home"></i>
                                <span>Home</span>
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/schemes" className={({ isActive }) => (isActive ? 'active' : '')}>
                                <i className="fas fa-hand-holding-heart"></i>
                                <span>Schemes</span>
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/tenders" className={({ isActive }) => (isActive ? 'active' : '')}>
                                <i className="fas fa-file-contract"></i>
                                <span>Tenders</span>
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/jobs" className={({ isActive }) => (isActive ? 'active' : '')}>
                                <i className="fas fa-user-graduate"></i>
                                <span>Jobs</span>
                            </NavLink>
                        </li>
                        <li className="nav-item about-item" onMouseEnter={() => setShowAbout(true)} onMouseLeave={() => setShowAbout(false)}>
                            <button className="about-btn">
                                <i className="fas fa-info-circle"></i>
                                <span>About Project</span>
                            </button>
                            {showAbout && (
                                <div className="about-dropdown">
                                    <p>1. Providing centralized access to government schemes, tenders, and recruitments.</p>
                                    <p>2. Data is automatically fetched using controlled scraping for accuracy and reliability.</p>
                                    <p>3. Designed for easy search, filtering, and user-friendly experience.</p>
                                </div>
                            )}
                        </li>
                    </ul>
                </div>
            </nav>
        </header>
    );
};

export default Navbar;
