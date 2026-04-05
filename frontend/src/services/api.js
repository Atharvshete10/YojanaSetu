import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Public APIs
export const getSchemes = () => api.get('/schemes').then(res => res.data);
export const getTenders = () => api.get('/tenders').then(res => res.data);
export const getJobs = () => api.get('/jobs').then(res => res.data);

export default api;

