import { Router, Request, Response } from 'express';
import { query } from '../config/db.js';

const router = Router();

// GET /api/health-centers - Obtener todos los centros y sus especialidades
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT c.*, GROUP_CONCAT(e.especialidad) as especialidades
      FROM centros_salud c
      LEFT JOIN especialidades_centro e ON c.id = e.centro_id
      GROUP BY c.id;
    `);

    // Formatear la respuesta para el frontend
    const centers = result.rows.map(row => {
      // En MySQL, GROUP_CONCAT retorna un string delimitado por comas
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

    return res.json(centers);
  } catch (error) {
    console.error('Error al obtener centros de salud:', error);
    return res.status(500).json({ error: 'Error del servidor al obtener los centros de salud.' });
  }
});

export default router;
