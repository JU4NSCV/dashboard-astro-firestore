import { useState, useEffect, useMemo } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function DisparosDashboard() {
    const [usuariosConDisparos, setUsuariosConDisparos] = useState([]);
    const [loading, setLoading] = useState(true);

    // ── Estados de los filtros ──────────────────────────────────────────────
    const [filtroCarrera, setFiltroCarrera] = useState('');
    const [filtroPeriodo, setFiltroPeriodo] = useState('');
    const [filtroParalelo, setFiltroParalelo] = useState('');
    const [filtroModalidad, setFiltroModalidad] = useState('');

    // ── Fetch principal ─────────────────────────────────────────────────────
    useEffect(() => {
        const fetchDisparos = async () => {
            try {
                const usuariosSnapshot = await getDocs(collection(db, 'usuarios'));

                const dataFull = await Promise.all(
                    usuariosSnapshot.docs.map(async (userDoc) => {
                        const userData = userDoc.data();
                        const idUsuario = userDoc.id;

                        // Subcolección de disparos
                        const disparosRef = collection(db, 'usuarios', idUsuario, 'disparos');
                        const disparosSnap = await getDocs(disparosRef);

                        const disparos = disparosSnap.docs.map((doc) => ({
                            id: doc.id,
                            ...doc.data(),
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
                            disparos,
                            formulario,
                        };
                    })
                );

                setUsuariosConDisparos(dataFull);
            } catch (error) {
                console.error('Error cargando disparos:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDisparos();
    }, []);

    // ── Opciones dinámicas para los selects ─────────────────────────────────
    const opcionesCarrera = useMemo(
        () => [...new Set(usuariosConDisparos.map((u) => u.formulario?.carrera).filter(Boolean))].sort(),
        [usuariosConDisparos]
    );
    const opcionesPeriodo = useMemo(
        () => [...new Set(usuariosConDisparos.map((u) => u.formulario?.periodoAcademico).filter(Boolean))].sort(),
        [usuariosConDisparos]
    );
    const opcionesParalelo = useMemo(
        () => [...new Set(usuariosConDisparos.map((u) => u.formulario?.paralelo).filter(Boolean))].sort(),
        [usuariosConDisparos]
    );
    const opcionesModalidad = useMemo(
        () => [...new Set(usuariosConDisparos.map((u) => u.formulario?.modalidad).filter(Boolean))].sort(),
        [usuariosConDisparos]
    );

    // ── Lógica de filtrado ──────────────────────────────────────────────────
    const usuariosFiltrados = useMemo(() => {
        return usuariosConDisparos.filter((user) => {
            const f = user.formulario || {};
            if (filtroCarrera && f.carrera !== filtroCarrera) return false;
            if (filtroPeriodo && f.periodoAcademico !== filtroPeriodo) return false;
            if (filtroParalelo && f.paralelo !== filtroParalelo) return false;
            if (filtroModalidad && f.modalidad !== filtroModalidad) return false;
            return true;
        });
    }, [usuariosConDisparos, filtroCarrera, filtroPeriodo, filtroParalelo, filtroModalidad]);

    const hayFiltrosActivos = filtroCarrera || filtroPeriodo || filtroParalelo || filtroModalidad;
    const totalDisparosGlobales = usuariosFiltrados.reduce((acc, curr) => acc + curr.disparos.length, 0);

    // ── Clase base compartida para selects ──────────────────────────────────
    const selectClass =
        'w-full bg-slate-900/50 border border-slate-700 text-slate-300 text-sm rounded-xl px-3 py-2.5 ' +
        'backdrop-blur focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 ' +
        'transition-all duration-200 cursor-pointer appearance-none';

    // ── Loading state ───────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
                <p className="text-slate-400 mt-4 animate-pulse">Cargando registros de balística...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* ── Encabezado Principal ───────────────────────────────────── */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-green-400">
                        Registro de Disparos
                    </h1>
                    <p className="text-slate-400 mt-2 text-lg">Consulta las métricas y la precisión de los tiros de cada estudiante</p>
                </div>

                <div className="relative z-10 flex items-center gap-3 bg-slate-900/50 py-2 px-4 rounded-full border border-slate-700/50">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                    <span className="text-sm font-medium text-slate-300">
                        {hayFiltrosActivos
                            ? `${totalDisparosGlobales} disparos · ${usuariosFiltrados.length}/${usuariosConDisparos.length} usuarios`
                            : `${totalDisparosGlobales} Disparos Globales`}
                    </span>
                </div>
            </header>

            {/* ── Barra de Filtros ───────────────────────────────────────── */}
            <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 backdrop-blur-sm p-5 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        {/* Icono filtro */}
                        <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                            className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 px-3 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20"
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
                        <div key={user.idUsuario} className="bg-slate-800/40 rounded-3xl border border-slate-700/50 shadow-2xl backdrop-blur-sm overflow-hidden hover:border-cyan-500/30 transition-all duration-500 group">

                            {/* Header de Tarjeta */}
                            <div className="bg-gradient-to-r from-slate-900/80 to-slate-800/80 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-700/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-cyan-500/20 transform group-hover:scale-105 transition-transform duration-300">
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
                                    <span className="text-sm text-slate-400">Total de Disparos</span>
                                    <span className="text-2xl font-bold text-white">{user.disparos.length}</span>
                                </div>
                            </div>

                            {/* Tabla */}
                            <div className="p-6">
                                {user.disparos.length > 0 ? (
                                    <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 overflow-hidden overflow-x-auto">
                                        <table className="w-full text-left text-sm whitespace-nowrap">
                                            <thead className="bg-slate-800/80 text-slate-300 border-b border-slate-700">
                                                <tr>
                                                    <th className="px-6 py-4 font-semibold">#</th>
                                                    <th className="px-6 py-4 font-semibold">Ángulo</th>
                                                    <th className="px-6 py-4 font-semibold">Distancia</th>
                                                    <th className="px-6 py-4 font-semibold">Altura Máx.</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-700/50">
                                                {user.disparos.map((disparo, index) => (
                                                    <tr key={disparo.id} className="hover:bg-white/5 transition-colors">
                                                        <td className="px-6 py-4 text-slate-400">{index + 1}</td>
                                                        <td className="px-6 py-4">
                                                            <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                                                {Number(disparo.angulo || 0).toFixed(1)}°
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
                                                                {Number(disparo.distancia || 0).toFixed(2)} m
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                                                {Number(disparo.altura || 0).toFixed(2)} m
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-10 bg-slate-900/30 rounded-2xl border border-dashed border-slate-700">
                                        <p className="text-slate-500">Sin datos de disparos</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}