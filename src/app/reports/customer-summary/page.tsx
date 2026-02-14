import Link from 'next/link';
import { getUsuariosConCompras } from '@/lib/queries';
import { searchSchema } from '@/lib/schemas';
import { Table } from '@/components/Table';

export const dynamic = 'force-dynamic';

interface CustomerSummaryPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CustomerSummaryPage(props: CustomerSummaryPageProps) {
    const searchParams = await props.searchParams;
    
    const parsed = searchSchema.safeParse(searchParams);
    const params = parsed.success ? parsed.data : { page: 1, limit: 10 };
    const data = await getUsuariosConCompras(params);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Resumen de Clientes</h1>
                <Link href="/" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    ← Volver al Dashboard
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="space-y-4">
                    <div className="p-4 bg-gray-50 border-b border-gray-100">
                        <form className="flex gap-2">
                            <input
                                name="query"
                                placeholder="Buscar cliente..."
                                defaultValue={params.query || ''}
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
                    {/* Paginación */}
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
            </div>
        </div>
    );
}
