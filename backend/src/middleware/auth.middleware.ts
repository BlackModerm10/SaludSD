import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'saludsd_secret_key_for_jwt_2026_primary_health_sec!';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    rut: string;
    nombre: string;
    email: string;
    role: 'paciente' | 'admin';
  };
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acceso no autorizado. Token no proporcionado.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    (req as AuthenticatedRequest).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }
}

export function requireRole(role: 'paciente' | 'admin') {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      return res.status(401).json({ error: 'Usuario no autenticado.' });
    }
    if (authReq.user.role !== role) {
      return res.status(403).json({ error: 'Permisos insuficientes para esta operación.' });
    }
    next();
  };
}
