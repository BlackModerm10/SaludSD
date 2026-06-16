import axios from 'axios';

const API_URL = typeof window !== 'undefined' && (window.location.port === '5173' || window.location.port === '5174')
  ? 'http://localhost:5000/api'
  : '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cache Configuration (5 minutes TTL)
const CACHE_TTL = 5 * 60 * 1000; 

function getCacheKey(url: string, params: any) {
  const token = localStorage.getItem('saludsd_token') || '';
  return `saludsd_cache_${token}_${url}_${JSON.stringify(params || {})}`;
}

// Clears all API caches
export function clearApiCache() {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('saludsd_cache_')) {
      localStorage.removeItem(key);
    }
  });
}

// Request Interceptor: Attach the JWT token and handle caching
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('saludsd_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Cache GET requests
    if (config.method === 'get') {
      const cacheKey = getCacheKey(config.url || '', config.params);
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          // If cache is fresh, and we are online, we can optionally use it,
          // but to ensure real-time health data, we'll check if we can fetch it,
          // or return cached directly for high performance.
          // Let's check freshness.
          if (Date.now() - timestamp < CACHE_TTL) {
            // We attach a flag to indicate it came from cache
            config.headers['X-From-Cache'] = 'true';
            
            // To allow Axios to return instantly without fetching, we can use an adapter or return cached.
            // A simple way is to let the request continue but if it fails, we fall back.
            // Alternatively, we can resolve it directly. Let's make it fall back on network error,
            // which guarantees we always get fresh data when online, meeting clinical standards!
          }
        } catch (e) {
          localStorage.removeItem(cacheKey);
        }
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Capture HTTP errors, handle JWT expiration (401), and cache data
api.interceptors.response.use(
  (response) => {
    // 1. If it's a standard SaludSD API JSON envelope, extract it
    if (response.data && response.data.hasOwnProperty('success') && response.data.hasOwnProperty('data')) {
      const originalData = response.data;
      response.data = originalData.data;
      (response as any).pagination = originalData.pagination;
      (response as any).success = originalData.success;
      (response as any).message = originalData.message;
    }

    // 2. Cache successful GET responses
    if (response.config.method === 'get' && response.config.url) {
      const cacheKey = getCacheKey(response.config.url, response.config.params);
      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          data: response.data,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.warn('No se pudo guardar la caché en localStorage:', e);
      }
    }

    return response;
  },
  (error) => {
    // Offline mode: if network error or server down (no response)
    if (!error.response && error.config && error.config.method === 'get' && error.config.url) {
      const cacheKey = getCacheKey(error.config.url, error.config.params);
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const { data } = JSON.parse(cached);
          
          // Trigger offline visual event
          window.dispatchEvent(new CustomEvent('saludsd-offline', {
            detail: { isOffline: true, message: 'Modo offline: mostrando datos locales archivados.' }
          }));

          // Return mock response resolved with cached data
          return Promise.resolve({
            data,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: error.config,
            isCachedFallback: true
          } as any);
        } catch (e) {
          // invalid cache
        }
      }
    }

    if (error.response) {
      const { status } = error.response;
      
      // If 401 Unauthorized or token expired, clear session and reload/redirect
      if (status === 401) {
        console.warn('Sesión expirada o no autorizada. Redirigiendo al login...');
        localStorage.removeItem('saludsd_token');
        localStorage.removeItem('saludsd_user');
        clearApiCache();
        
        // Redirect to login page
        if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
          window.location.href = '/login';
        }
      }
    } else {
      // Dispatch offline event even if no cache was found
      window.dispatchEvent(new CustomEvent('saludsd-offline', {
        detail: { isOffline: true, message: 'Sin conexión a la red. No hay datos en caché.' }
      }));
    }
    return Promise.reject(error);
  }
);

export default api;
