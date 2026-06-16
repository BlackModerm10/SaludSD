import { Router, Response } from 'express';
import crypto from 'crypto';
import { query } from '../config/db.js';
import { authMiddleware, requireRole, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { encrypt, decrypt } from '../config/encryption.js';
import { cacheMiddleware, clearBackendCache } from '../utils/cache.js';
import { sendWaitlistEmail } from '../services/email.service.js';

const router = Router();

// GET /api/waitlist - Obtener registros de lista de espera
router.get('/', authMiddleware, cacheMiddleware(15000), async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  if (!user) return sendError(res, 'No autenticado.', 401);

  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 1000; // Default to a large limit if pagination isn't active on client
    const offset = (page - 1) * limit;

    const sortFieldMap: { [key: string]: string } = {
      fechaSolicitud: 'w.fecha_solicitud',
      fecha_solicitud: 'w.fecha_solicitud',
      prioridad: 'w.prioridad',
      posicion: 'w.posicion',
      tiempoEstimadoDias: 'w.tiempo_estimado_dias',
      especialidad: 'w.especialidad',
      estado: 'w.estado'
    };
    const sort = sortFieldMap[req.query.sort as string] || 'w.fecha_solicitud';
    const order = req.query.order === 'ASC' ? 'ASC' : 'DESC';

    const conditions: string[] = [];
    const params: any[] = [];
    let count = 1;

    if (user.role !== 'admin') {
      conditions.push(`w.paciente_id = $${count++}`);
      params.push(user.id);
    } else {
      if (req.query.pacienteId) {
        conditions.push(`w.paciente_id = $${count++}`);
        params.push(req.query.pacienteId);
      }
    }

    if (req.query.especialidad) {
      conditions.push(`w.especialidad = $${count++}`);
      params.push(req.query.especialidad);
    }
    if (req.query.estado) {
      conditions.push(`w.estado = $${count++}`);
      params.push(req.query.estado);
    }
    if (req.query.centroId || req.query.centro_id) {
      conditions.push(`w.centro_id = $${count++}`);
      params.push(req.query.centroId || req.query.centro_id);
    }
    if (req.query.search) {
      const term = (req.query.search as string).trim();
      const isRutSearch = /^[0-9.\-kK]+$/.test(term);
      if (isRutSearch) {
        conditions.push(`u.rut = $${count++}`);
        params.push(encrypt(term));
      } else {
        conditions.push(`u.nombre LIKE $${count++}`);
        params.push(`%${term}%`);
      }
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count total
    const countSql = `
      SELECT COUNT(*) as total
      FROM lista_espera w
      JOIN usuarios u ON w.paciente_id = u.id
      ${whereClause};
    `;
    const countRes = await query(countSql, params);
    const total = parseInt(countRes.rows[0].total || '0');

    // Fetch paginated data
    const selectParams = [...params, limit, offset];
    const selectSql = `
      SELECT w.id, w.especialidad, w.fecha_solicitud as fechaSolicitud, w.prioridad, w.estado, 
             w.tiempo_estimado_dias as tiempoEstimadoDias,
             COALESCE(
               (SELECT COUNT(*) + 1 
                FROM lista_espera 
                WHERE especialidad = w.especialidad 
                  AND estado = 'en_espera' 
                  AND (COALESCE(posicion, 99999) < COALESCE(w.posicion, 99999) 
                       OR (COALESCE(posicion, 99999) = COALESCE(w.posicion, 99999) AND id < w.id))
               ), 1) as posicion,
             c.nombre as centroSalud, w.centro_id as centroId, u.nombre as pacienteNombre, 
             u.rut as pacienteRut, w.paciente_id as pacienteId,
             (SELECT COUNT(*) FROM lista_espera WHERE especialidad = w.especialidad AND estado = 'en_espera') as totalEnLista
      FROM lista_espera w
      JOIN centros_salud c ON w.centro_id = c.id
      JOIN usuarios u ON w.paciente_id = u.id
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

    return sendSuccess(res, decryptedRows, 'Listas de espera obtenidas con éxito.', {
      page,
      limit,
      total,
      totalPages
    });
  } catch (error) {
    console.error('Error al obtener lista de espera:', error);
    return sendError(res, 'Error del servidor al obtener registros de lista de espera.', 500);
  }
});

// GET /api/waitlist/:id - Obtener un registro de lista de espera por ID
router.get('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const { id } = req.params;
  if (!user) return sendError(res, 'No autenticado.', 401);

  try {
    const result = await query(`
      SELECT w.id, w.especialidad, w.fecha_solicitud as fechaSolicitud, w.prioridad, w.estado, 
             w.tiempo_estimado_dias as tiempoEstimadoDias,
             COALESCE(
               (SELECT COUNT(*) + 1 
                FROM lista_espera 
                WHERE especialidad = w.especialidad 
                  AND estado = 'en_espera' 
                  AND (COALESCE(posicion, 99999) < COALESCE(w.posicion, 99999) 
                       OR (COALESCE(posicion, 99999) = COALESCE(w.posicion, 99999) AND id < w.id))
               ), 1) as posicion,
             c.nombre as centroSalud, w.centro_id as centroId, u.nombre as pacienteNombre, 
             u.rut as pacienteRut, w.paciente_id as pacienteId,
             (SELECT COUNT(*) FROM lista_espera WHERE especialidad = w.especialidad AND estado = 'en_espera') as totalEnLista
      FROM lista_espera w
      JOIN centros_salud c ON w.centro_id = c.id
      JOIN usuarios u ON w.paciente_id = u.id
      WHERE w.id = $1;
    `, [id]);

    if (result.rows.length === 0) {
      return sendError(res, 'El registro de lista de espera no existe.', 404);
    }

    const entry = result.rows[0];
    entry.pacienteRut = decrypt(entry.pacienteRut);

    if (user.role !== 'admin' && entry.pacienteId !== user.id) {
      return sendError(res, 'Permisos insuficientes para esta operación.', 403);
    }

    return sendSuccess(res, entry, 'Registro de lista de espera obtenido con éxito.');
  } catch (error) {
    console.error('Error al obtener registro de lista de espera por ID:', error);
    return sendError(res, 'Error del servidor al obtener el registro de lista de espera.', 500);
  }
});

// POST /api/waitlist - Agregar un paciente a la lista de espera
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  if (!user) return sendError(res, 'No autenticado.', 401);

  const { especialidad, centroId, prioridad } = req.body;

  if (!especialidad || !centroId) {
    return sendError(res, 'Especialidad y Centro de salud son campos requeridos.', 400);
  }

  try {
    const countResult = await query(`
      SELECT COUNT(*) as count FROM lista_espera 
      WHERE especialidad = $1 AND estado = 'en_espera';
    `, [especialidad]);
    const currentCount = parseInt(countResult.rows[0].count);
    const newPosition = currentCount + 1;

    const centerRes = await query('SELECT tiempo_espera_promedio FROM centros_salud WHERE id = $1', [centroId]);
    if (centerRes.rows.length === 0) {
      return sendError(res, 'El centro de salud especificado no existe.', 400);
    }
    const baseDays = centerRes.rows[0].tiempo_espera_promedio || 30;
    
    let priorityMultiplier = 1.0;
    if (prioridad === 'alta') priorityMultiplier = 0.6;
    else if (prioridad === 'urgente') priorityMultiplier = 0.2;
    const estimatedDays = Math.max(1, Math.round(baseDays * priorityMultiplier));

    const id = crypto.randomUUID();
    const currentDate = new Date().toISOString().slice(0, 10); // Formato YYYY-MM-DD para MySQL

    // Insertar en la BD
    await query(`
      INSERT INTO lista_espera (id, paciente_id, especialidad, centro_id, fecha_solicitud, prioridad, estado, tiempo_estimado_dias, posicion)
      VALUES ($1, $2, $3, $4, $5, $6, 'en_espera', $7, $8);
    `, [id, user.id, especialidad, centroId, currentDate, prioridad || 'normal', estimatedDays, newPosition]);

    const newEntry = {
      id,
      paciente_id: user.id,
      especialidad,
      centro_id: centroId,
      fecha_solicitud: currentDate,
      prioridad: prioridad || 'normal',
      estado: 'en_espera',
      tiempo_estimado_dias: estimatedDays,
      posicion: newPosition
    };

    const centerNameRes = await query('SELECT nombre FROM centros_salud WHERE id = $1', [centroId]);
    const centerName = centerNameRes.rows[0].nombre;
    const msg = `Tu solicitud para la lista de espera en ${especialidad} (${centerName}) ha sido ingresada. Posición asignada: #${newPosition}.`;
    
    await query(`
      INSERT INTO notificaciones (id, usuario_id, titulo, mensaje, fecha, tipo)
      VALUES ($1, $2, $3, $4, $5, 'exito');
    `, [crypto.randomUUID(), user.id, 'Lista de Espera Ingresada', msg, currentDate]);

    clearBackendCache();
    return sendSuccess(res, newEntry, 'Solicitud de lista de espera creada con éxito.', undefined, 201);

  } catch (error) {
    console.error('Error al crear registro en lista de espera:', error);
    return sendError(res, 'Error del servidor al ingresar a la lista de espera.', 500);
  }
});

// PUT /api/waitlist/:id - Editar registro de lista de espera (Solo Administrador)
router.put('/:id', authMiddleware, requireRole('admin'), async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { estado, prioridad, centroId, posicion } = req.body;

  try {
    const checkRes = await query('SELECT * FROM lista_espera WHERE id = $1', [id]);
    if (checkRes.rows.length === 0) {
      return sendError(res, 'El registro de lista de espera no existe.', 404);
    }

    const currentEntry = checkRes.rows[0];

    const fields: string[] = [];
    const values: any[] = [];
    let count = 1;

    if (estado !== undefined) {
      fields.push(`estado = $${count++}`);
      values.push(estado);
    }
    if (prioridad !== undefined) {
      fields.push(`prioridad = $${count++}`);
      values.push(prioridad);
    }
    if (centroId !== undefined) {
      fields.push(`centro_id = $${count++}`);
      values.push(centroId);
    }
    if (posicion !== undefined) {
      fields.push(`posicion = $${count++}`);
      values.push(posicion);
    }

    if (fields.length === 0) {
      return sendError(res, 'No se enviaron campos válidos para actualizar.', 400);
    }

    values.push(id);
    const updateQuery = `
      UPDATE lista_espera
      SET ${fields.join(', ')}
      WHERE id = $${count};
    `;

    await query(updateQuery, values);

    // Obtener el registro actualizado
    const selectRes = await query('SELECT * FROM lista_espera WHERE id = $1', [id]);
    const updatedEntry = selectRes.rows[0];

    if (estado !== undefined && estado !== currentEntry.estado) {
      let titulo = 'Actualización de Lista de Espera';
      let mensaje = `El estado de tu solicitud de ${currentEntry.especialidad} ha cambiado a: ${estado === 'programada' ? 'Programada' : estado}.`;
      let tipo: 'info' | 'alerta' | 'exito' = 'info';

      if (estado === 'programada') {
        titulo = '¡Cita Programada!';
        mensaje = `Tu turno en la lista de ${currentEntry.especialidad} ha llegado. Revisa tu próxima cita.`;
        tipo = 'exito';
      }

      const currentDate = new Date().toISOString().slice(0, 10);
      await query(`
        INSERT INTO notificaciones (id, usuario_id, titulo, mensaje, fecha, tipo)
        VALUES ($1, $2, $3, $4, $5, $6);
      `, [crypto.randomUUID(), currentEntry.paciente_id, titulo, mensaje, currentDate, tipo]);

      // Fetch patient details and center name to send email alert
      const patientRes = await query('SELECT nombre, email FROM usuarios WHERE id = $1', [currentEntry.paciente_id]);
      const centerRes = await query('SELECT nombre FROM centros_salud WHERE id = $1', [currentEntry.centro_id || updatedEntry.centro_id]);
      
      if (patientRes.rows.length > 0 && centerRes.rows.length > 0) {
        const patient = patientRes.rows[0];
        const centerName = centerRes.rows[0].nombre;
        sendWaitlistEmail(patient.email, patient.nombre, currentEntry.especialidad, centerName, estado, updatedEntry.posicion)
          .catch(err => console.error('Error al enviar email de actualización de lista de espera:', err));
      }
    }

    clearBackendCache();
    return sendSuccess(res, updatedEntry, 'Registro de lista de espera actualizado con éxito.');

  } catch (error) {
    console.error('Error al actualizar registro de lista de espera:', error);
    return sendError(res, 'Error del servidor al actualizar el registro.', 500);
  }
});

// DELETE /api/waitlist/:id - Eliminar registro de lista de espera (Solo Administrador)
router.delete('/:id', authMiddleware, requireRole('admin'), async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    const checkRes = await query('SELECT * FROM lista_espera WHERE id = $1', [id]);
    if (checkRes.rows.length === 0) {
      return sendError(res, 'El registro de lista de espera no existe.', 404);
    }

    const entry = checkRes.rows[0];

    await query('DELETE FROM lista_espera WHERE id = $1', [id]);

    const currentDate = new Date().toISOString().slice(0, 10);
    await query(`
      INSERT INTO notificaciones (id, usuario_id, titulo, mensaje, fecha, tipo)
      VALUES ($1, $2, $3, $4, $5, 'alerta');
    `, [crypto.randomUUID(), entry.paciente_id, 'Solicitud Removida', `Tu solicitud para la especialidad de ${entry.especialidad} ha sido retirada del sistema.`, currentDate]);

    clearBackendCache();
    return sendSuccess(res, null, 'Registro de lista de espera eliminado con éxito.');
  } catch (error) {
    console.error('Error al eliminar registro de lista de espera:', error);
    return sendError(res, 'Error del servidor al eliminar el registro.', 500);
  }
});

export default router;
