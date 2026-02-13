import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Dashboard de Reportes E-Commerce',
    description: 'Análisis de ventas con Next.js y PostgreSQL Views',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es">
            <body className={inter.className}>
                <div className="flex h-screen bg-gray-50">
                    {/* Sidebar */}
                    <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
                        <div className="p-6 border-b border-gray-100">
                            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
                                <span>Analytics</span>
                            </Link>
                        </div>

                        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                            <NavItem href="/" label="Dashboard Principal" />

                            <div className="pt-4 pb-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Reportes
                            </div>

                            <NavItem href="/reports/sales-category" label="Ventas por Categoría" />
                            <NavItem href="/reports/top-products" label="Productos Top" />
                            <NavItem href="/reports/customer-summary" label="Clientes VIP" />
                            <NavItem href="/reports/order-status" label="Status Órdenes" />
                            <NavItem href="/reports/daily-sales" label="Ventas Diarias" />
                        </nav>

                        <div className="p-4 border-t border-gray-100 text-xs text-center text-gray-400">
                            v1.0.0 • Lab Report
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 flex flex-col overflow-hidden">
                        {/* Mobile Header */}
                        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                            <span className="font-bold text-lg text-blue-600">Analytics</span>
                        </header>

                        <div className="flex-1 overflow-auto p-6 md:p-8">
                            {children}
                        </div>
                    </main>
                </div>
            </body>
        </html>
    );
}

function NavItem({ href, label }: { href: string; label: string }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors"
        >
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
            {label}
        </Link>
    );
}
