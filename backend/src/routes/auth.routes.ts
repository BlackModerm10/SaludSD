import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { z } from 'zod';
import { query } from '../config/db.js';
import { authMiddleware, requireRole, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { encrypt, decrypt } from '../config/encryption.js';
import { sendWelcomeEmail, sendRecoveryEmail } from '../services/email.service.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'saludsd_secret_key_for_jwt_2026_primary_health_sec!';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m'; // Short JWT expiration

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

// Zod Validation Schemas
const registerSchema = z.object({
  nombre: z.string().trim().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  rut: z.string().trim().refine(validateRut, { message: 'El RUT ingresado no es válido.' }),
  email: z.string().trim().email('El correo electrónico no es válido.'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
  region: z.string().min(1, 'La región es obligatoria.'),
  comuna: z.string().min(1, 'La comuna es obligatoria.'),
});

const loginSchema = z.object({
  rut: z.string().trim().refine(validateRut, { message: 'El RUT ingresado no es válido.' }),
  password: z.string().min(1, 'La contraseña es obligatoria.'),
});

// 1. Registro Local
router.post('/register', async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map(e => e.message).join(' ');
    return res.status(400).json({ error: errorMsg });
  }

  const { nombre, rut, email, password, region, comuna } = parsed.data;
  const rutStr = String(rut);
  const passStr = String(password);
  const emailStr = String(email);
  const encryptedRut = encrypt(rutStr);

  try {
    // Verificar si el RUT ya existe (buscando el RUT cifrado)
    const rutCheck = await query('SELECT id FROM usuarios WHERE rut = $1', [encryptedRut]);
    if (rutCheck.rows.length > 0) {
      return res.status(400).json({ error: 'El RUT ya se encuentra registrado.' });
    }

    // Verificar si el email ya existe
    const emailCheck = await query('SELECT id FROM usuarios WHERE email = $1', [emailStr]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
    }

    // Cifrar la contraseña
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(passStr, salt);

    // Determinar rol
    const role = STAFF_RUTS.includes(rutStr) ? 'admin' : 'paciente';

    // Generar UUID local
    const id = crypto.randomUUID();
    const refreshToken = crypto.randomBytes(40).toString('hex');

    // Insertar en la BD
    await query(`
      INSERT INTO usuarios (id, nombre, rut, email, password_hash, region, comuna, role, refresh_token)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
    `, [id, nombre, encryptedRut, emailStr, passwordHash, region, comuna, role, refreshToken]);

    const newUser = { id, nombre: String(nombre), rut: rutStr, email: emailStr, role };

    // Generar JWT (con RUT plano)
    const token = jwt.sign(
      { id: newUser.id, rut: newUser.rut, nombre: newUser.nombre, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    // Enviar correo de bienvenida de forma asíncrona
    sendWelcomeEmail(email, nombre).catch(err => console.error('Error al enviar email de bienvenida:', err));

    return res.status(201).json({
      message: 'Usuario registrado exitosamente.',
      token,
      refreshToken,
      user: newUser
    });

  } catch (error) {
    console.error('Error en /register:', error);
    return res.status(500).json({ error: 'Error del servidor al registrar el usuario.' });
  }
});

// 2. Login Local (RUT + Contraseña)
router.post('/login', async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map(e => e.message).join(' ');
    return res.status(400).json({ error: errorMsg });
  }

  const { rut, password } = parsed.data;
  const rutStr = String(rut);
  const passStr = String(password);
  const encryptedRut = encrypt(rutStr);

  try {
    const result = await query('SELECT * FROM usuarios WHERE rut = $1', [encryptedRut]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const user = result.rows[0];

    const match = await bcrypt.compare(passStr, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const decryptedRut = decrypt(user.rut);
    const refreshToken = crypto.randomBytes(40).toString('hex');

    await query('UPDATE usuarios SET refresh_token = $1 WHERE id = $2', [refreshToken, user.id]);

    const token = jwt.sign(
      { id: user.id, rut: decryptedRut, nombre: user.nombre, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    return res.json({
      message: 'Autenticación exitosa.',
      token,
      refreshToken,
      user: {
        id: user.id,
        nombre: user.nombre,
        rut: decryptedRut,
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

    const encryptedRut = encrypt(rut);
    let result = await query('SELECT * FROM usuarios WHERE rut = $1', [encryptedRut]);

    if (result.rows.length === 0) {
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash('123456', salt);
      const isStaff = STAFF_RUTS.includes(rut);
      const nombre = isStaff ? 'Dr. Carlos Muñoz' : 'María González Pérez';
      const email = isStaff ? 'carlos.munoz@saludsd.cl' : 'maria.gonzalez@email.com';
      const role = isStaff ? 'admin' : 'paciente';
      const id = crypto.randomUUID();

      await query(`
        INSERT INTO usuarios (id, rut, nombre, email, password_hash, region, comuna, role)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
      `, [id, encryptedRut, nombre, email, passwordHash, 'Valparaíso', 'Santo Domingo', role]);

      result = await query('SELECT * FROM usuarios WHERE rut = $1', [encryptedRut]);
    }

    const user = result.rows[0];
    const decryptedRut = decrypt(user.rut);
    const refreshToken = crypto.randomBytes(40).toString('hex');

    await query('UPDATE usuarios SET refresh_token = $1 WHERE id = $2', [refreshToken, user.id]);

    const token = jwt.sign(
      { id: user.id, rut: decryptedRut, nombre: user.nombre, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    return res.json({
      message: 'Autenticación con ClaveÚnica exitosa.',
      token,
      refreshToken,
      user: {
        id: user.id,
        nombre: user.nombre,
        rut: decryptedRut,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error en /claveunica/callback:', error);
    return res.status(500).json({ error: 'Error del servidor durante la simulación de ClaveÚnica.' });
  }
});

// POST /api/auth/refresh-token - Refresh access token and rotate refresh token
router.post('/refresh-token', async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token es requerido.' });
  }

  try {
    const result = await query('SELECT * FROM usuarios WHERE refresh_token = $1', [refreshToken]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Refresh token inválido o expirado.' });
    }

    const user = result.rows[0];
    const decryptedRut = decrypt(user.rut);
    const newRefreshToken = crypto.randomBytes(40).toString('hex');

    // Rotate refresh token in DB
    await query('UPDATE usuarios SET refresh_token = $1 WHERE id = $2', [newRefreshToken, user.id]);

    const token = jwt.sign(
      { id: user.id, rut: decryptedRut, nombre: user.nombre, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    return res.json({
      token,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    console.error('Error al refrescar token:', error);
    return res.status(500).json({ error: 'Error del servidor al refrescar el token.' });
  }
});

// POST /api/auth/logout - Revoke refresh token
router.post('/logout', authMiddleware, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.user) {
    return sendError(res, 'No autenticado.', 401);
  }

  try {
    await query('UPDATE usuarios SET refresh_token = NULL WHERE id = $1', [authReq.user.id]);
    return sendSuccess(res, null, 'Sesión cerrada con éxito.');
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    return sendError(res, 'Error del servidor al cerrar sesión.', 500);
  }
});

// POST /api/auth/recover-password - Generate OTP and email it to user
router.post('/recover-password', async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'El correo electrónico es requerido.' });
  }

  try {
    const result = await query('SELECT * FROM usuarios WHERE email = $1', [email.trim()]);
    if (result.rows.length === 0) {
      return res.json({ message: 'Si el correo ingresado existe en nuestro sistema, recibirá un código de verificación de 6 dígitos.' });
    }

    const user = result.rows[0];
    const otp = String(100000 + Math.floor(Math.random() * 900000));
    const expiry = Date.now() + 15 * 60 * 1000; // 15 mins expiry

    // Save OTP to DB
    await query('UPDATE usuarios SET reset_otp = $1, reset_otp_expiry = $2 WHERE id = $3', [otp, expiry, user.id]);

    // Send email asynchronously
    sendRecoveryEmail(user.email, user.nombre, otp).catch(err => console.error('Error al enviar email de recuperación:', err));

    return res.json({ message: 'Si el correo ingresado existe en nuestro sistema, recibirá un código de verificación de 6 dígitos.' });
  } catch (error) {
    console.error('Error en /recover-password:', error);
    return res.status(500).json({ error: 'Error del servidor al iniciar proceso de recuperación.' });
  }
});

// POST /api/auth/reset-password - Verify OTP and update password
router.post('/reset-password', async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ error: 'Correo electrónico, código OTP y nueva contraseña son obligatorios.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres.' });
  }

  try {
    const result = await query('SELECT * FROM usuarios WHERE email = $1 AND reset_otp = $2 AND reset_otp_expiry > $3', [email.trim(), otp.trim(), Date.now()]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'El código OTP es inválido, incorrecto o ha expirado.' });
    }

    const user = result.rows[0];
    const salt = bcrypt.genSaltSync(12);
    const passwordHash = bcrypt.hashSync(newPassword, salt);

    // Update password and clear OTP
    await query('UPDATE usuarios SET password_hash = $1, reset_otp = NULL, reset_otp_expiry = NULL WHERE id = $2', [passwordHash, user.id]);

    return res.json({ message: 'Contraseña restablecida exitosamente. Ya puede iniciar sesión con sus nuevas credenciales.' });
  } catch (error) {
    console.error('Error en /reset-password:', error);
    return res.status(500).json({ error: 'Error del servidor al restablecer contraseña.' });
  }
});

// 4. Perfil Actual (Ruta protegida)
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.user) {
    return sendError(res, 'No autenticado.', 401);
  }

  try {
    const result = await query('SELECT id, nombre, rut, email, role, region, comuna FROM usuarios WHERE id = $1', [authReq.user.id]);
    if (result.rows.length === 0) {
      return sendError(res, 'Usuario no encontrado.', 404);
    }
    const user = result.rows[0];
    user.rut = decrypt(user.rut);

    return sendSuccess(res, user, 'Perfil obtenido con éxito.');
  } catch (error) {
    return sendError(res, 'Error del servidor al obtener el perfil.', 500);
  }
});

// GET /api/auth/users - Listar todos los usuarios (Solo Admin)
router.get('/users', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 1000;
    const offset = (page - 1) * limit;

    const sortFieldMap: { [key: string]: string } = {
      nombre: 'nombre',
      rut: 'rut',
      email: 'email',
      role: 'role'
    };
    const sort = sortFieldMap[req.query.sort as string] || 'nombre';
    const order = req.query.order === 'ASC' ? 'ASC' : 'DESC';

    const conditions: string[] = [];
    const params: any[] = [];
    let count = 1;

    if (req.query.role) {
      conditions.push(`role = $${count++}`);
      params.push(req.query.role);
    }
    if (req.query.search) {
      const term = (req.query.search as string).trim();
      const isRutSearch = /^[0-9.\-kK]+$/.test(term);
      if (isRutSearch) {
        conditions.push(`rut = $${count++}`);
        params.push(encrypt(term));
      } else {
        conditions.push(`nombre LIKE $${count++}`);
        params.push(`%${term}%`);
      }
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count
    const countSql = `SELECT COUNT(*) as total FROM usuarios ${whereClause};`;
    const countRes = await query(countSql, params);
    const total = parseInt(countRes.rows[0].total || '0');

    // Fetch
    const selectParams = [...params, limit, offset];
    const selectSql = `
      SELECT id, nombre, rut, email, role, region, comuna, created_at 
      FROM usuarios 
      ${whereClause} 
      ORDER BY ${sort} ${order} 
      LIMIT $${count++} OFFSET $${count++};
    `;
    const result = await query(selectSql, selectParams);

    // Decrypt RUTs in rows
    const decryptedRows = result.rows.map(row => ({
      ...row,
      rut: decrypt(row.rut)
    }));

    const totalPages = Math.ceil(total / limit);

    return sendSuccess(res, decryptedRows, 'Usuarios obtenidos con éxito.', {
      page,
      limit,
      total,
      totalPages
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return sendError(res, 'Error del servidor al obtener la lista de usuarios.', 500);
  }
});

// GET /api/auth/users/:id - Obtener un usuario por ID (Admin o el propio usuario)
router.get('/users/:id', authMiddleware, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const { id } = req.params;
  if (!authReq.user) return sendError(res, 'No autenticado.', 401);

  if (authReq.user.role !== 'admin' && authReq.user.id !== id) {
    return sendError(res, 'Permisos insuficientes para esta operación.', 403);
  }

  try {
    const result = await query('SELECT id, nombre, rut, email, role, region, comuna, created_at FROM usuarios WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return sendError(res, 'Usuario no encontrado.', 404);
    }
    const user = result.rows[0];
    user.rut = decrypt(user.rut);

    return sendSuccess(res, user, 'Usuario obtenido con éxito.');
  } catch (error) {
    console.error('Error al obtener usuario por ID:', error);
    return sendError(res, 'Error del servidor.', 500);
  }
});

// PUT /api/auth/users/:id - Actualizar datos de un usuario (Admin o el propio usuario)
router.put('/users/:id', authMiddleware, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const { id } = req.params;
  if (!authReq.user) return sendError(res, 'No autenticado.', 401);

  if (authReq.user.role !== 'admin' && authReq.user.id !== id) {
    return sendError(res, 'Permisos insuficientes para esta operación.', 403);
  }

  const { nombre, email, password, region, comuna, role } = req.body;

  try {
    const checkRes = await query('SELECT * FROM usuarios WHERE id = $1', [id]);
    if (checkRes.rows.length === 0) {
      return sendError(res, 'El usuario no existe.', 404);
    }

    const fields: string[] = [];
    const values: any[] = [];
    let count = 1;

    if (nombre !== undefined) {
      fields.push(`nombre = $${count++}`);
      values.push(nombre);
    }
    if (email !== undefined) {
      fields.push(`email = $${count++}`);
      values.push(email);
    }
    if (region !== undefined) {
      fields.push(`region = $${count++}`);
      values.push(region);
    }
    if (comuna !== undefined) {
      fields.push(`comuna = $${count++}`);
      values.push(comuna);
    }
    // Solo admin puede cambiar el rol
    if (role !== undefined && authReq.user.role === 'admin') {
      fields.push(`role = $${count++}`);
      values.push(role);
    }
    if (password !== undefined) {
      const salt = bcrypt.genSaltSync(12);
      const passwordHash = bcrypt.hashSync(password, salt);
      fields.push(`password_hash = $${count++}`);
      values.push(passwordHash);
    }

    if (fields.length === 0) {
      return sendError(res, 'No se enviaron campos válidos para actualizar.', 400);
    }

    values.push(id);
    const updateQuery = `
      UPDATE usuarios
      SET ${fields.join(', ')}
      WHERE id = $${count};
    `;
    await query(updateQuery, values);

    // Obtener el usuario actualizado
    const selectRes = await query('SELECT id, nombre, rut, email, role, region, comuna FROM usuarios WHERE id = $1', [id]);
    const updatedUser = selectRes.rows[0];
    updatedUser.rut = decrypt(updatedUser.rut);

    return sendSuccess(res, updatedUser, 'Usuario actualizado con éxito.');

  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return sendError(res, 'Error del servidor al actualizar el usuario.', 500);
  }
});

// DELETE /api/auth/users/:id - Eliminar un usuario (Solo Admin)
router.delete('/users/:id', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const checkRes = await query('SELECT id FROM usuarios WHERE id = $1', [id]);
    if (checkRes.rows.length === 0) {
      return sendError(res, 'El usuario no existe.', 404);
    }

    await query('DELETE FROM usuarios WHERE id = $1', [id]);

    return sendSuccess(res, null, 'Usuario eliminado con éxito.');
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return sendError(res, 'Error del servidor al eliminar el usuario.', 500);
  }
});

export default router;
