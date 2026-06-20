import axios from 'axios';

const api = axios.create({
  // Replace with your exact Django server port if different (e.g., http://localhost:8000)
  baseURL: 'http://127.0.0.1:8000', 
});

// This automatically attaches your token to requests if the user is logged in
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;