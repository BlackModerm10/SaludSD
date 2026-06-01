import { Router, Response } from 'express';
import crypto from 'crypto';
import { query } from '../config/db.js';
import { authMiddleware, requireRole, AuthenticatedRequest } from '../middleware/auth.middleware.js';

const router = Router();

// GET /api/waitlist - Obtener registros de lista de espera
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'No autenticado.' });

  try {
    if (user.role === 'admin') {
      const result = await query(`
        SELECT w.id, w.especialidad, w.fecha_solicitud as fechaSolicitud, w.prioridad, w.estado, 
               w.tiempo_estimado_dias as tiempoEstimadoDias, COALESCE(w.posicion, 1) as posicion,
               c.nombre as centroSalud, w.centro_id as centroId, u.nombre as pacienteNombre, 
               u.rut as pacienteRut, w.paciente_id as pacienteId,
               (SELECT COUNT(*) FROM lista_espera WHERE especialidad = w.especialidad AND estado = 'en_espera') as totalEnLista
        FROM lista_espera w
        JOIN centros_salud c ON w.centro_id = c.id
        JOIN usuarios u ON w.paciente_id = u.id
        ORDER BY w.fecha_solicitud DESC;
      `);
      return res.json(result.rows);
    } else {
      const result = await query(`
        SELECT w.id, w.especialidad, w.fecha_solicitud as fechaSolicitud, w.prioridad, w.estado, 
               w.tiempo_estimado_dias as tiempoEstimadoDias, COALESCE(w.posicion, 1) as posicion,
               c.nombre as centroSalud, w.centro_id as centroId, u.nombre as pacienteNombre, 
               u.rut as pacienteRut, w.paciente_id as pacienteId,
               (SELECT COUNT(*) FROM lista_espera WHERE especialidad = w.especialidad AND estado = 'en_espera') as totalEnLista
        FROM lista_espera w
        JOIN centros_salud c ON w.centro_id = c.id
        JOIN usuarios u ON w.paciente_id = u.id
        WHERE w.paciente_id = $1
        ORDER BY w.fecha_solicitud DESC;
      `, [user.id]);
      return res.json(result.rows);
    }
  } catch (error) {
    console.error('Error al obtener lista de espera:', error);
    return res.status(500).json({ error: 'Error del servidor al obtener registros de lista de espera.' });
  }
});

// POST /api/waitlist - Agregar un paciente a la lista de espera
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'No autenticado.' });

  const { especialidad, centroId, prioridad } = req.body;

  if (!especialidad || !centroId) {
    return res.status(400).json({ error: 'Especialidad y Centro de salud son campos requeridos.' });
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
      return res.status(400).json({ error: 'El centro de salud especificado no existe.' });
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

    return res.status(201).json({
      message: 'Solicitud de lista de espera creada con éxito.',
      entry: newEntry
    });

  } catch (error) {
    console.error('Error al crear registro en lista de espera:', error);
    return res.status(500).json({ error: 'Error del servidor al ingresar a la lista de espera.' });
  }
});

// PUT /api/waitlist/:id - Editar registro de lista de espera (Solo Administrador)
router.put('/:id', authMiddleware, requireRole('admin'), async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { estado, prioridad, centroId, posicion } = req.body;

  try {
    const checkRes = await query('SELECT * FROM lista_espera WHERE id = $1', [id]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ error: 'El registro de lista de espera no existe.' });
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
      return res.status(400).json({ error: 'No se enviaron campos válidos para actualizar.' });
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
    }

    return res.json({
      message: 'Registro de lista de espera actualizado con éxito.',
      entry: updatedEntry
    });

  } catch (error) {
    console.error('Error al actualizar registro de lista de espera:', error);
    return res.status(500).json({ error: 'Error del servidor al actualizar el registro.' });
  }
});

// DELETE /api/waitlist/:id - Eliminar registro de lista de espera (Solo Administrador)
router.delete('/:id', authMiddleware, requireRole('admin'), async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    const checkRes = await query('SELECT * FROM lista_espera WHERE id = $1', [id]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ error: 'El registro de lista de espera no existe.' });
    }

    const entry = checkRes.rows[0];

    await query('DELETE FROM lista_espera WHERE id = $1', [id]);

    const currentDate = new Date().toISOString().slice(0, 10);
    await query(`
      INSERT INTO notificaciones (id, usuario_id, titulo, mensaje, fecha, tipo)
      VALUES ($1, $2, $3, $4, $5, 'alerta');
    `, [crypto.randomUUID(), entry.paciente_id, 'Solicitud Removida', `Tu solicitud para la especialidad de ${entry.especialidad} ha sido retirada del sistema.`, currentDate]);

    return res.json({ message: 'Registro de lista de espera eliminado con éxito.' });
  } catch (error) {
    console.error('Error al eliminar registro de lista de espera:', error);
    return res.status(500).json({ error: 'Error del servidor al eliminar el registro.' });
  }
});

export default router;
