import React, { useState, useEffect } from 'react';
import JobCard from '../components/JobCard';

const States = [
    "All India", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const Recruitments = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [stateFilter, setStateFilter] = useState('');
    const [sort, setSort] = useState('');

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                search,
                state: stateFilter === 'All India' ? '' : stateFilter,
                sort
            }).toString();
            
            const response = await fetch(`http://localhost:5000/api/jobs?${query}`);
            const result = await response.json();
            if (result.success) {
                setJobs(result.data);
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchJobs();
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [search, stateFilter, sort]);

    return (
        <div className="section">
            <h1>Government Recruitments</h1>
            <p>Find the latest job openings in government departments.</p>

            <div className="search-sort-bar">
                <div className="search-box">
                    <i className="fas fa-search"></i>
                    <input 
                        type="text" 
                        placeholder="Search by job title..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="sort-box">
                    <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}>
                        <option value="">Select State/UT</option>
                        {States.map(state => (
                            <option key={state} value={state}>{state}</option>
                        ))}
                    </select>
                </div>
                <div className="sort-box">
                    <select value={sort} onChange={(e) => setSort(e.target.value)}>
                        <option value="">Sort By</option>
                        <option value="alphabetical">Alphabetical (A-Z)</option>
                        <option value="deadline">Deadline (Soonest)</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="loading">
                    <i className="fas fa-spinner fa-spin"></i> Loading recruitments...
                </div>
            ) : jobs.length > 0 ? (
                <div className="grid-container">
                    {jobs.map(job => (
                        <JobCard key={job.id} job={job} />
                    ))}
                </div>
            ) : (
                <div className="no-data">
                    <i className="fas fa-info-circle"></i> No job openings found matching your criteria.
                </div>
            )}
        </div>
    );
};

export default Recruitments;
