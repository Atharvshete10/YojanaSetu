import React from 'react';

const TenderCard = ({ tender }) => {
    return (
        <div className="scheme-card tender-card">
            <div className="card-header">
                <h3>{tender.title}</h3>
                <span className="scheme-level state">{tender.state || 'Central'}</span>
            </div>
            <div className="card-body">
                <p><strong>Department:</strong> {tender.department}</p>
                <p><strong>Location:</strong> {tender.location}</p>
                <div className="scheme-meta" style={{ marginTop: '10px' }}>
                    <span><i className="fas fa-clock"></i> Deadline: {tender.deadline}</span>
                    <span><i className="fas fa-wallet"></i> Budget: {tender.budget}</span>
                </div>
            </div>
            <div className="card-footer">
                <a href={tender.official_link} target="_blank" rel="noopener noreferrer" className="btn-view">
                    View Tender <i className="fas fa-external-link-alt"></i>
                </a>
            </div>
        </div>
    );
};

export default TenderCard;
