-- ============================================
-- ROLES.SQL - Configuración de Seguridad
-- ============================================
-- Equipo: Rudi Fabricio Martínez Jaimes
-- Fecha: 2026-02-09
-- ============================================
-- Crea un usuario app_reader con permisos de solo lectura
-- sobre las VIEWS, sin acceso a las tablas base.
-- ============================================

-- Crear rol si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_reader') THEN
        CREATE ROLE app_reader WITH LOGIN PASSWORD 'reader_secure_2026';
    END IF;
END
$$;

-- Permisos de conexión
GRANT CONNECT ON DATABASE reportes_db TO app_reader;

-- Permisos de uso del schema public
GRANT USAGE ON SCHEMA public TO app_reader;

-- Permisos de SELECT SOLO sobre las VIEWS (no sobre tablas)
GRANT SELECT ON vw_ventas_por_categoria   TO app_reader;
GRANT SELECT ON vw_productos_mas_vendidos TO app_reader;
GRANT SELECT ON vw_usuarios_con_compras   TO app_reader;
GRANT SELECT ON vw_ordenes_por_status     TO app_reader;
GRANT SELECT ON vw_resumen_diario         TO app_reader;

-- Revocar acceso a tablas base (por seguridad explícita)
REVOKE ALL ON categorias      FROM app_reader;
REVOKE ALL ON usuarios        FROM app_reader;
REVOKE ALL ON productos       FROM app_reader;
REVOKE ALL ON ordenes         FROM app_reader;
REVOKE ALL ON orden_detalles  FROM app_reader;

-- ============================================
-- FIN DE ROLES
-- ============================================
-- Verificar permisos:
-- psql -U app_reader -d reportes_db -c "SELECT * FROM vw_ventas_por_categoria LIMIT 1;"  -- ✅ Debe funcionar
-- psql -U app_reader -d reportes_db -c "SELECT * FROM productos LIMIT 1;"                -- ❌ Debe fallar
