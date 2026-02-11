-- ============================================
-- REPORTS_VW.SQL - Vistas para Reportes
-- ============================================
-- Equipo: Rudi Fabricio Martínez Jaimes
-- Fecha: 2026-02-09
-- Dominio: E-Commerce (Ventas, Productos, Usuarios)
-- ============================================

-- ============================================
-- VIEW 1: vw_ventas_por_categoria
-- Grain: Una fila por categoría
-- Métricas: total vendido, cantidad de órdenes, % del total
-- Técnicas: SUM, COUNT, GROUP BY, HAVING, campo calculado
-- ============================================
CREATE OR REPLACE VIEW vw_ventas_por_categoria AS
SELECT
    c.id            AS categoria_id,
    c.nombre        AS categoria,
    COUNT(DISTINCT o.id)  AS total_ordenes,
    SUM(od.subtotal)      AS monto_total,
    ROUND(
        SUM(od.subtotal) * 100.0 / NULLIF((SELECT SUM(subtotal) FROM orden_detalles), 0),
        2
    ) AS pct_del_total
FROM categorias c
JOIN productos p       ON p.categoria_id = c.id
JOIN orden_detalles od ON od.producto_id = p.id
JOIN ordenes o         ON o.id = od.orden_id
GROUP BY c.id, c.nombre
HAVING SUM(od.subtotal) > 0
ORDER BY monto_total DESC;

-- VERIFY: SELECT * FROM vw_ventas_por_categoria;

-- ============================================
-- VIEW 2: vw_productos_mas_vendidos
-- Grain: Una fila por producto
-- Métricas: unidades vendidas, ingresos, ranking
-- Técnicas: SUM, COUNT, GROUP BY, HAVING, ROW_NUMBER() OVER (Window Function)
-- ============================================
CREATE OR REPLACE VIEW vw_productos_mas_vendidos AS
SELECT
    ROW_NUMBER() OVER (ORDER BY SUM(od.cantidad) DESC) AS ranking,
    p.id              AS producto_id,
    p.nombre          AS producto,
    c.nombre          AS categoria,
    SUM(od.cantidad)  AS unidades_vendidas,
    SUM(od.subtotal)  AS ingresos_totales,
    p.precio          AS precio_actual,
    p.stock           AS stock_actual
FROM productos p
JOIN orden_detalles od ON od.producto_id = p.id
JOIN categorias c      ON c.id = p.categoria_id
GROUP BY p.id, p.nombre, c.nombre, p.precio, p.stock
HAVING SUM(od.cantidad) >= 1
ORDER BY unidades_vendidas DESC;

-- VERIFY: SELECT * FROM vw_productos_mas_vendidos;

-- ============================================
-- VIEW 3: vw_usuarios_con_compras
-- Grain: Una fila por usuario
-- Métricas: total de órdenes, gasto total, gasto promedio, nivel
-- Técnicas: SUM, COUNT, AVG, COALESCE, CASE
-- ============================================
CREATE OR REPLACE VIEW vw_usuarios_con_compras AS
SELECT
    u.id          AS usuario_id,
    u.nombre      AS nombre,
    u.email       AS email,
    COALESCE(COUNT(o.id), 0)                AS total_ordenes,
    COALESCE(SUM(o.total), 0)               AS gasto_total,
    COALESCE(ROUND(AVG(o.total), 2), 0)     AS gasto_promedio,
    CASE
        WHEN COALESCE(SUM(o.total), 0) >= 1000 THEN 'VIP'
        WHEN COALESCE(SUM(o.total), 0) >= 200  THEN 'Frecuente'
        WHEN COALESCE(SUM(o.total), 0) > 0     THEN 'Ocasional'
        ELSE 'Sin compras'
    END AS nivel_cliente,
    u.activo      AS activo
FROM usuarios u
LEFT JOIN ordenes o ON o.usuario_id = u.id
GROUP BY u.id, u.nombre, u.email, u.activo
ORDER BY gasto_total DESC;

-- VERIFY: SELECT * FROM vw_usuarios_con_compras;

-- ============================================
-- VIEW 4: vw_ordenes_por_status
-- Grain: Una fila por status
-- Métricas: cantidad de órdenes, monto total, monto promedio, % del total
-- Técnicas: CTE (WITH), COUNT, SUM, AVG, CASE, campo calculado %
-- ============================================
CREATE OR REPLACE VIEW vw_ordenes_por_status AS
WITH resumen AS (
    SELECT
        status,
        COUNT(*)           AS cantidad,
        SUM(total)         AS monto_total,
        ROUND(AVG(total), 2)  AS monto_promedio
    FROM ordenes
    GROUP BY status
),
gran_total AS (
    SELECT SUM(total) AS total_general FROM ordenes
)
SELECT
    r.status,
    CASE r.status
        WHEN 'pendiente' THEN 'Pendiente'
        WHEN 'pagado'    THEN 'Pagado'
        WHEN 'enviado'   THEN 'Enviado'
        WHEN 'entregado' THEN 'Entregado'
        WHEN 'cancelado' THEN 'Cancelado'
        ELSE r.status
    END AS status_label,
    r.cantidad,
    r.monto_total,
    r.monto_promedio,
    ROUND(r.monto_total * 100.0 / NULLIF(gt.total_general, 0), 2) AS pct_del_total
FROM resumen r
CROSS JOIN gran_total gt
ORDER BY r.monto_total DESC;

-- VERIFY: SELECT * FROM vw_ordenes_por_status;

-- ============================================
-- VIEW 5: vw_resumen_diario
-- Grain: Una fila por fecha (día)
-- Métricas: órdenes del día, ingreso del día, ingreso acumulado
-- Técnicas: SUM, COUNT, GROUP BY, SUM() OVER (ORDER BY) — Window Function
-- ============================================
CREATE OR REPLACE VIEW vw_resumen_diario AS
SELECT
    DATE(o.created_at)   AS fecha,
    COUNT(o.id)          AS ordenes_del_dia,
    SUM(o.total)         AS ingreso_del_dia,
    SUM(SUM(o.total)) OVER (ORDER BY DATE(o.created_at)) AS ingreso_acumulado
FROM ordenes o
GROUP BY DATE(o.created_at)
ORDER BY fecha;

-- VERIFY: SELECT * FROM vw_resumen_diario;

-- ============================================
-- FIN DE VIEWS
-- ============================================
