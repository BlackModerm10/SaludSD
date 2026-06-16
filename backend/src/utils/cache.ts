import { Request, Response, NextFunction } from 'express';

interface CacheEntry {
  data: any;
  expiry: number;
}

const cacheMap = new Map<string, CacheEntry>();
const DEFAULT_TTL = 30 * 1000; // 30 seconds cache for list requests to avoid DB overload

/**
 * Middleware to cache GET responses in memory.
 * @param ttl Time to live in milliseconds.
 */
export const cacheMiddleware = (ttl: number = DEFAULT_TTL) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') {
      return next();
    }

    // Generate unique key based on URL, query params and authenticated user id
    const userId = (req as any).user?.id || 'public';
    const key = `backend_cache_${userId}_${req.originalUrl || req.url}`;
    
    const cached = cacheMap.get(key);
    if (cached && cached.expiry > Date.now()) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cached.data);
    }

    // Intercept JSON responses to cache them
    const originalJson = res.json;
    res.json = function (body: any): Response {
      res.json = originalJson;
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cacheMap.set(key, {
          data: body,
          expiry: Date.now() + ttl
        });
      }
      return originalJson.call(this, body);
    };

    res.setHeader('X-Cache', 'MISS');
    next();
  };
};

/**
 * Clears all backend memory caches.
 */
export function clearBackendCache() {
  cacheMap.clear();
}
