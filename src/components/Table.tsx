// Componente de Tabla Reutilizable
export function Table({ headers, rows }: { headers: string[], rows: (string | number | React.ReactNode)[][] }) {
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
