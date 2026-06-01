import { Router, Response } from 'express';
import { query } from '../config/db.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware.js';

const router = Router();

// GET /api/notifications - Obtener notificaciones del usuario autenticado
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'No autenticado.' });

  try {
    const result = await query(`
      SELECT id, titulo, mensaje, fecha, leida, tipo
      FROM notificaciones
      WHERE usuario_id = $1
      ORDER BY fecha DESC, id DESC;
    `, [user.id]);

    return res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    return res.status(500).json({ error: 'Error del servidor al obtener notificaciones.' });
  }
});

// PUT /api/notifications/:id/read - Marcar notificación como leída
router.put('/:id/read', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const { id } = req.params;
  if (!user) return res.status(401).json({ error: 'No autenticado.' });

  try {
    // Buscar antes de actualizar para validar existencia y propiedad
    const checkRes = await query('SELECT * FROM notificaciones WHERE id = $1 AND usuario_id = $2', [id, user.id]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ error: 'Notificación no encontrada o no pertenece al usuario.' });
    }

    await query(`
      UPDATE notificaciones
      SET leida = TRUE
      WHERE id = $1 AND usuario_id = $2;
    `, [id, user.id]);

    const updatedNotif = { ...checkRes.rows[0], leida: true };

    return res.json({ message: 'Notificación marcada como leída.', notification: updatedNotif });
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    return res.status(500).json({ error: 'Error del servidor.' });
  }
});

export default router;
