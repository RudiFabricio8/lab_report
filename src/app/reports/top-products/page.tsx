import Link from 'next/link';
import { getProductosMasVendidos } from '@/lib/queries';
import { topProductsSchema } from '@/lib/schemas';
import { Table } from '@/components/Table';

export const dynamic = 'force-dynamic';

interface TopProductsPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function TopProductsPage(props: TopProductsPageProps) {
    const searchParams = await props.searchParams;
    
    const parsed = topProductsSchema.safeParse(searchParams);
    const limit = parsed.success ? parsed.data.limit : 10;
    const data = await getProductosMasVendidos(limit);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Productos Más Vendidos</h1>
                <Link href="/" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    ← Volver al Dashboard
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
            </div>
        </div>
    );
}
