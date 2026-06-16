import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import authRouter from './routes/auth.routes.js';
import centerRouter from './routes/center.routes.js';
import waitlistRouter from './routes/waitlist.routes.js';
import appointmentRouter from './routes/appointment.routes.js';
import notificationRouter from './routes/notification.routes.js';
import { query } from './config/db.js';
import { xssMiddleware } from './middleware/xss.middleware.js';
import { sendSuccess, sendError } from './utils/response.js';
import { cacheMiddleware } from './utils/cache.js';
import morgan from 'morgan';
import logger from './utils/logger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security and Performance Middlewares
app.use(helmet());
app.use(compression());

// Logger middleware
const morganMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  }
);
app.use(morganMiddleware);

// Secure CORS Config
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:5173', 'http://localhost:5174'];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por la política de CORS de SaludSD'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(xssMiddleware);

// Rate Limiting Config
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 200, 
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes desde esta IP, intente de nuevo en 15 minutos.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 5, // 5 attempts limit
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de inicio de sesión o registro, intente de nuevo en 15 minutos.' }
});

// Mount Rate Limiters
app.use('/api', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Routes mounting
app.use('/api/auth', authRouter);
app.use('/api/health-centers', centerRouter);
app.use('/api/waitlist', waitlistRouter);
app.use('/api/appointments', appointmentRouter);
app.use('/api/notifications', notificationRouter);

// GET /api/stats - Obtener estadísticas globales para el Dashboard del Administrador
app.get('/api/stats', cacheMiddleware(10000), async (req, res) => {
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

    return sendSuccess(res, {
      totalPacientesEspera,
      tiempoPromedioEspera,
      citasHoy,
      citasSemana,
      especialidadMasDemandada,
      centroMasSaturado,
      tendencia: 'estable',
      porEspecialidad,
      porCentro
    }, 'Estadísticas globales obtenidas con éxito.');

  } catch (error) {
    console.error('Error al generar estadísticas de salud:', error);
    return sendError(res, 'Error del servidor al calcular estadísticas.', 500);
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  return sendSuccess(res, { status: 'ok', timestamp: new Date() }, 'Health check ok.');
});

// Start Server
const startServer = async () => {
  try {
    const migrations = [
      "ALTER TABLE usuarios ADD COLUMN refresh_token VARCHAR(255) NULL;",
      "ALTER TABLE usuarios ADD COLUMN reset_otp VARCHAR(6) NULL;",
      "ALTER TABLE usuarios ADD COLUMN reset_otp_expiry BIGINT NULL;",
      "ALTER TABLE usuarios MODIFY COLUMN rut VARCHAR(100) NOT NULL;"
    ];
    for (const sql of migrations) {
      try {
        await query(sql);
      } catch (err) {
        // Ignore column already exists or similar errors
      }
    }
    console.log('MySQL schema: columnas de sesión, recuperación OTP y longitud de RUT verificadas/actualizadas.');

    // DB Optimization indexes
    const indexes = [
      "CREATE INDEX idx_waitlist_paciente ON lista_espera(paciente_id);",
      "CREATE INDEX idx_waitlist_centro ON lista_espera(centro_id);",
      "CREATE INDEX idx_waitlist_esp_state ON lista_espera(especialidad, estado);",
      "CREATE INDEX idx_citas_paciente ON citas(paciente_id);",
      "CREATE INDEX idx_citas_centro ON citas(centro_id);",
      "CREATE INDEX idx_citas_date ON citas(fecha);",
      "CREATE INDEX idx_notifications_user ON notificaciones(usuario_id);",
    ];
    for (const sql of indexes) {
      try {
        await query(sql);
      } catch (err) {
        // Ignore if index already exists
      }
    }
    console.log('MySQL schema: índices de optimización verificados.');
  } catch (err) {
    // Ignore error if column already exists
  }
  
  app.listen(PORT, () => {
    console.log(`SaludSD Servidor API: Corriendo en http://localhost:${PORT}`);
  });
};

startServer();
