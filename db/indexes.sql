-- INDEXES.SQL - Índices Adicionales

-- Equipo: Rudi Fabricio Martínez Jaimes

-- Fecha: 2026-02-09

-- Nota: schema.sql ya define:
--   idx_ordenes_usuario_id, idx_productos_categoria_id, idx_ordenes_status

-- Estos índices son ADICIONALES para optimizar las VIEWS.

-- Índice 1: Optimiza JOINs entre orden_detalles y productos
-- Usado por: vw_ventas_por_categoria, vw_productos_mas_vendidos
CREATE INDEX IF NOT EXISTS idx_orden_detalles_producto_id
    ON orden_detalles(producto_id);

-- Índice 2: Optimiza filtros y agrupación por fecha
-- Usado por: vw_resumen_diario
CREATE INDEX IF NOT EXISTS idx_ordenes_created_at
    ON ordenes(created_at);

-- Índice 3: Optimiza filtros por producto activo
-- Usado por: consultas de productos activos
CREATE INDEX IF NOT EXISTS idx_productos_activo
    ON productos(activo);
