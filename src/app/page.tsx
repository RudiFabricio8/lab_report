import Link from 'next/link';
import { getDashboardKPIs } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function Home() {
    // Obtener KPIs pre-calculados desde el backend
    const kpis = await getDashboardKPIs();

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard de Ventas</h1>
                <p className="text-gray-500 mt-2">Visión general del rendimiento del E-Commerce</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KpiCard
                    title="Ingresos Totales"
                    value={`$${Number(kpis.total_ingresos).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                    color="bg-green-50 text-green-700"
                />
                <KpiCard
                    title="Total Órdenes"
                    value={Number(kpis.total_ordenes).toLocaleString()}
                    color="bg-blue-50 text-blue-700"
                />
                <KpiCard
                    title="Estado Principal"
                    value={kpis.top_status || 'N/A'}
                    color="bg-purple-50 text-purple-700"
                />
            </div>

            {/* Report Links Grid */}
            <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Reportes Disponibles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ReportCard
                        href="/reports/sales-category"
                        title="Ventas por Categoría"
                        description="Analiza cuáles categorías generan más ingresos y volumen de ventas."
                    />
                    <ReportCard
                        href="/reports/top-products"
                        title="Productos Más Vendidos"
                        description="Ranking de productos top con detalles de stock e ingresos."
                    />
                    <ReportCard
                        href="/reports/customer-summary"
                        title="Resumen de Clientes"
                        description="Identifica a tus mejores clientes (VIP) y sus hábitos de compra."
                    />
                    <ReportCard
                        href="/reports/order-status"
                        title="Estado de Órdenes"
                        description="Monitorea el flujo de pedidos desde pendiente hasta entregado."
                    />
                    <ReportCard
                        href="/reports/daily-sales"
                        title="Ventas Diarias"
                        description="Seguimiento de ingresos día a día con acumulados."
                    />
                </div>
            </div>
        </div>
    );
}

function KpiCard({ title, value, color }: { title: string, value: string, color: string }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`p-4 rounded-lg ${color} text-xl font-bold`}>
                $
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
}

function ReportCard({ href, title, description }: { href: string, title: string, description: string }) {
    return (
        <Link href={href} className="group block bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all">
            <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                    <div className="w-6 h-6 bg-gray-200 rounded-sm group-hover:bg-blue-200 transition-colors"></div>
                </div>
                <span className="text-gray-400 group-hover:text-blue-500 transition-colors">↗</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{title}</h3>
            <p className="text-gray-500 mt-2 text-sm leading-relaxed">{description}</p>
        </Link>
    );
}

