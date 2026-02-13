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
    git clone https://github.com/RudiFabricio8/muro-firmas-hackathon.git
    cd muro-firmas-hackathon
    ```

2.  **Iniciar los servicios**:
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
