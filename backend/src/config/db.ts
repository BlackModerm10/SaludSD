import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'saludsd',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
});

console.log('MySQL Pool creado para puerto:', process.env.DB_PORT || '3306');

export const query = async (text: string, params?: any[]) => {
  // Convertir placeholders de PostgreSQL ($1, $2, ...) a MySQL (?)
  const mysqlText = text.replace(/\$\d+/g, '?');
  
  const [rows] = await pool.query(mysqlText, params);
  
  // Retornar en el mismo formato { rows } para que sea compatible
  return { rows: rows as any[] };
};

export default pool;
