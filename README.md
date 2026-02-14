# Dashboard de Reportes E-Commerce

Este proyecto implementa un dashboard de analítica para un e-commerce utilizando **Next.js**, **PostgreSQL** y **Docker**. El sistema se centra en el uso eficiente de la base de datos mediante **VIEWS** y **Materialized Views** (simuladas aquí como vistas estándar por simplicidad) para generar reportes de alto rendimiento.

## 🚀 Tecnologías

*   **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS.
*   **Backend/DB**: PostgreSQL 15.
*   **Infraestructura**: Docker & Docker Compose.
*   **Lenguaje**: TypeScript.
*   **Validación**: Zod.

## 📋 Vistas Implementadas (SQL)

El núcleo del análisis reside en 5 vistas SQL optimizadas:

1.  **`vw_ventas_por_categoria`**: Ingresos y volumen de ventas agrupados por categoría.
2.  **`vw_productos_mas_vendidos`**: Top productos con ranking, stock e ingresos.
3.  **`vw_usuarios_con_compras`**: Segmentación de clientes (VIP, Frecuente, Nuevo) basada en su gasto histórico.
4.  **`vw_ordenes_por_status`**: Monitoreo del ciclo de vida de los pedidos (Pendiente -> Entregado).
5.  **`vw_resumen_diario`**: Evolución diaria de las ventas con acumulados (Running Total).

## 🛠️ Instalación y Ejecución

La forma más sencilla de correr el proyecto es usando Docker Compose, que levanta tanto la base de datos como la aplicación.

### Prerrequisitos
*   Docker y Docker Compose instalados.

### Pasos

1.  **Clonar el repositorio**:
    ```bash
    git clone https://github.com/RudiFabricio8/lab_report.git
    cd lab_report
    ```

4.  **Configurar Variables de Entorno**:
    Copia el archivo de ejemplo y configura tus credenciales (críticas para seguridad):
    ```bash
    cp .env.example .env
    # Edita .env con tus valores reales
    ```

5.  **Iniciar los servicios**:
    ```bash
    docker compose up --build
    ```

3.  **Acceder al Dashboard**:
    Abre tu navegador en [http://localhost:3000](http://localhost:3000).

### Desarrollo Local (Opcional)

Si deseas ejecutar la app fuera de Docker (requiere que la BD esté corriendo):

1.  Instalar dependencias:
    ```bash
    npm install
    ```
2.  Configurar `.env.local` con tus credenciales de BD.
3.  Correr servidor de desarrollo:
    ```bash
    npm run dev
    ```

## 🔒 Seguridad

*   **Usuario de Solo Lectura**: La aplicación se conecta a la BD usando el rol `app_reader`, que **solo tiene permiso de lectura sobre las vistas**, sin acceso directo a las tablas base.
*   **Validación de Datos**: Todos los parámetros de entrada (filtros, fechas, IDs) son validados estrictamente con **Zod** antes de realizar consultas.
*   **Inyección SQL**: Uso de consultas parametrizadas en todas las llamadas a base de datos.

## 📂 Estructura del Proyecto

*   `db/`: Scripts SQL (Schema, Seeds, Views, Roles).
*   `src/app/`: Páginas y componentes (App Router).
*   `src/lib/`: Lógica de negocio, conexión a BD y queries.
*   `docker-compose.yml`: Orquestación de contenedores.
*   `scripts/verify.sh`: Script de verificación rápida + validación de setup.

## ⚡ Trade-offs: SQL vs Next.js

1. **Window Functions (SUM OVER) en SQL**: Calculamos acumulados directamente en la BD (`vw_resumen_diario`) en lugar de hacerlo en el frontend. **Por qué**: Las window functions de PostgreSQL son extremadamente eficientes para cálculos sobre conjuntos ordenados; trasladar este cálculo a JavaScript sería O(n) y requeriría procesar un dataset potencialmente grande en memoria.

2. **Segmentación de Clientes (CASE para Niveles) en SQL**: La lógica de clasificación VIP/Frecuente/Ocasional vive en `vw_usuarios_con_compras`. **Por qué**: Cambiar la clasificación requeriría redefinir decenas de queries en el frontend; mantenerlo en la BD centraliza la lógica de negocio y garantiza consistencia.

3. **Ranking (ROW_NUMBER) en SQL**: El ranking de productos (`vw_productos_mas_vendidos`) se calcula en la BD. **Por qué**: PostgreSQL es 10-100x más rápido que JavaScript para operaciones de ventana sobre tablas con miles de filas.

4. **Minimalismo en Next.js**: Las páginas React NO incluyen lógica de cálculo adicional; solo fetching, filtrado de parámetros y renderizado. **Por qué**: Mantiene el frontend limpio, delegando inteligencia a la BD donde el cost de I/O es amortizable.

5. **Validación con Zod en Rutas**: Aunque SQL usa prepared statements, validamos shape de entrada en TypeScript. **Por qué**: Feedback rápido al usuario (ej: limit inválido) sin enviar requests inútiles a la BD.

---

## 📊 Performance Evidence (EXPLAIN ANALYZE)

### View 1: `vw_resumen_diario` (Window Function: SUM OVER)
```
Execution Time: 1.431 ms
Total Cost: 1.15..1.47 (estimated) → 0.445..0.471 ms (actual)

Explicación:
• WindowAgg fué el cuello de botella esperado (cálculo de acumulado).
• GroupAggregate previo agrupa por fecha en O(n).
• Sort por fecha es eficiente (quicksort, 25KB memoria).
• Seq Scan en ordenes es aceptable (solo 6 filas en datos de prueba).
• Conclusión: Performance de <2ms es excelente para reportes en tiempo real.
```

### View 2: `vw_ordenes_por_status` (CTE + Aggregate)
```
Execution Time: 0.836 ms
Total Cost: 2.18..2.66 (estimated) → 0.106..0.114 ms (actual)

Explicación:
• Nested Loop con CROSS JOIN (resumen × gran_total) es eficiente.
• HashAggregate + Batches: 1 confirma que todo encaja en memoria caché.
• Dos Seq Scans en ordenes (tabla pequeña) son óptimos para este tamaño.
• CTE no introduce overhead (el planner optimiza inline).
• Conclusión: Orders-by-status queries <1ms; ideal para dashboards.
```

### View 3: `vw_productos_mas_vendidos` (Multiple JOINs + Window)
```
Execution Time: 1.140 ms
Total Cost: 16.92..17.03 (estimated) → 0.621..0.635 ms (actual)

Explicación:
• Dos Hash Joins (orden_detalles→productos, categorias) compilados inline.
• WindowAgg (ROW_NUMBER) ordena por unidades_vendidas DESC.
• HashAggregate con Filter (sum >= 1) agrega primero, luego filtra.
• Memory Usage: 24-26kB; sin spilleo a disco.
• Índices creados en FK (orden_detalles.producto_id, productos.categoria_id) mejoran performance de joins.
• Conclusión: Denormalizaciones evitadas; tres tablas unidas en <2ms.
```

---

## 🔐 Threat Model: Prevención de Ataques

1. **SQL Injection**: 
   - ✅ Todas las queries usan `client.query(sql, [params])` (parametrizadas).
   - ✅ Zod valida entrada antes de construir SQL (ej: `limit` validado como entero).
   - ✅ No hay concatenación de strings en queries.

2. **Credenciales en Código**: 
   - ✅ `.env` está en `.gitignore` (no se versionan secretos).
   - ✅ `.env.example` documenta variables requeridas sin valores reales.
   - ✅ Container env vars pasan credenciales de forma aislada.

3. **Permisos Mínimos (Least Privilege)**:
   - ✅ `app_reader` rol tiene SELECT ONLY en views, sin acceso a tablas base.
   - ✅ REVOKE ALL ejecutado explícitamente en `roles.sql`.
   - ✅ Admin (postgres) usa contraseña en `APP_READER_PASSWORD` env var (no hardcoded).

4. **Fuga de Datos vía Respuestas de Error**: 
   - ✅ `db.ts` no loguea queries ni parámetros en producción.
   - ✅ Try/catch en queries retorna `[]` o error genérico al cliente.

5. **CSRF en Formularios**: 
   - ✅ Formularios de búsqueda son GET (idempotentes).
   - ✅ Next.js App Router no requiere CSRF token para datos de solo lectura.

6. **Acceso no autorizado a Datos**: 
   - ✅ Views agregan datos de toda la BD sin filtro por usuario (asumimos usuario = admin de reportes).
   - ✅ Si fuese multi-tenant, implementaríamos Row-Level Security (RLS) en PostgreSQL.

---

## 🤖 Bitácora de IA (Consultas clave)

**Contexto**: Este proyecto fue desarrollado con asistencia de GitHub Copilot para validar query complexity, optimizaciones y seguridad.

### Consultas Clave Realizadas:

1. **"¿Cómo implemento un acumulado (running total) de ventas por día en SQL?"**
   - Validación: SUM() OVER (ORDER BY date) es más eficiente que subconsultas.
   - Corrección: Se agregó PARTITION BY si hubiese múltiples categorías (no era caso aquí).

2. **"¿Cómo garantizo que la app_reader role solo lee desde views?"**
   - Validación: GRANT SELECT on views + REVOKE ALL on tables.
   - Corrección: Se ejecutó REVOKE explícitamente en roles.sql (no asumir permisos por defecto).

3. **"¿Qué índices mejoran JOINs en orden_detalles?"**
   - Validación: FK índices automáticos + adicionales en producto_id, created_at, activo.
   - Corrección: Se prefirieron índices simples sobre composite (mejor selectivity para filtros individuales).

4. **"¿Cómo validar entrada de usuario sin ser verbose?"**
   - Validación: Zod schemas reutilizables (SearchParams, DateRangeSchema).
   - Corrección: Se movió lógica de parsing a `src/lib/schemas.ts` para DRY.

5. **"¿Docker Compose healthcheck para PostgreSQL?"**
   - Validación: `pg_isready` es más robusto que PING simple.
   - Corrección: Se configuró con retries=10, timeout=5s (espera activa hasta 50s).

### Qué Se Validó Manualmente:

- ✅ Cada view retorna datos consistentes (correr SELECT 10 veces = mismo resultado).
- ✅ Filtros en reportes (limit, query, date range) no rompen queries.
- ✅ Paginación en customer-summary no salta registros (offset × limit).
- ✅ Conversión de decimales en JS (toLocaleString, toFixed) no pierde precisión.
- ✅ ENV vars no se exponen al cliente (solo en ruta `/api` que no existe; reportes son SSR).

### Qué Se Corrigió en Defensa:

1. URL origen repo era incorrecta (muro-firmas-hackathon → lab_report) — ARREGLADO.
2. README no tenía Trade-offs, Performance, Threat Model, Bitácora — AGREGADO AQUÍ.
3. Verify script faltaba — CREADO EN `scripts/verify.sh`.
4. Views SQL tenían comentarios "VERIFY" sin automatización — INCLUIDO EN VERIFY.SH.

---

## ✅ Checklist de Validación Rápida

Antes de presentar, ejecuta:

```bash
# 1. Verificación completa (BD + App + Views)
bash scripts/verify.sh

# 2. Ver todas las views en BD
docker exec lab_report_db psql -U postgres -d reportes_db -c "\dv"

# 3. Acceder a Dashboard
open http://localhost:3000

# 4. Revisar logs en caso de error
docker compose logs -f
```


