import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { encrypt } from './encryption.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSeed() {
  console.log('Sembrando base de datos en MySQL...');
  
  // 1. Conectar a MySQL sin especificar base de datos para poder crearla
  const initConn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: parseInt(process.env.DB_PORT || '3306'),
    multipleStatements: true,
  });

  try {
    console.log('Asegurando la existencia de la base de datos "saludsd"...');
    await initConn.query('CREATE DATABASE IF NOT EXISTS saludsd;');
    await initConn.end();
  } catch (err) {
    console.error('Error al crear la base de datos "saludsd":', err);
    await initConn.end();
    return;
  }

  // 2. Crear una conexión pool ya apuntando a "saludsd" para el esquema
  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'saludsd',
    port: parseInt(process.env.DB_PORT || '3306'),
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    multipleStatements: true,
  });

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 3. Leer y ejecutar schema.sql (creación de tablas)
    const schemaPath = path.join(__dirname, '..', 'models', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await conn.query(schemaSql);
    console.log('Tablas validadas/creadas exitosamente en MySQL.');

    // 4. Desactivar llaves foráneas para limpiar de forma segura
    await conn.query('SET FOREIGN_KEY_CHECKS = 0;');
    await conn.query('TRUNCATE TABLE notificaciones;');
    await conn.query('TRUNCATE TABLE citas;');
    await conn.query('TRUNCATE TABLE lista_espera;');
    await conn.query('TRUNCATE TABLE especialidades_centro;');
    await conn.query('TRUNCATE TABLE centros_salud;');
    await conn.query('TRUNCATE TABLE usuarios;');
    await conn.query('SET FOREIGN_KEY_CHECKS = 1;');
    console.log('Tablas limpiadas.');

    // 5. Sembrar Usuarios
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('123456', salt); // Contraseña por defecto: 123456

    console.log('Sembrando usuarios...');
    const mariaId = crypto.randomUUID();
    const carlosId = crypto.randomUUID();
    const juanId = crypto.randomUUID();
    const anaId = crypto.randomUUID();
    const pedroId = crypto.randomUUID();
    const luciaId = crypto.randomUUID();
    const robertoId = crypto.randomUUID();

    // Insertar usuarios
    await conn.query(`
      INSERT INTO usuarios (id, rut, nombre, email, password_hash, region, comuna, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `, [mariaId, encrypt('12.345.678-5'), 'María González Pérez', 'maria.gonzalez@email.com', passwordHash, 'Valparaíso', 'Santo Domingo', 'paciente']);

    await conn.query(`
      INSERT INTO usuarios (id, rut, nombre, email, password_hash, region, comuna, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `, [carlosId, encrypt('9.876.543-3'), 'Dr. Carlos Muñoz', 'carlos.munoz@saludsd.cl', passwordHash, 'Valparaíso', 'Santo Domingo', 'admin']);

    await conn.query(`
      INSERT INTO usuarios (id, rut, nombre, email, password_hash, region, comuna, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `, [juanId, encrypt('15.678.234-3'), 'Juan Martínez López', 'juan.martinez@email.com', passwordHash, 'Valparaíso', 'Santo Domingo', 'paciente']);

    await conn.query(`
      INSERT INTO usuarios (id, rut, nombre, email, password_hash, region, comuna, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `, [anaId, encrypt('18.234.567-9'), 'Ana Rojas Vera', 'ana.rojas@email.com', passwordHash, 'Valparaíso', 'Santo Domingo', 'paciente']);

    await conn.query(`
      INSERT INTO usuarios (id, rut, nombre, email, password_hash, region, comuna, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `, [pedroId, encrypt('11.222.333-9'), 'Pedro Soto Díaz', 'pedro.soto@email.com', passwordHash, 'Valparaíso', 'Santo Domingo', 'paciente']);

    await conn.query(`
      INSERT INTO usuarios (id, rut, nombre, email, password_hash, region, comuna, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `, [luciaId, encrypt('14.555.666-K'), 'Lucía Fernández', 'lucia.fernandez@email.com', passwordHash, 'Valparaíso', 'Santo Domingo', 'paciente']);

    await conn.query(`
      INSERT INTO usuarios (id, rut, nombre, email, password_hash, region, comuna, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `, [robertoId, encrypt('10.111.222-5'), 'Roberto Morales', 'roberto.morales@email.com', passwordHash, 'Valparaíso', 'Santo Domingo', 'paciente']);

    // 6. Sembrar Centros de Salud
    console.log('Sembrando centros de salud y especialidades...');
    const centros = [
      {
        id: 'hc1', nombre: 'CESFAM Santo Domingo', tipo: 'CESFAM',
        direccion: 'Las Hortensias #146, Santo Domingo', telefono: '+56 35 220 4500',
        capacidad_diaria: 120, ocupacion_actual: 87, tiempo_espera_promedio: 32,
        especialidades: ['Medicina General', 'Pediatría', 'Ginecología', 'Kinesiología', 'Nutrición', 'Odontología']
      },
      {
        id: 'hc2', nombre: 'Posta Rural El Convento', tipo: 'Posta',
        direccion: 'Sector El Convento s/n, Santo Domingo', telefono: '+56 9 6669 3380',
        capacidad_diaria: 80, ocupacion_actual: 72, tiempo_espera_promedio: 28,
        especialidades: ['Medicina General', 'Pediatría', 'Odontología', 'Kinesiología']
      },
      {
        id: 'hc3', nombre: 'Posta Rural Bucalemu', tipo: 'Posta',
        direccion: 'Sector Bucalemu s/n, Santo Domingo', telefono: '+56 9 4131 2782',
        capacidad_diaria: 60, ocupacion_actual: 93, tiempo_espera_promedio: 2,
        especialidades: ['Urgencia', 'Medicina General', 'Traumatología']
      },
      {
        id: 'hc4', nombre: 'Posta Rural San Enrique', tipo: 'Posta',
        direccion: 'Sector San Enrique s/n, Santo Domingo', telefono: '+56 9 6669 3386',
        capacidad_diaria: 200, ocupacion_actual: 95, tiempo_espera_promedio: 65,
        especialidades: ['Cardiología', 'Traumatología', 'Neurología', 'Oftalmología', 'Dermatología', 'Psiquiatría']
      }
    ];

    for (const c of centros) {
      await conn.query(`
        INSERT INTO centros_salud (id, nombre, tipo, direccion, telefono, capacidad_diaria, ocupacion_actual, tiempo_espera_promedio)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
      `, [c.id, c.nombre, c.tipo, c.direccion, c.telefono, c.capacidad_diaria, c.ocupacion_actual, c.tiempo_espera_promedio]);

      for (const esp of c.especialidades) {
        await conn.query(`
          INSERT INTO especialidades_centro (centro_id, especialidad)
          VALUES (?, ?);
        `, [c.id, esp]);
      }
    }

    // 7. Sembrar Listas de Espera
    console.log('Sembrando listas de espera...');
    const waitList = [
      { id: crypto.randomUUID(), pacienteId: juanId, especialidad: 'Cardiología', centroId: 'hc1', fecha: '2026-02-10', prioridad: 'normal', estado: 'en_espera', tiempo: 45, posicion: 1 },
      { id: crypto.randomUUID(), pacienteId: mariaId, especialidad: 'Cardiología', centroId: 'hc1', fecha: '2026-02-15', prioridad: 'normal', estado: 'en_espera', tiempo: 45, posicion: 2 },
      { id: crypto.randomUUID(), pacienteId: mariaId, especialidad: 'Oftalmología', centroId: 'hc4', fecha: '2026-03-01', prioridad: 'normal', estado: 'en_espera', tiempo: 78, posicion: 1 },
      { id: crypto.randomUUID(), pacienteId: juanId, especialidad: 'Traumatología', centroId: 'hc1', fecha: '2026-01-20', prioridad: 'alta', estado: 'en_espera', tiempo: 15, posicion: 1 },
      { id: crypto.randomUUID(), pacienteId: anaId, especialidad: 'Dermatología', centroId: 'hc4', fecha: '2026-03-10', prioridad: 'normal', estado: 'en_espera', tiempo: 60, posicion: 1 },
      { id: crypto.randomUUID(), pacienteId: pedroId, especialidad: 'Medicina General', centroId: 'hc1', fecha: '2026-04-01', prioridad: 'urgente', estado: 'en_espera', tiempo: 7, posicion: 1 },
      { id: crypto.randomUUID(), pacienteId: luciaId, especialidad: 'Ginecología', centroId: 'hc1', fecha: '2026-02-28', prioridad: 'alta', estado: 'en_espera', tiempo: 35, posicion: 1 },
      { id: crypto.randomUUID(), pacienteId: robertoId, especialidad: 'Cardiología', centroId: 'hc4', fecha: '2026-01-10', prioridad: 'alta', estado: 'programada', tiempo: 25, posicion: 1 }
    ];

    for (const w of waitList) {
      await conn.query(`
        INSERT INTO lista_espera (id, paciente_id, especialidad, centro_id, fecha_solicitud, prioridad, estado, tiempo_estimado_dias, posicion)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
      `, [w.id, w.pacienteId, w.especialidad, w.centroId, w.fecha, w.prioridad, w.estado, w.tiempo, w.posicion]);
    }

    // 8. Sembrar Citas Médicas
    console.log('Sembrando citas médicas...');
    const appointments = [
      { id: crypto.randomUUID(), pacienteId: mariaId, especialidad: 'Medicina General', medico: 'Dra. Patricia Herrera', centroId: 'hc1', fecha: '2026-04-28', hora: '09:30', estado: 'confirmada' },
      { id: crypto.randomUUID(), pacienteId: mariaId, especialidad: 'Kinesiología', medico: 'Kin. Roberto Araya', centroId: 'hc1', fecha: '2026-03-15', hora: '11:00', estado: 'completada', notas: 'Control de rehabilitación lumbar. Evolución favorable.' },
      { id: crypto.randomUUID(), pacienteId: mariaId, especialidad: 'Medicina General', medico: 'Dr. Felipe Cortés', centroId: 'hc2', fecha: '2026-02-10', hora: '10:00', estado: 'completada', notas: 'Control preventivo anual. Exámenes de sangre solicitados.' },
      { id: crypto.randomUUID(), pacienteId: mariaId, especialidad: 'Nutrición', medico: 'Nut. Claudia Reyes', centroId: 'hc1', fecha: '2026-01-22', hora: '14:30', estado: 'completada', notas: 'Plan alimentario personalizado entregado.' }
    ];

    for (const app of appointments) {
      await conn.query(`
        INSERT INTO citas (id, paciente_id, especialidad, medico, centro_id, fecha, hora, estado, notas)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
      `, [app.id, app.pacienteId, app.especialidad, app.medico, app.centroId, app.fecha, app.hora, app.estado, app.notas || null]);
    }

    // 9. Sembrar Notificaciones
    console.log('Sembrando notificaciones...');
    const notifications = [
      { id: crypto.randomUUID(), usuarioId: mariaId, titulo: 'Cita confirmada', mensaje: 'Su cita de Medicina General con Dra. Patricia Herrera ha sido confirmada para el 28 de abril a las 09:30.', fecha: '2026-04-22', leida: false, tipo: 'exito' },
      { id: crypto.randomUUID(), usuarioId: mariaId, titulo: 'Avance en lista de espera', mensaje: 'Su posición en la lista de Cardiología ha avanzado. Ahora está en el lugar #12 de 89.', fecha: '2026-04-20', leida: false, tipo: 'info' },
      { id: crypto.randomUUID(), usuarioId: mariaId, titulo: 'Recordatorio', mensaje: 'Recuerde asistir a su control de Medicina General el 28 de abril. Presente su carnet y documentos.', fecha: '2026-04-24', leida: false, tipo: 'recordatorio' },
      { id: crypto.randomUUID(), usuarioId: mariaId, titulo: 'Nuevo horario CESFAM', mensaje: 'CESFAM Santo Domingo amplía su horario de atención: Lunes a Viernes de 08:00 a 20:00 hrs.', fecha: '2026-04-18', leida: true, tipo: 'info' },
      { id: crypto.randomUUID(), usuarioId: mariaId, titulo: 'Campaña de vacunación', mensaje: 'Campaña de vacunación contra la influenza disponible en todos los CESFAM de la comuna.', fecha: '2026-04-15', leida: true, tipo: 'info' }
    ];

    for (const n of notifications) {
      await conn.query(`
        INSERT INTO notificaciones (id, usuario_id, titulo, mensaje, fecha, leida, tipo)
        VALUES (?, ?, ?, ?, ?, ?, ?);
      `, [n.id, n.usuarioId, n.titulo, n.mensaje, n.fecha, n.leida, n.tipo]);
    }

    await conn.commit();
    console.log('¡Base de datos sembrada con éxito en MySQL!');
  } catch (error) {
    await conn.rollback();
    console.error('Error al sembrar la base de datos:', error);
  } finally {
    conn.release();
    await pool.end();
  }
}

runSeed();
