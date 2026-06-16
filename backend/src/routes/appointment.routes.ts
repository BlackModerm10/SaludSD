import { Router, Response } from 'express';
import crypto from 'crypto';
import { query } from '../config/db.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { encrypt, decrypt } from '../config/encryption.js';
import { cacheMiddleware, clearBackendCache } from '../utils/cache.js';
import { sendAppointmentEmail } from '../services/email.service.js';

const router = Router();

// GET /api/appointments - Obtener citas con paginación y filtros
router.get('/', authMiddleware, cacheMiddleware(15000), async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  if (!user) return sendError(res, 'No autenticado.', 401);

  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 1000;
    const offset = (page - 1) * limit;

    const sortFieldMap: { [key: string]: string } = {
      fecha: 'a.fecha',
      hora: 'a.hora',
      medico: 'a.medico',
      especialidad: 'a.especialidad',
      estado: 'a.estado'
    };
    const sort = sortFieldMap[req.query.sort as string] || 'a.fecha';
    const order = req.query.order === 'ASC' ? 'ASC' : 'DESC';

    const conditions: string[] = [];
    const params: any[] = [];
    let count = 1;

    // Patients only see their own appointments, admins can see all or filter by patient
    if (user.role !== 'admin') {
      conditions.push(`a.paciente_id = $${count++}`);
      params.push(user.id);
    } else {
      if (req.query.pacienteId) {
        conditions.push(`a.paciente_id = $${count++}`);
        params.push(req.query.pacienteId);
      }
    }

    if (req.query.especialidad) {
      conditions.push(`a.especialidad = $${count++}`);
      params.push(req.query.especialidad);
    }
    if (req.query.estado) {
      conditions.push(`a.estado = $${count++}`);
      params.push(req.query.estado);
    }
    if (req.query.centroId || req.query.centro_id) {
      conditions.push(`a.centro_id = $${count++}`);
      params.push(req.query.centroId || req.query.centro_id);
    }
    if (req.query.search) {
      const term = (req.query.search as string).trim();
      const isRutSearch = /^[0-9.\-kK]+$/.test(term);
      if (isRutSearch) {
        conditions.push(`u.rut = $${count++}`);
        params.push(encrypt(term));
      } else {
        conditions.push(`(a.medico LIKE $${count} OR u.nombre LIKE $${count++})`);
        params.push(`%${term}%`);
      }
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count
    const countSql = `
      SELECT COUNT(*) as total
      FROM citas a
      JOIN usuarios u ON a.paciente_id = u.id
      ${whereClause};
    `;
    const countRes = await query(countSql, params);
    const total = parseInt(countRes.rows[0].total || '0');

    // Fetch paginated
    const selectParams = [...params, limit, offset];
    const selectSql = `
      SELECT a.id, a.especialidad, a.medico, a.fecha, 
             a.hora as hora, a.estado, a.notas,
             c.nombre as centroSalud, c.id as centroId,
             u.nombre as pacienteNombre, u.rut as pacienteRut, a.paciente_id as pacienteId
      FROM citas a
      JOIN centros_salud c ON a.centro_id = c.id
      JOIN usuarios u ON a.paciente_id = u.id
      ${whereClause}
      ORDER BY ${sort} ${order}
      LIMIT $${count++} OFFSET $${count++};
    `;
    const result = await query(selectSql, selectParams);
    const decryptedRows = result.rows.map(row => ({
      ...row,
      pacienteRut: decrypt(row.pacienteRut)
    }));
    const totalPages = Math.ceil(total / limit);

    return sendSuccess(res, decryptedRows, 'Citas obtenidas con éxito.', {
      page,
      limit,
      total,
      totalPages
    });
  } catch (error) {
    console.error('Error al obtener citas médicas:', error);
    return sendError(res, 'Error del servidor al obtener las citas médicas.', 500);
  }
});

// GET /api/appointments/:id - Obtener una cita médica por ID
router.get('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const { id } = req.params;
  if (!user) return sendError(res, 'No autenticado.', 401);

  try {
    const result = await query(`
      SELECT a.id, a.especialidad, a.medico, a.fecha, 
             a.hora as hora, a.estado, a.notas,
             c.nombre as centroSalud, c.id as centroId,
             u.nombre as pacienteNombre, u.rut as pacienteRut, a.paciente_id as pacienteId
      FROM citas a
      JOIN centros_salud c ON a.centro_id = c.id
      JOIN usuarios u ON a.paciente_id = u.id
      WHERE a.id = $1;
    `, [id]);

    if (result.rows.length === 0) {
      return sendError(res, 'La cita médica no existe.', 404);
    }

    const appointment = result.rows[0];
    appointment.pacienteRut = decrypt(appointment.pacienteRut);

    // Patients can only see their own appointments
    if (user.role !== 'admin' && appointment.pacienteId !== user.id) {
      return sendError(res, 'Permisos insuficientes para esta operación.', 403);
    }

    return sendSuccess(res, appointment, 'Cita médica obtenida con éxito.');
  } catch (error) {
    console.error('Error al obtener cita médica por ID:', error);
    return sendError(res, 'Error del servidor.', 500);
  }
});

// POST /api/appointments - Agendar una cita médica
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  if (!user) return sendError(res, 'No autenticado.', 401);

  const { pacienteId, especialidad, medico, centroId, fecha, hora, notas } = req.body;

  const targetPacienteId = user.role === 'admin' ? (pacienteId || user.id) : user.id;

  if (!especialidad || !medico || !centroId || !fecha || !hora) {
    return sendError(res, 'Campos requeridos faltantes (especialidad, medico, centroId, fecha, hora).', 400);
  }

  try {
    const id = crypto.randomUUID();
    await query(`
      INSERT INTO citas (id, paciente_id, especialidad, medico, centro_id, fecha, hora, estado, notas)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'confirmada', $8);
    `, [id, targetPacienteId, especialidad, medico, centroId, fecha, hora, notas || null]);

    const newApp = {
      id,
      pacienteId: targetPacienteId,
      especialidad,
      medico,
      centroId,
      fecha,
      hora,
      estado: 'confirmada',
      notas: notas || null
    };

    // Notify patient via notifications table
    const currentDate = new Date().toISOString().slice(0, 10);
    const msg = `Tu cita de ${especialidad} con ${medico} ha sido agendada para el ${fecha} a las ${hora}.`;
    await query(`
      INSERT INTO notificaciones (id, usuario_id, titulo, mensaje, fecha, tipo)
      VALUES ($1, $2, $3, $4, $5, 'exito');
    `, [crypto.randomUUID(), targetPacienteId, 'Cita Agendada', msg, currentDate]);

    // Fetch patient contact details and center name to send email
    const patientRes = await query('SELECT nombre, email FROM usuarios WHERE id = $1', [targetPacienteId]);
    const centerRes = await query('SELECT nombre FROM centros_salud WHERE id = $1', [centroId]);
    
    if (patientRes.rows.length > 0 && centerRes.rows.length > 0) {
      const patient = patientRes.rows[0];
      const centerName = centerRes.rows[0].nombre;
      sendAppointmentEmail(patient.email, patient.nombre, especialidad, medico, fecha, hora, centerName)
        .catch(err => console.error('Error al enviar email de confirmación de cita:', err));
    }

    clearBackendCache();
    return sendSuccess(res, newApp, 'Cita agendada con éxito.', undefined, 201);
  } catch (error) {
    console.error('Error al crear cita médica:', error);
    return sendError(res, 'Error del servidor al agendar la cita.', 500);
  }
});

// PUT /api/appointments/:id - Actualizar una cita médica
router.put('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const { id } = req.params;
  if (!user) return sendError(res, 'No autenticado.', 401);

  const { medico, fecha, hora, estado, notas } = req.body;

  try {
    const checkRes = await query('SELECT * FROM citas WHERE id = $1', [id]);
    if (checkRes.rows.length === 0) {
      return sendError(res, 'La cita no existe.', 404);
    }
    const currentApp = checkRes.rows[0];

    if (user.role !== 'admin' && currentApp.paciente_id !== user.id) {
      return sendError(res, 'Permisos insuficientes.', 403);
    }

    const fields: string[] = [];
    const values: any[] = [];
    let count = 1;

    if (medico !== undefined) {
      fields.push(`medico = $${count++}`);
      values.push(medico);
    }
    if (fecha !== undefined) {
      fields.push(`fecha = $${count++}`);
      values.push(fecha);
    }
    if (hora !== undefined) {
      fields.push(`hora = $${count++}`);
      values.push(hora);
    }
    if (estado !== undefined) {
      fields.push(`estado = $${count++}`);
      values.push(estado);
    }
    if (notas !== undefined) {
      fields.push(`notas = $${count++}`);
      values.push(notas);
    }

    if (fields.length === 0) {
      return sendError(res, 'No se enviaron campos válidos para actualizar.', 400);
    }

    values.push(id);
    const updateQuery = `
      UPDATE citas
      SET ${fields.join(', ')}
      WHERE id = $${count};
    `;
    await query(updateQuery, values);

    // Fetch updated
    const selectRes = await query('SELECT * FROM citas WHERE id = $1', [id]);
    const updatedApp = selectRes.rows[0];

    // Notify patient
    if (estado !== undefined && estado !== currentApp.estado) {
      const currentDate = new Date().toISOString().slice(0, 10);
      const msg = `El estado de tu cita de ${currentApp.especialidad} ha cambiado a: ${estado}.`;
      await query(`
        INSERT INTO notificaciones (id, usuario_id, titulo, mensaje, fecha, tipo)
        VALUES ($1, $2, $3, $4, $5, 'info');
      `, [crypto.randomUUID(), currentApp.paciente_id, 'Actualización de Cita', msg, currentDate]);
    }

    clearBackendCache();
    return sendSuccess(res, updatedApp, 'Cita actualizada con éxito.');
  } catch (error) {
    console.error('Error al actualizar cita médica:', error);
    return sendError(res, 'Error del servidor.', 500);
  }
});

// DELETE /api/appointments/:id - Eliminar una cita médica
router.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const { id } = req.params;
  if (!user) return sendError(res, 'No autenticado.', 401);

  try {
    const checkRes = await query('SELECT * FROM citas WHERE id = $1', [id]);
    if (checkRes.rows.length === 0) {
      return sendError(res, 'La cita no existe.', 404);
    }
    const currentApp = checkRes.rows[0];

    if (user.role !== 'admin') {
      return sendError(res, 'Permisos insuficientes para eliminar citas. Intenta cancelarla.', 403);
    }

    await query('DELETE FROM citas WHERE id = $1', [id]);

    const currentDate = new Date().toISOString().slice(0, 10);
    const msg = `Tu cita de ${currentApp.especialidad} con ${currentApp.medico} ha sido eliminada del sistema.`;
    await query(`
      INSERT INTO notificaciones (id, usuario_id, titulo, mensaje, fecha, tipo)
      VALUES ($1, $2, $3, $4, $5, 'alerta');
    `, [crypto.randomUUID(), currentApp.paciente_id, 'Cita Cancelada/Eliminada', msg, currentDate]);

    clearBackendCache();
    return sendSuccess(res, null, 'Cita médica eliminada con éxito.');
  } catch (error) {
    console.error('Error al eliminar cita médica:', error);
    return sendError(res, 'Error del servidor.', 500);
  }
});

export default router;
