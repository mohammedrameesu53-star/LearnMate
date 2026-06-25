import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000', 
});

// 1. Request Interceptor: Attaches the current access token to outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, 
  (error) => {
    return Promise.reject(error); 
  }
);

// 2. Response Interceptor: Catches 401 errors and automatically refreshes expired access tokens
api.interceptors.response.use(
  (response) => {
    // If the request succeeds, just return the response data
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if the error status is 401 (Unauthorized) and we haven't tried retrying yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark this request so we don't loop infinitely if refresh fails

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (!refreshToken) {
          // No refresh token available? Boot them to login.
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Send a request to your exact Django SimpleJWT refresh endpoint
        const response = await axios.post('http://127.0.0.1:8000/api/accounts/token/refresh/', {
          refresh: refreshToken,
        });

        // Pull the new access token out of the response data
        const newAccessToken = response.data.access;

        // Save it to localStorage for subsequent requests
        localStorage.setItem('access_token', newAccessToken);

        // Update the failed original request's authorization header with the fresh token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Retry the original request with the fresh token and return its response data
        return api(originalRequest);

      } catch (refreshError) {
        console.error('Refresh token is expired or invalid. Logging out...', refreshError);
        
        // If the refresh token itself has expired, clean up everything and push back to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_role');
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      }
    }

    // Return any other standard API errors back to the UI view handler
    return Promise.reject(error);
  }
);

export default api;