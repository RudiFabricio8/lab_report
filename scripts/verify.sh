#!/bin/bash
# verify.sh - Verificación rápida del proyecto
# Este script valida que Docker esté corriendo, la BD está lista, y todas las views existen.

set -e

echo "🔍 Iniciando verificación del proyecto lab_report..."
echo ""

# 1. Verificar Docker
echo "1️⃣  Verificando Docker Compose..."
if ! docker compose ps > /dev/null 2>&1; then
    echo "❌ Docker Compose no está corriendo."
    echo "   Ejecuta: docker compose up --build"
    exit 1
fi
echo "✅ Docker Compose está activo"
echo ""

# 2. Verificar BD está healthy
echo "2️⃣  Verificando BD (PostgreSQL)..."
if ! docker exec lab_report_db pg_isready -U postgres -d reportes_db > /dev/null 2>&1; then
    echo "❌ Base de datos no está lista."
    echo "   Espera 10 segundos y vuelve a intentar (healthcheck en progreso)..."
    sleep 10
    if ! docker exec lab_report_db pg_isready -U postgres -d reportes_db > /dev/null 2>&1; then
        echo "❌ BD sigue sin estár lista. Revisa logs: docker compose logs db"
        exit 1
    fi
fi
echo "✅ Base de datos está healthy"
echo ""

# 3. Listar Views
echo "3️⃣  Verificando Views SQL..."
echo ""
docker exec lab_report_db psql -U postgres -d reportes_db -c "
    SELECT table_name 
    FROM information_schema.views 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
" 2>/dev/null
echo ""
echo "✅ Views listadas correctamente"
echo ""

# 4. Ejecutar 1 query por view
echo "4️⃣  Ejecutando queries de muestra en cada view..."
echo ""

echo "   • vw_ventas_por_categoria:"
docker exec lab_report_db psql -U postgres -d reportes_db -c \
    "SELECT categoria, monto_total FROM vw_ventas_por_categoria LIMIT 1;" 2>/dev/null
echo ""

echo "   • vw_productos_mas_vendidos:"
docker exec lab_report_db psql -U postgres -d reportes_db -c \
    "SELECT producto, unidades_vendidas FROM vw_productos_mas_vendidos LIMIT 1;" 2>/dev/null
echo ""

echo "   • vw_usuarios_con_compras:"
docker exec lab_report_db psql -U postgres -d reportes_db -c \
    "SELECT nombre, nivel_cliente FROM vw_usuarios_con_compras LIMIT 1;" 2>/dev/null
echo ""

echo "   • vw_ordenes_por_status:"
docker exec lab_report_db psql -U postgres -d reportes_db -c \
    "SELECT status_label, cantidad FROM vw_ordenes_por_status LIMIT 1;" 2>/dev/null
echo ""

echo "   • vw_resumen_diario:"
docker exec lab_report_db psql -U postgres -d reportes_db -c \
    "SELECT fecha, ordenes_del_dia FROM vw_resumen_diario LIMIT 1;" 2>/dev/null
echo ""

echo "✅ Queries de muestra ejecutadas exitosamente"
echo ""

# 5. Verificar conectividad App
echo "5️⃣  Verificando que Next.js está corriendo..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Next.js (puerto 3000) está activo"
else
    echo "⚠️  Next.js aún no responde (podría estar en inicio). Espera 10 segundos..."
    sleep 10
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ Next.js ahora está disponible"
    else
        echo "❌ Next.js no responde. Revisa logs: docker compose logs app"
    fi
fi
echo ""

echo "═══════════════════════════════════════════════════════"
echo "🎉 Verificación completada exitosamente!"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "📍 Acceso:"
echo "   • Dashboard: http://localhost:3000"
echo "   • PostgreSQL: localhost:5434 (usuario: postgres)"
echo ""
echo "💡 Pasos siguientes:"
echo "   1. Abre http://localhost:3000 en tu navegador"
echo "   2. Navega por los 5 reportes disponibles"
echo "   3. Verifica filtros, paginación y datos"
echo ""
