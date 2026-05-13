import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function TestsDashboard() {
    const [listaUsuarios, setListaUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTests = async () => {
            try {
                const usuariosSnapshot = await getDocs(collection(db, "usuarios"));
                const data = usuariosSnapshot.docs.map(doc => {
                    const userData = doc.data();
                    const idUsuario = doc.id;

                    const infoUltimoTest = userData.ultimoTest || {};
                    const mapaDeExamenes = infoUltimoTest.tests || {};

                    const testsFiltrados = Object.entries(mapaDeExamenes)
                        .filter(([key, value]) => key.startsWith('test') && typeof value === 'object')
                        .map(([key, value]) => ({
                            nombreTest: key.replace('test', 'Test '),
                            aciertos: value.aciertos ?? 0,
                            errores: value.errores ?? 0,
                            completado: value.completado ?? false
                        }));

                    return { idUsuario, tests: testsFiltrados };
                });
                setListaUsuarios(data);
            } catch (error) {
                console.error("Error al obtener tests:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTests();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="text-slate-400 mt-4 animate-pulse">Analizando progreso de estudiantes...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {/* Encabezado */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-teal-300">
                        Panel de Usuarios
                    </h1>
                    <p className="text-slate-400 mt-2 text-lg">Supervisa el progreso y rendimiento de todos los estudiantes</p>
                </div>
                <div className="relative z-10 flex items-center gap-3 bg-slate-900/50 py-2 px-4 rounded-full border border-slate-700/50">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-sm font-medium text-slate-300">{listaUsuarios.length} Usuarios Registrados</span>
                </div>
            </header>

            {/* Lista de Usuarios */}
            <div className="grid grid-cols-1 gap-8">
                {listaUsuarios.map((user) => (
                    <div key={user.idUsuario} className="bg-slate-800/40 rounded-3xl border border-slate-700/50 shadow-2xl backdrop-blur-sm overflow-hidden hover:border-indigo-500/30 transition-all duration-500 group">

                        <div className="bg-gradient-to-r from-slate-900/80 to-slate-800/80 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-700/50">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-indigo-500/20">
                                    {user.idUsuario.charAt(0).toUpperCase()}
                                </div>
                                <h2 className="text-white font-bold text-xl">{user.idUsuario}</h2>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-sm text-slate-400">Tests Completados</span>
                                <span className="text-2xl font-bold text-white">
                                    {user.tests.filter(t => t.completado).length} <span className="text-slate-500 text-lg">/ {user.tests.length}</span>
                                </span>
                            </div>
                        </div>

                        <div className="p-6">
                            {user.tests.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
                                    {user.tests.map((t, idx) => {
                                        const total = t.aciertos + t.errores;
                                        const porcentaje = total > 0 ? (t.aciertos / total) * 100 : 0;

                                        return (
                                            <div key={idx} className="relative bg-slate-900/60 rounded-2xl p-5 border border-slate-700/50 hover:bg-slate-800/80 transition-all duration-300">
                                                <div className="flex justify-between items-start mb-4">
                                                    <span className="text-sm font-bold text-slate-300">{t.nombreTest}</span>
                                                    <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${t.completado ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                                        {t.completado ? 'Finalizado' : 'Progreso'}
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-xs text-green-400">
                                                        <span>Aciertos</span>
                                                        <span className="font-bold">{t.aciertos}</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs text-red-400">
                                                        <span>Errores</span>
                                                        <span className="font-bold">{t.errores}</span>
                                                    </div>
                                                </div>

                                                <div className="mt-4 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className={`h-full transition-all duration-1000 ${t.completado ? 'bg-green-500' : 'bg-amber-500'}`}
                                                        style={{ width: `${t.completado ? 100 : Math.max(10, porcentaje)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-center text-slate-500 py-4">Sin datos de tests</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}