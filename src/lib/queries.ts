import { query } from './db';
import { SearchParams } from './schemas';

/* ── Tipos de Datos (Interface matching VIEW columns) ── */

export interface VentaCategoria {
  categoria_id: number;
  categoria: string;
  total_ordenes: number;
  monto_total: number;
  pct_del_total: number;
}

export interface ProductoMasVendido {
  ranking: number;
  producto_id: number;
  producto: string;
  categoria: string;
  unidades_vendidas: number;
  ingresos_totales: number;
  precio_actual: number;
  stock_actual: number;
}

export interface UsuarioCompras {
  usuario_id: number;
  nombre: string;
  email: string;
  total_ordenes: number;
  gasto_total: number;
  gasto_promedio: number;
  nivel_cliente: string;
  activo: boolean;
}

export interface OrdenStatus {
  status: string;
  status_label: string;
  cantidad: number;
  monto_total: number;
  monto_promedio: number;
  pct_del_total: number;
}

export interface ResumenDiario {
  fecha: string; // Date string from DB
  ordenes_del_dia: number;
  ingreso_del_dia: number;
  ingreso_acumulado: number;
}

/* ── Funciones de Consulta ── */

export async function getVentasPorCategoria() {
  return query<VentaCategoria>(`
    SELECT * FROM vw_ventas_por_categoria
    ORDER BY monto_total DESC
  `);
}

export async function getProductosMasVendidos(limit: number = 10) {
  return query<ProductoMasVendido>(`
    SELECT * FROM vw_productos_mas_vendidos
    ORDER BY ranking ASC
    LIMIT $1
  `, [limit]);
}

export async function getUsuariosConCompras(params: SearchParams) {
  const { query: search, page, limit } = params;
  const offset = (page - 1) * limit;

  let sql = `SELECT * FROM vw_usuarios_con_compras`;
  const values: (string | number)[] = [];

  if (search) {
    sql += ` WHERE nombre ILIKE $1 OR email ILIKE $1`;
    values.push(`%${search}%`);
  }

  // Ordenamiento fijo por gasto total
  sql += ` ORDER BY gasto_total DESC`;

  // Paginación
  sql += ` LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
  values.push(limit, offset);

  return query<UsuarioCompras>(sql, values);
}

export async function getOrdenesPorStatus() {
  return query<OrdenStatus>(`
    SELECT * FROM vw_ordenes_por_status
    ORDER BY monto_total DESC
  `);
}

export async function getResumenDiario(startDate?: string, endDate?: string) {
  let sql = `SELECT * FROM vw_resumen_diario`;
  const values: string[] = [];

  // Filtro de fechas simple
  if (startDate && endDate) {
    sql += ` WHERE fecha BETWEEN $1 AND $2`;
    values.push(startDate, endDate);
  } else if (startDate) {
    sql += ` WHERE fecha >= $1`;
    values.push(startDate);
  }

  sql += ` ORDER BY fecha ASC`;

  return query<ResumenDiario>(sql, values);
}
