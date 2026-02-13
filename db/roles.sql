-- Crear rol si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_reader') THEN
        CREATE ROLE app_reader WITH LOGIN PASSWORD :'APP_READER_PASSWORD';
    END IF;
END
$$;

-- Permisos de SELECT SOLO sobre las VIEWS (no sobre tablas)
GRANT CONNECT ON DATABASE reportes_db TO app_reader;
GRANT USAGE ON SCHEMA public TO app_reader;

GRANT SELECT ON vw_ventas_por_categoria   TO app_reader;
GRANT SELECT ON vw_productos_mas_vendidos TO app_reader;
GRANT SELECT ON vw_usuarios_con_compras   TO app_reader;
GRANT SELECT ON vw_ordenes_por_status     TO app_reader;
GRANT SELECT ON vw_resumen_diario         TO app_reader;

-- Asegurar que NO tenga acceso a las tablas base
REVOKE ALL ON ordenes FROM app_reader;
REVOKE ALL ON orden_detalles FROM app_reader;
REVOKE ALL ON productos FROM app_reader;
REVOKE ALL ON usuarios FROM app_reader;
REVOKE ALL ON categorias FROM app_reader;

-- Verificación (Opcional, solo informativa)
-- SELECT table_name, privilege_type
-- FROM information_schema.role_table_grants
-- WHERE grantee = 'app_reader';
