import React from 'react';

const SchemeCard = ({ scheme }) => {
    return (
        <div className="scheme-card">
            <div className="card-header">
                <h3>{scheme.title}</h3>
                <span className="scheme-level">{scheme.state || 'India'}</span>
            </div>
            <div className="card-body">
                <p className="scheme-description">{scheme.description}</p>
                <div className="scheme-meta">
                    <span><i className="fas fa-calendar-alt"></i> Deadline: {scheme.deadline || 'Open'}</span>
                    <span><i className="fas fa-tag"></i> {scheme.category || 'General'}</span>
                </div>
            </div>
            <div className="card-footer">
                <a href={scheme.official_link} target="_blank" rel="noopener noreferrer" className="btn-view">
                    View Details <i className="fas fa-external-link-alt"></i>
                </a>
            </div>
        </div>
    );
};

export default SchemeCard;
