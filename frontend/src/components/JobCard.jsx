import React from 'react';

const JobCard = ({ job }) => {
    return (
        <div className="scheme-card job-card">
            <div className="card-header">
                <h3>{job.title}</h3>
                <span className="scheme-level">{job.state || 'India'}</span>
            </div>
            <div className="card-body">
                <p><strong>Department:</strong> {job.department}</p>
                <p><strong>Qualification:</strong> {job.qualification}</p>
                <div className="scheme-meta" style={{ marginTop: '10px' }}>
                    <span><i className="fas fa-calendar-check"></i> Deadline: {job.deadline}</span>
                    <span><i className="fas fa-rupee-sign"></i> {job.salary}</span>
                </div>
            </div>
            <div className="card-footer">
                <a href={job.apply_link} target="_blank" rel="noopener noreferrer" className="btn-view">
                    Apply Now <i className="fas fa-external-link-alt"></i>
                </a>
            </div>
        </div>
    );
};

export default JobCard;
