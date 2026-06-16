import { Router, Request, Response } from 'express';
import { query } from '../config/db.js';
import { authMiddleware, requireRole } from '../middleware/auth.middleware.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { cacheMiddleware, clearBackendCache } from '../utils/cache.js';

const router = Router();

// GET /api/health-centers - Obtener todos los centros con filtros y paginación
router.get('/', cacheMiddleware(30000), async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 1000;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: any[] = [];
    let count = 1;

    if (req.query.tipo) {
      conditions.push(`c.tipo = $${count++}`);
      params.push(req.query.tipo);
    }
    if (req.query.search) {
      conditions.push(`c.nombre LIKE $${count++}`);
      params.push(`%${req.query.search}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count
    const countSql = `
      SELECT COUNT(*) as total
      FROM centros_salud c
      ${whereClause};
    `;
    const countRes = await query(countSql, params);
    const total = parseInt(countRes.rows[0].total || '0');

    // Fetch paginated centers
    const selectParams = [...params, limit, offset];
    const selectSql = `
      SELECT c.*, GROUP_CONCAT(e.especialidad) as especialidades
      FROM centros_salud c
      LEFT JOIN especialidades_centro e ON c.id = e.centro_id
      ${whereClause}
      GROUP BY c.id
      LIMIT $${count++} OFFSET $${count++};
    `;
    const result = await query(selectSql, selectParams);

    const centers = result.rows.map(row => {
      let especialidades: string[] = [];
      if (row.especialidades) {
        especialidades = row.especialidades.split(',');
      }

      return {
        id: row.id,
        nombre: row.nombre,
        tipo: row.tipo,
        direccion: row.direccion,
        telefono: row.telefono,
        especialidades: especialidades,
        tiempoEsperaPromedio: row.tiempo_espera_promedio,
        capacidadDiaria: row.capacidad_diaria,
        ocupacionActual: row.ocupacion_actual
      };
    });

    const totalPages = Math.ceil(total / limit);

    return sendSuccess(res, centers, 'Centros de salud obtenidos con éxito.', {
      page,
      limit,
      total,
      totalPages
    });
  } catch (error) {
    console.error('Error al obtener centros de salud:', error);
    return sendError(res, 'Error del servidor al obtener los centros de salud.', 500);
  }
});

// GET /api/health-centers/:id - Obtener un centro de salud por ID
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await query(`
      SELECT c.*, GROUP_CONCAT(e.especialidad) as especialidades
      FROM centros_salud c
      LEFT JOIN especialidades_centro e ON c.id = e.centro_id
      WHERE c.id = $1
      GROUP BY c.id;
    `, [id]);

    if (result.rows.length === 0) {
      return sendError(res, 'El centro de salud no existe.', 404);
    }

    const row = result.rows[0];
    let especialidades: string[] = [];
    if (row.especialidades) {
      especialidades = row.especialidades.split(',');
    }

    const center = {
      id: row.id,
      nombre: row.nombre,
      tipo: row.tipo,
      direccion: row.direccion,
      telefono: row.telefono,
      especialidades: especialidades,
      tiempoEsperaPromedio: row.tiempo_espera_promedio,
      capacidadDiaria: row.capacidad_diaria,
      ocupacionActual: row.ocupacion_actual
    };

    return sendSuccess(res, center, 'Centro de salud obtenido con éxito.');
  } catch (error) {
    console.error('Error al obtener centro de salud por ID:', error);
    return sendError(res, 'Error del servidor.', 500);
  }
});

// POST /api/health-centers - Crear un centro de salud (Solo Admin)
router.post('/', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  const { id, nombre, tipo, direccion, telefono, capacidadDiaria, ocupacionActual, tiempoEsperaPromedio, especialidades } = req.body;

  if (!id || !nombre || !tipo || !direccion || !telefono || capacidadDiaria === undefined) {
    return sendError(res, 'Campos requeridos faltantes (id, nombre, tipo, direccion, telefono, capacidadDiaria).', 400);
  }

  try {
    // Verificar si ya existe el ID
    const checkRes = await query('SELECT id FROM centros_salud WHERE id = $1', [id]);
    if (checkRes.rows.length > 0) {
      return sendError(res, 'Ya existe un centro de salud con ese ID.', 409);
    }

    await query(`
      INSERT INTO centros_salud (id, nombre, tipo, direccion, telefono, capacidad_diaria, ocupacion_actual, tiempo_espera_promedio)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
    `, [id, nombre, tipo, direccion, telefono, capacidadDiaria, ocupacionActual || 0, tiempoEsperaPromedio || 30]);

    if (Array.isArray(especialidades)) {
      for (const esp of especialidades) {
        await query(`
          INSERT INTO especialidades_centro (centro_id, especialidad)
          VALUES ($1, $2);
        `, [id, esp]);
      }
    }

    const newCenter = {
      id,
      nombre,
      tipo,
      direccion,
      telefono,
      capacidadDiaria,
      ocupacionActual: ocupacionActual || 0,
      tiempoEsperaPromedio: tiempoEsperaPromedio || 30,
      especialidades: especialidades || []
    };

    clearBackendCache();
    return sendSuccess(res, newCenter, 'Centro de salud creado con éxito.', undefined, 201);
  } catch (error) {
    console.error('Error al crear centro de salud:', error);
    return sendError(res, 'Error del servidor al crear el centro de salud.', 500);
  }
});

// PUT /api/health-centers/:id - Actualizar un centro de salud (Solo Admin)
router.put('/:id', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nombre, tipo, direccion, telefono, capacidadDiaria, ocupacionActual, tiempoEsperaPromedio, especialidades } = req.body;

  try {
    const checkRes = await query('SELECT * FROM centros_salud WHERE id = $1', [id]);
    if (checkRes.rows.length === 0) {
      return sendError(res, 'El centro de salud no existe.', 404);
    }

    const fields: string[] = [];
    const values: any[] = [];
    let count = 1;

    if (nombre !== undefined) {
      fields.push(`nombre = $${count++}`);
      values.push(nombre);
    }
    if (tipo !== undefined) {
      fields.push(`tipo = $${count++}`);
      values.push(tipo);
    }
    if (direccion !== undefined) {
      fields.push(`direccion = $${count++}`);
      values.push(direccion);
    }
    if (telefono !== undefined) {
      fields.push(`telefono = $${count++}`);
      values.push(telefono);
    }
    if (capacidadDiaria !== undefined) {
      fields.push(`capacidad_diaria = $${count++}`);
      values.push(capacidadDiaria);
    }
    if (ocupacionActual !== undefined) {
      fields.push(`ocupacion_actual = $${count++}`);
      values.push(ocupacionActual);
    }
    if (tiempoEsperaPromedio !== undefined) {
      fields.push(`tiempo_espera_promedio = $${count++}`);
      values.push(tiempoEsperaPromedio);
    }

    if (fields.length > 0) {
      values.push(id);
      const updateQuery = `
        UPDATE centros_salud
        SET ${fields.join(', ')}
        WHERE id = $${count};
      `;
      await query(updateQuery, values);
    }

    // Actualizar especialidades si se proveen
    if (Array.isArray(especialidades)) {
      await query('DELETE FROM especialidades_centro WHERE centro_id = $1', [id]);
      for (const esp of especialidades) {
        await query(`
          INSERT INTO especialidades_centro (centro_id, especialidad)
          VALUES ($1, $2);
        `, [id, esp]);
      }
    }

    // Obtener el centro actualizado
    const selectRes = await query(`
      SELECT c.*, GROUP_CONCAT(e.especialidad) as especialidades
      FROM centros_salud c
      LEFT JOIN especialidades_centro e ON c.id = e.centro_id
      WHERE c.id = $1
      GROUP BY c.id;
    `, [id]);
    
    const row = selectRes.rows[0];
    let finalEspecialidades: string[] = [];
    if (row.especialidades) {
      finalEspecialidades = row.especialidades.split(',');
    }

    const updatedCenter = {
      id: row.id,
      nombre: row.nombre,
      tipo: row.tipo,
      direccion: row.direccion,
      telefono: row.telefono,
      especialidades: finalEspecialidades,
      tiempoEsperaPromedio: row.tiempo_espera_promedio,
      capacidadDiaria: row.capacidad_diaria,
      ocupacionActual: row.ocupacion_actual
    };

    clearBackendCache();
    return sendSuccess(res, updatedCenter, 'Centro de salud actualizado con éxito.');
  } catch (error) {
    console.error('Error al actualizar centro de salud:', error);
    return sendError(res, 'Error del servidor al actualizar el centro de salud.', 500);
  }
});

// DELETE /api/health-centers/:id - Eliminar un centro de salud (Solo Admin)
router.delete('/:id', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const checkRes = await query('SELECT id FROM centros_salud WHERE id = $1', [id]);
    if (checkRes.rows.length === 0) {
      return sendError(res, 'El centro de salud no existe.', 404);
    }

    // Eliminamos el centro (ON DELETE CASCADE eliminará las especialidades asociadas automáticamente)
    await query('DELETE FROM centros_salud WHERE id = $1', [id]);

    clearBackendCache();
    return sendSuccess(res, null, 'Centro de salud eliminado con éxito.');
  } catch (error) {
    console.error('Error al eliminar centro de salud:', error);
    return sendError(res, 'Error del servidor al eliminar el centro de salud.', 500);
  }
});

export default router;
