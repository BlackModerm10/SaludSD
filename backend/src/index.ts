import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth.routes.js';
import centerRouter from './routes/center.routes.js';
import waitlistRouter from './routes/waitlist.routes.js';
import appointmentRouter from './routes/appointment.routes.js';
import notificationRouter from './routes/notification.routes.js';
import { query } from './config/db.js';
import { authMiddleware, requireRole } from './middleware/auth.middleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes mounting
app.use('/api/auth', authRouter);
app.use('/api/health-centers', centerRouter);
app.use('/api/waitlist', waitlistRouter);
app.use('/api/appointments', appointmentRouter);
app.use('/api/notifications', notificationRouter);

// GET /api/stats - Obtener estadísticas globales para el Dashboard del Administrador
app.get('/api/stats', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    // 1. Total pacientes en espera (estado = 'en_espera')
    const totalWaitingRes = await query("SELECT COUNT(*) as count FROM lista_espera WHERE estado = 'en_espera'");
    const totalPacientesEspera = parseInt(totalWaitingRes.rows[0].count);

    // 2. Tiempo promedio de espera en días
    const avgWaitRes = await query("SELECT COALESCE(AVG(tiempo_estimado_dias), 0) as avg_days FROM lista_espera WHERE estado = 'en_espera'");
    const tiempoPromedioEspera = Math.round(parseFloat(avgWaitRes.rows[0].avg_days));

    // 3. Citas de hoy (fecha = CURRENT_DATE)
    const appointmentsTodayRes = await query("SELECT COUNT(*) as count FROM citas WHERE fecha = CURRENT_DATE");
    const citasHoy = parseInt(appointmentsTodayRes.rows[0].count);

    // 4. Citas de la semana (fecha dentro de los últimos 7 días)
    const appointmentsWeekRes = await query("SELECT COUNT(*) as count FROM citas WHERE fecha BETWEEN CURRENT_DATE AND DATE_ADD(CURRENT_DATE, INTERVAL 7 DAY)");
    const citasSemana = parseInt(appointmentsWeekRes.rows[0].count);

    // 5. Demanda por especialidad
    const demandBySpecialtyRes = await query(`
      SELECT especialidad as nombre, COUNT(*) as cantidad, COALESCE(AVG(tiempo_estimado_dias), 0) as "promedioDias"
      FROM lista_espera
      WHERE estado = 'en_espera'
      GROUP BY especialidad
      ORDER BY cantidad DESC;
    `);
    const porEspecialidad = demandBySpecialtyRes.rows.map(row => ({
      nombre: row.nombre,
      cantidad: parseInt(row.cantidad),
      promedioDias: Math.round(parseFloat(row.promedioDias))
    }));

    // 6. Ocupación por centro
    const occupancyByCenterRes = await query(`
      SELECT c.nombre, c.ocupacion_actual as ocupacion,
             (SELECT COUNT(*) FROM lista_espera WHERE centro_id = c.id AND estado = 'en_espera') as "enEspera"
      FROM centros_salud c;
    `);
    const porCentro = occupancyByCenterRes.rows.map(row => ({
      nombre: row.nombre,
      ocupacion: row.ocupacion,
      enEspera: parseInt(row.enEspera)
    }));

    // Especialidad más demandada y centro más saturado para KPIs rápidos
    const especialidadMasDemandada = porEspecialidad.length > 0 ? porEspecialidad[0].nombre : 'Ninguna';
    
    let centroMasSaturado = 'Ninguno';
    if (porCentro.length > 0) {
      const sortedCenters = [...porCentro].sort((a, b) => b.ocupacion - a.ocupacion);
      centroMasSaturado = sortedCenters[0].nombre;
    }

    return res.json({
      totalPacientesEspera,
      tiempoPromedioEspera,
      citasHoy,
      citasSemana,
      especialidadMasDemandada,
      centroMasSaturado,
      tendencia: 'estable',
      porEspecialidad,
      porCentro
    });

  } catch (error) {
    console.error('Error al generar estadísticas de salud:', error);
    return res.status(500).json({ error: 'Error del servidor al calcular estadísticas.' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Start Server
app.listen(PORT, () => {
  console.log(`SaludSD Servidor API: Corriendo en http://localhost:${PORT}`);
});
