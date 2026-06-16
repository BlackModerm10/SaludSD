import { Request, Response, NextFunction } from 'express';
import xss from 'xss';

/**
 * Middleware to sanitize incoming request bodies, queries, and params against XSS attacks.
 */
export function xssMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.body) {
    sanitizeObject(req.body);
  }
  if (req.query) {
    sanitizeObject(req.query);
  }
  if (req.params) {
    sanitizeObject(req.params);
  }
  next();
}

function sanitizeObject(obj: any) {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const val = obj[key];
      if (typeof val === 'string') {
        obj[key] = xss(val);
      } else if (typeof val === 'object' && val !== null) {
        sanitizeObject(val); // Recursive sanitization for nested objects/arrays
      }
    }
  }
}
