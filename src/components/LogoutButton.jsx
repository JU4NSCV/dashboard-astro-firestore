import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

export default function LogoutButton() {
    const handleLogout = async () => {
        try {
            await signOut(auth);
            // Redirigir al login o inicio después de cerrar sesión
            window.location.href = '/login';
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    return (
        <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-red-400 hover:text-white hover:bg-red-500/20 border border-red-500/20 transition-all duration-300 group"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar Sesión
        </button>
    );
}