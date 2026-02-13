import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
    getVentasPorCategoria,
    getProductosMasVendidos,
    getUsuariosConCompras,
    getOrdenesPorStatus,
    getResumenDiario
} from '@/lib/queries';
import {
    searchSchema,
    dateRangeSchema,
    topProductsSchema,
    reportIdSchema
} from '@/lib/schemas';

// Forzamos renderizado dinámico para evitar caché estático con datos viejos
export const dynamic = 'force-dynamic';

interface ReportProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ReportPage(props: ReportProps) {
    const params = await props.params;
    const searchParams = await props.searchParams;

    // Validar ID del reporte
    const reportIdResult = reportIdSchema.safeParse({ id: params.id });
    if (!reportIdResult.success) {
        notFound();
    }

    const reportId = reportIdResult.data.id;

    // Renderizar contenido según el ID
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">{getReportTitle(reportId)}</h1>
                <Link href="/" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    ← Volver al Dashboard
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {await renderReportContent(reportId, searchParams)}
            </div>
        </div>
    );
}

// Helper para títulos
function getReportTitle(id: string) {
    switch (id) {
        case 'sales-category': return 'Ventas por Categoría';
        case 'top-products': return 'Productos Más Vendidos';
        case 'customer-summary': return 'Resumen de Clientes';
        case 'order-status': return 'Estado de Órdenes';
        case 'daily-sales': return 'Ventas Diarias';
        default: return 'Reporte';
    }
}

// Renderizado condicional del contenido
async function renderReportContent(id: string, sp: any) {
    switch (id) {
        case 'sales-category': {
            const data = await getVentasPorCategoria();
            return (
                <Table
                    headers={['Categoría', 'Total Órdenes', 'Monto Total', '% del Total']}
                    rows={data.map(row => [
                        row.categoria,
                        row.total_ordenes,
                        `$${Number(row.monto_total).toFixed(2)}`,
                        `${row.pct_del_total}%`
                    ])}
                />
            );
        }

        case 'top-products': {
            const parsed = topProductsSchema.safeParse(sp);
            const limit = parsed.success ? parsed.data.limit : 10;
            const data = await getProductosMasVendidos(limit);
            return (
                <div className="space-y-4">
                    <div className="p-4 bg-gray-50 border-b border-gray-100 flex gap-4 items-center">
                        <span className="text-sm font-medium text-gray-600">Top:</span>
                        <Link href="?limit=5" className="text-xs bg-white border px-2 py-1 rounded hover:bg-gray-100">5</Link>
                        <Link href="?limit=10" className="text-xs bg-white border px-2 py-1 rounded hover:bg-gray-100">10</Link>
                        <Link href="?limit=20" className="text-xs bg-white border px-2 py-1 rounded hover:bg-gray-100">20</Link>
                    </div>
                    <Table
                        headers={['Ranking', 'Producto', 'Categoría', 'U. Vendidas', 'Ingresos', 'Stock', 'Precio']}
                        rows={data.map(row => [
                            `#${row.ranking}`,
                            row.producto,
                            row.categoria,
                            row.unidades_vendidas,
                            `$${Number(row.ingresos_totales).toFixed(2)}`,
                            row.stock_actual,
                            `$${Number(row.precio_actual).toFixed(2)}`
                        ])}
                    />
                </div>
            );
        }

        case 'customer-summary': {
            const parsed = searchSchema.safeParse(sp);
            const params = parsed.success ? parsed.data : { page: 1, limit: 10 };
            const data = await getUsuariosConCompras(params);

            return (
                <div className="space-y-4">
                    <div className="p-4 bg-gray-50 border-b border-gray-100">
                        <form className="flex gap-2">
                            <input
                                name="query"
                                placeholder="Buscar cliente..."
                                defaultValue={params.query}
                                className="border rounded px-3 py-1 text-sm w-full max-w-xs"
                            />
                            <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">Buscar</button>
                        </form>
                    </div>
                    <Table
                        headers={['Cliente', 'Email', 'Nivel', 'Total Órdenes', 'Gasto Total', 'Promedio']}
                        rows={data.map(row => [
                            row.nombre,
                            row.email,
                            <span key={row.usuario_id} className={`px-2 py-0.5 rounded text-xs font-bold ${row.nivel_cliente === 'VIP' ? 'bg-purple-100 text-purple-700' :
                                    row.nivel_cliente === 'Frecuente' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                }`}>{row.nivel_cliente}</span>,
                            row.total_ordenes,
                            `$${Number(row.gasto_total).toFixed(2)}`,
                            `$${Number(row.gasto_promedio).toFixed(2)}`
                        ])}
                    />
                    {/* Paginación simple */}
                    <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-sm">
                        <Link href={`?page=${Math.max(1, params.page - 1)}&limit=${params.limit}${params.query ? `&query=${params.query}` : ''}`}
                            className={`px-3 py-1 border rounded bg-white ${params.page <= 1 ? 'opacity-50 pointer-events-none' : 'hover:bg-gray-100'}`}>
                            Anterior
                        </Link>
                        <span>Página {params.page}</span>
                        <Link href={`?page=${params.page + 1}&limit=${params.limit}${params.query ? `&query=${params.query}` : ''}`}
                            className="px-3 py-1 border rounded bg-white hover:bg-gray-100">
                            Siguiente
                        </Link>
                    </div>
                </div>
            );
        }

        case 'order-status': {
            const data = await getOrdenesPorStatus();
            return (
                <Table
                    headers={['Estado', 'Cantidad', 'Monto Total', 'Ticket Promedio', '% del Total']}
                    rows={data.map(row => [
                        <span key={row.status} className="font-medium">{row.status_label}</span>,
                        row.cantidad,
                        `$${Number(row.monto_total).toFixed(2)}`,
                        `$${Number(row.monto_promedio).toFixed(2)}`,
                        `${row.pct_del_total}%`
                    ])}
                />
            );
        }

        case 'daily-sales': {
            const parsed = dateRangeSchema.safeParse(sp);
            const { startDate, endDate } = parsed.success ? parsed.data : {};
            const data = await getResumenDiario(startDate, endDate);

            return (
                <div className="space-y-4">
                    {/* Date Filter Form could go here */}
                    <Table
                        headers={['Fecha', 'Órdenes', 'Ingreso Diario', 'Ingreso Acumulado']}
                        rows={data.map(row => {
                            const date = new Date(row.fecha).toLocaleDateString();
                            return [
                                date,
                                row.ordenes_del_dia,
                                `$${Number(row.ingreso_del_dia).toFixed(2)}`,
                                `$${Number(row.ingreso_acumulado).toFixed(2)}`
                            ];
                        })}
                    />
                </div>
            );
        }

        default: return null;
    }
}

// Componente de Tabla Reutilizable
function Table({ headers, rows }: { headers: string[], rows: (string | number | React.ReactNode)[][] }) {
    if (rows.length === 0) {
        return <div className="p-8 text-center text-gray-500">No se encontraron datos.</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
                    <tr>
                        {headers.map((h, i) => (
                            <th key={i} className="px-6 py-3 border-b border-gray-100">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {rows.map((row, i) => (
                        <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                            {row.map((cell, j) => (
                                <td key={j} className="px-6 py-3 text-sm text-gray-700 whitespace-nowrap">
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
