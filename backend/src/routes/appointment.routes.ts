import { Router, Response } from 'express';
import { query } from '../config/db.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware.js';

const router = Router();

// GET /api/appointments - Obtener citas del paciente autenticado
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'No autenticado.' });

  try {
    const result = await query(`
      SELECT a.id, a.especialidad, a.medico, a.fecha, 
             CAST(a.hora AS CHAR) as hora, a.estado, a.notas,
             c.nombre as "centroSalud", c.id as "centroId"
      FROM citas a
      JOIN centros_salud c ON a.centro_id = c.id
      WHERE a.paciente_id = $1
      ORDER BY a.fecha DESC, a.hora DESC;
    `, [user.id]);

    return res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener citas médicas:', error);
    return res.status(500).json({ error: 'Error del servidor al obtener las citas médicas.' });
  }
});

export default router;
