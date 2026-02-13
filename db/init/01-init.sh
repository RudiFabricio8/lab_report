#!/bin/bash
set -e

echo "=== Inicializando Base de Datos ==="

# Ejecutar scripts en orden correcto
# Pasamos la variable APP_READER_PASSWORD al contexto de psql
psql -v ON_ERROR_STOP=1 \
     -v APP_READER_PASSWORD="'$APP_READER_PASSWORD'" \
     --username "$POSTGRES_USER" \
     --dbname "$POSTGRES_DB" <<-EOSQL
    \echo '>>> 1/5 Ejecutando schema.sql...'
    \i /docker-entrypoint-initdb.d/sql/schema.sql

    \echo '>>> 2/5 Ejecutando seed.sql...'
    \i /docker-entrypoint-initdb.d/sql/seed.sql

    \echo '>>> 3/5 Ejecutando reports_vw.sql...'
    \i /docker-entrypoint-initdb.d/sql/reports_vw.sql

    \echo '>>> 4/5 Ejecutando indexes.sql...'
    \i /docker-entrypoint-initdb.d/sql/indexes.sql

    \echo '>>> 5/5 Ejecutando roles.sql...'
    \i /docker-entrypoint-initdb.d/sql/roles.sql
EOSQL

echo "=== Base de Datos inicializada correctamente ==="
