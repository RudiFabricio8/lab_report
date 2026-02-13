import Link from 'next/link';
import { getResumenDiario, getOrdenesPorStatus } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function Home() {
    // Obtener datos iniciales para KPIs
    // Usamos un rango amplio o sin rango para obtener métricas generales
    const resumenDiario = await getResumenDiario();
    const ordenesStatus = await getOrdenesPorStatus();

    // Calcular KPIs simples
    const totalIngresos = resumenDiario.reduce((acc, dia) => acc + Number(dia.ingreso_del_dia), 0);
    const totalOrdenes = resumenDiario.reduce((acc, dia) => acc + Number(dia.ordenes_del_dia), 0);

    // Encontrar estado con más órdenes
    const topStatus = ordenesStatus.length > 0 ? ordenesStatus[0].status_label : 'N/A';

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
                    value={`$${totalIngresos.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                    icon="💰"
                    color="bg-green-50 text-green-700"
                />
                <KpiCard
                    title="Total Órdenes"
                    value={totalOrdenes.toLocaleString()}
                    icon="📦"
                    color="bg-blue-50 text-blue-700"
                />
                <KpiCard
                    title="Estado Principal"
                    value={topStatus}
                    icon="📊"
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
                        icon="🛍️"
                    />
                    <ReportCard
                        href="/reports/top-products"
                        title="Productos Más Vendidos"
                        description="Ranking de productos top con detalles de stock e ingresos."
                        icon="🏆"
                    />
                    <ReportCard
                        href="/reports/customer-summary"
                        title="Resumen de Clientes"
                        description="Identifica a tus mejores clientes (VIP) y sus hábitos de compra."
                        icon="👥"
                    />
                    <ReportCard
                        href="/reports/order-status"
                        title="Estado de Órdenes"
                        description="Monitorea el flujo de pedidos desde pendiente hasta entregado."
                        icon="🚚"
                    />
                    <ReportCard
                        href="/reports/daily-sales"
                        title="Ventas Diarias"
                        description="Seguimiento de ingresos día a día con acumulados."
                        icon="📅"
                    />
                </div>
            </div>
        </div>
    );
}

function KpiCard({ title, value, icon, color }: { title: string, value: string, icon: string, color: string }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`p-4 rounded-lg ${color} text-2xl`}>
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
}

function ReportCard({ href, title, description, icon }: { href: string, title: string, description: string, icon: string }) {
    return (
        <Link href={href} className="group block bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all">
            <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors text-2xl">
                    {icon}
                </div>
                <span className="text-gray-400 group-hover:text-blue-500 transition-colors">↗</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{title}</h3>
            <p className="text-gray-500 mt-2 text-sm leading-relaxed">{description}</p>
        </Link>
    );
}
