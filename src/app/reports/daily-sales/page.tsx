import Link from 'next/link';
import { getResumenDiario } from '@/lib/queries';
import { dateRangeSchema } from '@/lib/schemas';
import { Table } from '@/components/Table';

export const dynamic = 'force-dynamic';

interface DailySalesPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DailySalesPage(props: DailySalesPageProps) {
    const searchParams = await props.searchParams;
    
    const parsed = dateRangeSchema.safeParse(searchParams);
    const { startDate, endDate } = parsed.success ? parsed.data : {};
    const data = await getResumenDiario(startDate, endDate);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Ventas Diarias</h1>
                <Link href="/" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    ← Volver al Dashboard
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="space-y-4">
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
            </div>
        </div>
    );
}
