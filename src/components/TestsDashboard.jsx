import { useState, useEffect, useMemo } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function TestsDashboard() {
    const [listaUsuarios, setListaUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);

    // ── Estados de los filtros ──────────────────────────────────────────────
    const [filtroCarrera, setFiltroCarrera] = useState('');
    const [filtroPeriodo, setFiltroPeriodo] = useState('');
    const [filtroParalelo, setFiltroParalelo] = useState('');
    const [filtroModalidad, setFiltroModalidad] = useState('');

    // ── Fetch principal ─────────────────────────────────────────────────────
    useEffect(() => {
        const fetchTests = async () => {
            try {
                const usuariosSnapshot = await getDocs(collection(db, 'usuarios'));

                const data = await Promise.all(
                    usuariosSnapshot.docs.map(async (doc) => {
                        const userData = doc.data();
                        const idUsuario = doc.id;

                        // Tests del usuario
                        const infoUltimoTest = userData.ultimoTest || {};
                        const mapaDeExamenes = infoUltimoTest.tests || {};

                        const testsFiltrados = Object.entries(mapaDeExamenes)
                            .filter(([key, value]) => key.startsWith('test') && typeof value === 'object')
                            .map(([key, value]) => ({
                                nombreTest: key.replace('test', 'Test '),
                                aciertos: value.aciertos ?? 0,
                                errores: value.errores ?? 0,
                                completado: value.completado ?? false,
                            }));

                        // Subcolección formulario
                        let formulario = null;
                        try {
                            const formularioRef = collection(db, 'usuarios', idUsuario, 'formulario');
                            const formularioSnap = await getDocs(formularioRef);
                            if (!formularioSnap.empty) {
                                formulario = formularioSnap.docs[0].data();
                            }
                        } catch (err) {
                            console.warn(`Sin formulario para usuario ${idUsuario}:`, err);
                        }

                        return {
                            idUsuario,
                            email: userData.email || 'Sin email',
                            tests: testsFiltrados,
                            formulario,
                        };
                    })
                );

                setListaUsuarios(data);
            } catch (error) {
                console.error('Error al obtener tests:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTests();
    }, []);

    // ── Opciones dinámicas para los selects ─────────────────────────────────
    const opcionesCarrera = useMemo(
        () => [...new Set(listaUsuarios.map((u) => u.formulario?.carrera).filter(Boolean))].sort(),
        [listaUsuarios]
    );
    const opcionesPeriodo = useMemo(
        () => [...new Set(listaUsuarios.map((u) => u.formulario?.periodoAcademico).filter(Boolean))].sort(),
        [listaUsuarios]
    );
    const opcionesParalelo = useMemo(
        () => [...new Set(listaUsuarios.map((u) => u.formulario?.paralelo).filter(Boolean))].sort(),
        [listaUsuarios]
    );
    const opcionesModalidad = useMemo(
        () => [...new Set(listaUsuarios.map((u) => u.formulario?.modalidad).filter(Boolean))].sort(),
        [listaUsuarios]
    );

    // ── Lógica de filtrado ──────────────────────────────────────────────────
    const usuariosFiltrados = useMemo(() => {
        return listaUsuarios.filter((user) => {
            const f = user.formulario || {};
            if (filtroCarrera && f.carrera !== filtroCarrera) return false;
            if (filtroPeriodo && f.periodoAcademico !== filtroPeriodo) return false;
            if (filtroParalelo && f.paralelo !== filtroParalelo) return false;
            if (filtroModalidad && f.modalidad !== filtroModalidad) return false;
            return true;
        });
    }, [listaUsuarios, filtroCarrera, filtroPeriodo, filtroParalelo, filtroModalidad]);

    const hayFiltrosActivos = filtroCarrera || filtroPeriodo || filtroParalelo || filtroModalidad;

    // ── Clase base compartida para selects ──────────────────────────────────
    const selectClass =
        'w-full bg-slate-900/50 border border-slate-700 text-slate-300 text-sm rounded-xl px-3 py-2.5 ' +
        'backdrop-blur focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 ' +
        'transition-all duration-200 cursor-pointer appearance-none';

    // ── Loading state ───────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="text-slate-400 mt-4 animate-pulse">Analizando progreso de estudiantes...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* ── Encabezado ─────────────────────────────────────────────── */}
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
                    <span className="text-sm font-medium text-slate-300">
                        {hayFiltrosActivos
                            ? `${usuariosFiltrados.length} de ${listaUsuarios.length} usuarios`
                            : `${listaUsuarios.length} Usuarios Registrados`}
                    </span>
                </div>
            </header>

            {/* ── Barra de Filtros ───────────────────────────────────────── */}
            <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 backdrop-blur-sm p-5 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        {/* Icono filtro */}
                        <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                        </svg>
                        <span className="text-sm font-semibold text-slate-300">Filtrar por</span>
                    </div>
                    {hayFiltrosActivos && (
                        <button
                            onClick={() => {
                                setFiltroCarrera('');
                                setFiltroPeriodo('');
                                setFiltroParalelo('');
                                setFiltroModalidad('');
                            }}
                            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Limpiar filtros
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Carrera */}
                    <div className="relative">
                        <label className="block text-xs font-medium text-slate-500 mb-1.5 pl-1">Carrera</label>
                        <div className="relative">
                            <select
                                value={filtroCarrera}
                                onChange={(e) => setFiltroCarrera(e.target.value)}
                                className={selectClass}
                            >
                                <option value="">Todas las carreras</option>
                                {opcionesCarrera.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Período Académico */}
                    <div className="relative">
                        <label className="block text-xs font-medium text-slate-500 mb-1.5 pl-1">Período Académico</label>
                        <div className="relative">
                            <select
                                value={filtroPeriodo}
                                onChange={(e) => setFiltroPeriodo(e.target.value)}
                                className={selectClass}
                            >
                                <option value="">Todos los períodos</option>
                                {opcionesPeriodo.map((p) => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Paralelo */}
                    <div className="relative">
                        <label className="block text-xs font-medium text-slate-500 mb-1.5 pl-1">Paralelo</label>
                        <div className="relative">
                            <select
                                value={filtroParalelo}
                                onChange={(e) => setFiltroParalelo(e.target.value)}
                                className={selectClass}
                            >
                                <option value="">Todos los paralelos</option>
                                {opcionesParalelo.map((p) => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Modalidad */}
                    <div className="relative">
                        <label className="block text-xs font-medium text-slate-500 mb-1.5 pl-1">Modalidad</label>
                        <div className="relative">
                            <select
                                value={filtroModalidad}
                                onChange={(e) => setFiltroModalidad(e.target.value)}
                                className={selectClass}
                            >
                                <option value="">Todas las modalidades</option>
                                {opcionesModalidad.map((m) => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chips de filtros activos */}
                {hayFiltrosActivos && (
                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-700/50">
                        {filtroCarrera && (
                            <span className="flex items-center gap-1.5 text-xs bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 px-3 py-1 rounded-full">
                                Carrera: {filtroCarrera}
                                <button onClick={() => setFiltroCarrera('')} className="hover:text-indigo-100 transition-colors">×</button>
                            </span>
                        )}
                        {filtroPeriodo && (
                            <span className="flex items-center gap-1.5 text-xs bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 px-3 py-1 rounded-full">
                                Período: {filtroPeriodo}
                                <button onClick={() => setFiltroPeriodo('')} className="hover:text-cyan-100 transition-colors">×</button>
                            </span>
                        )}
                        {filtroParalelo && (
                            <span className="flex items-center gap-1.5 text-xs bg-teal-500/15 text-teal-300 border border-teal-500/25 px-3 py-1 rounded-full">
                                Paralelo: {filtroParalelo}
                                <button onClick={() => setFiltroParalelo('')} className="hover:text-teal-100 transition-colors">×</button>
                            </span>
                        )}
                        {filtroModalidad && (
                            <span className="flex items-center gap-1.5 text-xs bg-purple-500/15 text-purple-300 border border-purple-500/25 px-3 py-1 rounded-full">
                                Modalidad: {filtroModalidad}
                                <button onClick={() => setFiltroModalidad('')} className="hover:text-purple-100 transition-colors">×</button>
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* ── Lista de Usuarios (filtrada) ───────────────────────────── */}
            {usuariosFiltrados.length === 0 ? (
                <div className="text-center py-20 bg-slate-800/20 rounded-3xl border border-dashed border-slate-700">
                    <svg className="w-12 h-12 text-slate-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-slate-400 font-medium">No se encontraron usuarios</p>
                    <p className="text-slate-600 text-sm mt-1">Intenta ajustar los filtros aplicados</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8">
                    {usuariosFiltrados.map((user) => (
                        <div key={user.idUsuario} className="bg-slate-800/40 rounded-3xl border border-slate-700/50 shadow-2xl backdrop-blur-sm overflow-hidden hover:border-indigo-500/30 transition-all duration-500 group">

                            <div className="bg-gradient-to-r from-slate-900/80 to-slate-800/80 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-700/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-indigo-500/20">
                                        {user.idUsuario.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className="text-white font-bold text-xl">{user.idUsuario}</h2>
                                        <p className="text-slate-400 text-sm">{user.email}</p>
                                        {/* Metadatos del formulario */}
                                        {user.formulario && (
                                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                {user.formulario.carrera && (
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                                        {user.formulario.carrera}
                                                    </span>
                                                )}
                                                {user.formulario.paralelo && (
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                                                        Paralelo {user.formulario.paralelo}
                                                    </span>
                                                )}
                                                {user.formulario.modalidad && (
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                                        {user.formulario.modalidad}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-sm text-slate-400">Tests Completados</span>
                                    <span className="text-2xl font-bold text-white">
                                        {user.tests.filter((t) => t.completado).length}{' '}
                                        <span className="text-slate-500 text-lg">/ {user.tests.length}</span>
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
            )}
        </div>
    );
}