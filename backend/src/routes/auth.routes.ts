import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query } from '../config/db.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'saludsd_secret_key_for_jwt_2026_primary_health_sec!';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const STAFF_RUTS = [
  '9.876.543-3',   // Dr. Carlos Muñoz
  '11.111.111-1',  // Dra. Patricia Herrera
  '22.222.222-2',  // Kin. Roberto Araya
];

// Helper to validate RUT format/DV
function validateRut(rut: string | number): boolean {
  if (!rut) return false;
  const rutStr = String(rut);
  const cleaned = rutStr.replace(/[^0-9kK]/g, '').toUpperCase();
  if (cleaned.length < 2) return false;
  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);
  let sum = 0;
  let mul = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const expectedDv = 11 - (sum % 11);
  const dvChar = expectedDv === 11 ? '0' : expectedDv === 10 ? 'K' : String(expectedDv);
  return dv === dvChar;
}

// 1. Registro Local
router.post('/register', async (req: Request, res: Response) => {
  const { nombre, rut, email, password, region, comuna } = req.body;

  // Validación de inputs
  if (!nombre || !rut || !email || !password || !region || !comuna) {
    return res.status(400).json({ error: 'Todos los campos marcados con (*) son requeridos.' });
  }

  const rutStr = String(rut);
  const passStr = String(password);
  const emailStr = String(email);

  if (!validateRut(rutStr)) {
    return res.status(400).json({ error: 'El RUT ingresado no es válido.' });
  }

  // Validación de formato de email básico
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailStr)) {
    return res.status(400).json({ error: 'El correo electrónico no es válido.' });
  }

  if (passStr.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
  }

  try {
    // Verificar si el RUT ya existe
    const rutCheck = await query('SELECT id FROM usuarios WHERE rut = $1', [rutStr]);
    if (rutCheck.rows.length > 0) {
      return res.status(400).json({ error: 'El RUT ya se encuentra registrado.' });
    }

    // Verificar si el email ya existe
    const emailCheck = await query('SELECT id FROM usuarios WHERE email = $1', [emailStr]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
    }

    // Cifrar la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passStr, salt);

    // Determinar rol
    const role = STAFF_RUTS.includes(rutStr) ? 'admin' : 'paciente';

    // Generar UUID local
    const id = crypto.randomUUID();

    // Insertar en la BD (MySQL compatible sin RETURNING)
    await query(`
      INSERT INTO usuarios (id, nombre, rut, email, password_hash, region, comuna, role)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
    `, [id, String(nombre), rutStr, emailStr, passwordHash, String(region), String(comuna), role]);

    const newUser = { id, nombre: String(nombre), rut: rutStr, email: emailStr, role };

    // Generar JWT
    const token = jwt.sign(
      { id: newUser.id, rut: newUser.rut, nombre: newUser.nombre, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    return res.status(201).json({
      message: 'Usuario registrado exitosamente.',
      token,
      user: newUser
    });

  } catch (error) {
    console.error('Error en /register:', error);
    return res.status(500).json({ error: 'Error del servidor al registrar el usuario.' });
  }
});

// 2. Login Local (RUT + Contraseña)
router.post('/login', async (req: Request, res: Response) => {
  const { rut, password } = req.body;

  if (!rut || !password) {
    return res.status(400).json({ error: 'RUT y contraseña son obligatorios.' });
  }

  const rutStr = String(rut);
  const passStr = String(password);

  try {
    const result = await query('SELECT * FROM usuarios WHERE rut = $1', [rutStr]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const user = result.rows[0];

    const match = await bcrypt.compare(passStr, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const token = jwt.sign(
      { id: user.id, rut: user.rut, nombre: user.nombre, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    return res.json({
      message: 'Autenticación exitosa.',
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        rut: user.rut,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error en /login:', error);
    return res.status(500).json({ error: 'Error del servidor al iniciar sesión.' });
  }
});

// 3. Callback de ClaveÚnica (Simulación)
router.post('/claveunica/callback', async (req: Request, res: Response) => {
  const { code, state } = req.body;

  try {
    let rut = '12.345.678-5'; // Paciente por defecto (María González)

    if (code === 'mock_admin_code' || state === 'mock_admin_state') {
      rut = '9.876.543-3'; // Funcionario por defecto (Carlos Muñoz)
    }

    let result = await query('SELECT * FROM usuarios WHERE rut = $1', [rut]);

    if (result.rows.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('123456', salt);
      const isStaff = STAFF_RUTS.includes(rut);
      const nombre = isStaff ? 'Dr. Carlos Muñoz' : 'María González Pérez';
      const email = isStaff ? 'carlos.munoz@saludsd.cl' : 'maria.gonzalez@email.com';
      const role = isStaff ? 'admin' : 'paciente';
      const id = crypto.randomUUID();

      await query(`
        INSERT INTO usuarios (id, rut, nombre, email, password_hash, region, comuna, role)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
      `, [id, rut, nombre, email, passwordHash, 'Valparaíso', 'Santo Domingo', role]);

      result = await query('SELECT * FROM usuarios WHERE rut = $1', [rut]);
    }

    const user = result.rows[0];

    const token = jwt.sign(
      { id: user.id, rut: user.rut, nombre: user.nombre, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    return res.json({
      message: 'Autenticación con ClaveÚnica exitosa.',
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        rut: user.rut,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error en /claveunica/callback:', error);
    return res.status(500).json({ error: 'Error del servidor durante la simulación de ClaveÚnica.' });
  }
});

// 4. Perfil Actual (Ruta protegida)
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.user) {
    return res.status(401).json({ error: 'No autenticado.' });
  }

  try {
    const result = await query('SELECT id, nombre, rut, email, role, region, comuna FROM usuarios WHERE id = $1', [authReq.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    return res.json({ user: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ error: 'Error del servidor al obtener el perfil.' });
  }
});

export default router;
