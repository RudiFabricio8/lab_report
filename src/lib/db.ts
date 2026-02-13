import { Pool } from 'pg';

/* ── Pool de conexión ── */
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'reportes_db',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 10,
  idleTimeoutMillis: 30_000,
});

export async function query<T>(
  text: string,
  params?: (string | number)[],
): Promise<T[]> {
  const { rows } = await pool.query(text, params);
  return rows as T[];
}

export default pool;
