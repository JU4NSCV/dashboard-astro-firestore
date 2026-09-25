import { useEffect, useState } from 'react';
import LogoutButton from './LogoutButton';

const NAV_ITEMS = [
    { name: 'Estadísticas', path: '/admin/stats' },
    { name: 'Tests', path: '/admin/tests' },
    { name: 'Disparos', path: '/admin/disparos' },
];

const linkClass = (isActive) =>
    `px-4 py-2 rounded-xl text-sm font-semibold transition-colors duration-300 flex items-center gap-2 border ${
        isActive
            ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
            : 'text-slate-300 hover:text-white hover:bg-white/5 border-transparent'
    }`;

/** La autenticación la decide el servidor (middleware) y llega como prop: sin parpadeos. */
export default function NavMenu({ currentPath, isAuthenticated }) {
    const [abierto, setAbierto] = useState(false);

    useEffect(() => {
        if (!abierto) return;
        const onKey = (e) => e.key === 'Escape' && setAbierto(false);
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [abierto]);

    if (!isAuthenticated) {
        if (currentPath.startsWith('/login')) return null;
        return (
            <a
                href="/login"
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-cyan-500/30 transition-shadow"
            >
                Acceso docente
            </a>
        );
    }

    const enlaces = NAV_ITEMS.map((item) => {
        const isActive = currentPath === item.path || currentPath.startsWith(`${item.path}/`);
        return (
            <a key={item.path} href={item.path} className={linkClass(isActive)} aria-current={isActive ? 'page' : undefined}>
                {item.name}
            </a>
        );
    });

    return (
        <nav aria-label="Panel de administración">
            {/* Escritorio */}
            <div className="hidden md:flex items-center gap-2">
                {enlaces}
                <div className="ml-2 pl-4 border-l border-white/10">
                    <LogoutButton />
                </div>
            </div>

            {/* Móvil */}
            <button
                type="button"
                className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 border border-white/10"
                aria-expanded={abierto}
                aria-controls="menu-movil"
                aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
                onClick={() => setAbierto((v) => !v)}
            >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    {abierto ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                </svg>
            </button>
            {abierto && (
                <div id="menu-movil" className="md:hidden absolute left-0 right-0 top-full bg-[#0b0f19] border-b border-white/10 px-4 py-4 flex flex-col gap-2 shadow-2xl">
                    {enlaces}
                    <div className="pt-3 mt-1 border-t border-white/10">
                        <LogoutButton />
                    </div>
                </div>
            )}
        </nav>
    );
}
