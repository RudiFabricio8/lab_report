import Link from 'next/link';
import { getOrdenesPorStatus } from '@/lib/queries';
import { Table } from '@/components/Table';

export const dynamic = 'force-dynamic';

export default async function OrderStatusPage() {
    const data = await getOrdenesPorStatus();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Estado de Órdenes</h1>
                <Link href="/" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    ← Volver al Dashboard
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
            </div>
        </div>
    );
}
