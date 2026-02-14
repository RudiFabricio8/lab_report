import Link from 'next/link';
import { getVentasPorCategoria } from '@/lib/queries';
import { Table } from '@/components/Table';

export const dynamic = 'force-dynamic';

export default async function SalesCategoryPage() {
    const data = await getVentasPorCategoria();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Ventas por Categoría</h1>
                <Link href="/" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    ← Volver al Dashboard
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <Table
                    headers={['Categoría', 'Total Órdenes', 'Monto Total', '% del Total']}
                    rows={data.map(row => [
                        row.categoria,
                        row.total_ordenes,
                        `$${Number(row.monto_total).toFixed(2)}`,
                        `${row.pct_del_total}%`
                    ])}
                />
            </div>
        </div>
    );
}
