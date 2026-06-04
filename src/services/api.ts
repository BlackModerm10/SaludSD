import axios from 'axios';

// Base URL of the Node.js API server
const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach the JWT token from localStorage to the Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('saludsd_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Capture HTTP errors and handle JWT expiration (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      // If 401 Unauthorized or token expired, clear session and reload/redirect
      if (status === 401) {
        console.warn('Sesión expirada o no autorizada. Cerrando sesión...');

        // Despachamos un evento personalizado para que AuthContext haga el logout correctamente en React
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
