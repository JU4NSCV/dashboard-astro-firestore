import { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import LogoutButton from './LogoutButton'; // Asegúrate de importar tu componente

export default function NavMenu({ currentPath }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const navItems = [
        { name: "Tests", path: "/admin/tests" },
        { name: "Disparos", path: "/admin/disparos" },
        { name: "Stats", path: "/admin/stats" },
    ];

    if (loading) return <div className="w-10"></div>;

    return (
        <nav className="flex items-center space-x-2 md:space-x-4">
            {user ? (
                /* Usamos un fragmento para agrupar el MAP y el Botón */
                <>
                    {navItems.map((item) => {
                        const isActive = currentPath === item.path ||
                            (item.path !== "/" && currentPath.startsWith(item.path));

                        return (
                            <a
                                key={item.path}
                                href={item.path}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${isActive
                                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]"
                                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
                                    }`}
                            >
                                {item.name}
                            </a>
                        );
                    })}

                    {/* El botón de logout va aquí, al final de la lista */}
                    <div className="ml-2 pl-2 border-l border-white/10">
                        <LogoutButton />
                    </div>
                </>
            ) : (
                <a href="/login" className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-cyan-500/30 transition-all">
                    Entrar
                </a>
            )}
        </nav>
    );
}