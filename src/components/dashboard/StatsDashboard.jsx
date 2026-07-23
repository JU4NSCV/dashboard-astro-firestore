import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function StatsDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAndProcessData = async () => {
            try {
                const usuariosSnapshot = await getDocs(collection(db, "usuarios"));

                const tempStats = {
                    total: usuariosSnapshot.size,
                    aprobados: 0,
                    enProgreso: 0,
                    reprobados: 0,
                    porFecha: {},
                };

                usuariosSnapshot.forEach((doc) => {
                    const data = doc.data();

                    // A. Procesar Fecha
                    if (data.actualizadoEn) {
                        const fecha = data.actualizadoEn.toDate().toISOString().split("T")[0];
                        tempStats.porFecha[fecha] = (tempStats.porFecha[fecha] || 0) + 1;
                    }

                    // B. Procesar Rendimiento
                    const mapaDeExamenes = data.ultimoTest?.tests || {};
                    const tests = Object.values(mapaDeExamenes);

                    const testsPasados = tests.filter(
                        (t) => t.completado && t.aciertos > t.errores
                    ).length;

                    if (testsPasados >= 4) {
                        tempStats.aprobados++;
                    } else if (testsPasados >= 1) {
                        tempStats.enProgreso++;
                    } else {
                        tempStats.reprobados++;
                    }
                });

                setStats(tempStats);
            } catch (error) {
                console.error("Error cargando estadísticas:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAndProcessData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="text-slate-400 animate-pulse">Cargando datos del sistema...</p>
            </div>
        );
    }

    if (!stats) return <div className="text-white">Error al cargar datos.</div>;

    const fechasOrdenadas = Object.entries(stats.porFecha).sort(
        (a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()
    );

    // Helpers para porcentajes
    const getPerc = (val) => stats.total > 0 ? Math.round((val / stats.total) * 100) : 0;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Grid de Tarjetas Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Usuarios */}
                <div className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50 backdrop-blur-md">
                    <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Total Usuarios</p>
                    <div className="flex items-end justify-between mt-2">
                        <span className="text-4xl font-bold text-white">{stats.total}</span>
                        <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Aprobados */}
                <div className="bg-slate-800/40 p-6 rounded-3xl border border-green-500/20 backdrop-blur-md">
                    <p className="text-green-400/80 text-sm font-semibold uppercase tracking-wider">Aprobación (4+ tests)</p>
                    <div className="flex items-end justify-between mt-2">
                        <span className="text-4xl font-bold text-white">{stats.aprobados}</span>
                        <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* En Progreso */}
                <div className="bg-slate-800/40 p-6 rounded-3xl border border-amber-500/20 backdrop-blur-md">
                    <p className="text-amber-400/80 text-sm font-semibold uppercase tracking-wider">En Progreso (1-3 tests)</p>
                    <div className="flex items-end justify-between mt-2">
                        <span className="text-4xl font-bold text-white">{stats.enProgreso}</span>
                        <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Críticos */}
                <div className="bg-slate-800/40 p-6 rounded-3xl border border-red-500/20 backdrop-blur-md">
                    <p className="text-red-400/80 text-sm font-semibold uppercase tracking-wider">Críticos (0 tests)</p>
                    <div className="flex items-end justify-between mt-2">
                        <span className="text-4xl font-bold text-white">{stats.reprobados}</span>
                        <div className="p-2 bg-red-500/20 rounded-lg text-red-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Segunda Fila: Lista y Gráficas de Progreso */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Lista de Usuarios por Fecha */}
                <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-700/50 shadow-xl">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Usuarios por Fecha
                    </h3>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {fechasOrdenadas.map(([fecha, cantidad]) => (
                            <div key={fecha} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                <span className="text-slate-300 font-medium">
                                    {new Date(fecha).toLocaleDateString("es-ES", {
                                        day: "numeric", month: "long", year: "numeric"
                                    })}
                                </span>
                                <span className="px-4 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-sm font-bold">
                                    {cantidad} {cantidad === 1 ? "usuario" : "usuarios"}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Visualización de Barras de Rendimiento */}
                <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-700/50 shadow-xl flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-6">Visualización de Rendimiento</h3>

                    <div className="flex-1 flex flex-col justify-center space-y-8">
                        {/* Barra Aprobados */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-green-400 font-bold">Aprobados (Mayoría/Todo)</span>
                                <span className="text-white">{getPerc(stats.aprobados)}%</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-4">
                                <div
                                    className="bg-green-500 h-4 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all duration-1000"
                                    style={{ width: `${getPerc(stats.aprobados)}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Barra En Progreso */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-amber-400 font-bold">En Progreso</span>
                                <span className="text-white">{getPerc(stats.enProgreso)}%</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-4">
                                <div
                                    className="bg-amber-500 h-4 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all duration-1000"
                                    style={{ width: `${getPerc(stats.enProgreso)}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Barra Reprobados */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-red-400 font-bold">Reprobados / Sin actividad</span>
                                <span className="text-white">{getPerc(stats.reprobados)}%</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-4">
                                <div
                                    className="bg-red-500 h-4 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all duration-1000"
                                    style={{ width: `${getPerc(stats.reprobados)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}