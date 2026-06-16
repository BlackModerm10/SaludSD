import { Router, Response } from 'express';
import { query } from '../config/db.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = Router();

// Helper to map DB snake_case fields to both Spanish/English keys for backwards & PDF compatibility
function mapNotification(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    usuario_id: row.usuario_id,
    usuarioId: row.usuario_id,
    userId: row.usuario_id,
    titulo: row.titulo,
    title: row.titulo,
    mensaje: row.mensaje,
    message: row.mensaje,
    fecha: row.fecha,
    createdAt: row.fecha,
    leida: row.leida === 1 || row.leida === true,
    read: row.leida === 1 || row.leida === true,
    tipo: row.tipo,
    type: row.tipo
  };
}

// GET /api/notifications - Obtener notificaciones del usuario autenticado
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  if (!user) return sendError(res, 'No autenticado.', 401);

  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 1000;
    const offset = (page - 1) * limit;

    // Count
    const countRes = await query('SELECT COUNT(*) as total FROM notificaciones WHERE usuario_id = $1', [user.id]);
    const total = parseInt(countRes.rows[0].total || '0');

    // Fetch
    const result = await query(`
      SELECT id, usuario_id, titulo, mensaje, fecha, leida, tipo
      FROM notificaciones
      WHERE usuario_id = $1
      ORDER BY fecha DESC, id DESC
      LIMIT $2 OFFSET $3;
    `, [user.id, limit, offset]);

    const mapped = result.rows.map(mapNotification);
    const totalPages = Math.ceil(total / limit);

    return sendSuccess(res, mapped, 'Notificaciones obtenidas con éxito.', {
      page,
      limit,
      total,
      totalPages
    });
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    return sendError(res, 'Error del servidor al obtener notificaciones.', 500);
  }
});

// GET /api/notifications/:id - Obtener una notificación por ID
router.get('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const { id } = req.params;
  if (!user) return sendError(res, 'No autenticado.', 401);

  try {
    const result = await query('SELECT * FROM notificaciones WHERE id = $1 AND usuario_id = $2', [id, user.id]);
    if (result.rows.length === 0) {
      return sendError(res, 'Notificación no encontrada.', 404);
    }
    return sendSuccess(res, mapNotification(result.rows[0]), 'Notificación obtenida con éxito.');
  } catch (error) {
    console.error('Error al obtener notificación por ID:', error);
    return sendError(res, 'Error del servidor.', 500);
  }
});

// PATCH /api/notifications/read-all - Marcar todas las notificaciones como leídas
router.patch('/read-all', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  if (!user) return sendError(res, 'No autenticado.', 401);

  try {
    await query(`
      UPDATE notificaciones
      SET leida = TRUE
      WHERE usuario_id = $1;
    `, [user.id]);

    return sendSuccess(res, null, 'Todas las notificaciones marcadas como leídas.');
  } catch (error) {
    console.error('Error al marcar todas las notificaciones como leídas:', error);
    return sendError(res, 'Error del servidor.', 500);
  }
});

// Helper for mark as read (common for PUT and PATCH)
async function markAsRead(req: AuthenticatedRequest, res: Response) {
  const user = req.user;
  const { id } = req.params;
  if (!user) return sendError(res, 'No autenticado.', 401);

  try {
    const checkRes = await query('SELECT * FROM notificaciones WHERE id = $1 AND usuario_id = $2', [id, user.id]);
    if (checkRes.rows.length === 0) {
      return sendError(res, 'Notificación no encontrada o no pertenece al usuario.', 404);
    }

    await query(`
      UPDATE notificaciones
      SET leida = TRUE
      WHERE id = $1 AND usuario_id = $2;
    `, [id, user.id]);

    const updatedNotif = { ...checkRes.rows[0], leida: true };

    return sendSuccess(res, mapNotification(updatedNotif), 'Notificación marcada como leída.');
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    return sendError(res, 'Error del servidor.', 500);
  }
}

// PUT /api/notifications/:id/read - Marcar notificación como leída (Keep PUT for backwards compatibility)
router.put('/:id/read', authMiddleware, markAsRead);

// PATCH /api/notifications/:id/read - Marcar notificación como leída (Add PATCH as required by EF 1)
router.patch('/:id/read', authMiddleware, markAsRead);

// DELETE /api/notifications/:id - Eliminar notificación
router.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const { id } = req.params;
  if (!user) return sendError(res, 'No autenticado.', 401);

  try {
    const checkRes = await query('SELECT * FROM notificaciones WHERE id = $1 AND usuario_id = $2', [id, user.id]);
    if (checkRes.rows.length === 0) {
      return sendError(res, 'Notificación no encontrada.', 404);
    }

    await query('DELETE FROM notificaciones WHERE id = $1 AND usuario_id = $2', [id, user.id]);

    return sendSuccess(res, null, 'Notificación eliminada con éxito.');
  } catch (error) {
    console.error('Error al eliminar notificación:', error);
    return sendError(res, 'Error del servidor.', 500);
  }
});

export default router;
