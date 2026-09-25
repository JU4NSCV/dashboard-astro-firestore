import { useMemo } from 'react';
import { TESTS_PARA_APROBAR, claveFechaLocal } from '../../lib/usuarios.js';
import { useFiltros, useUsuarios } from './hooks.js';
import { EmptyState, ErrorState, FiltrosBar, LoadingState, PageHeader } from './ui.jsx';

function calcularStats(usuarios) {
    const stats = { total: usuarios.length, aprobados: 0, enProgreso: 0, sinAprobar: 0, sinActividad: 0, porFecha: new Map(), porTest: new Map() };

    for (const u of usuarios) {
        if (u.actualizadoEn) {
            const clave = claveFechaLocal(u.actualizadoEn);
            stats.porFecha.set(clave, (stats.porFecha.get(clave) ?? 0) + 1);
        }

        if (u.tests.length === 0) stats.sinActividad++;
        if (u.testsAprobados >= TESTS_PARA_APROBAR) stats.aprobados++;
        else if (u.testsAprobados >= 1) stats.enProgreso++;
        else stats.sinAprobar++;

        for (const t of u.tests) {
            const acc = stats.porTest.get(t.numero) ?? { nombre: t.nombre, numero: t.numero, aciertos: 0, errores: 0, aprobados: 0, intentos: 0 };
            acc.aciertos += t.aciertos;
            acc.errores += t.errores;
            acc.intentos++;
            if (t.aprobado) acc.aprobados++;
            stats.porTest.set(t.numero, acc);
        }
    }

    stats.fechas = [...stats.porFecha.entries()].sort((a, b) => b[0].localeCompare(a[0]));
    stats.tests = [...stats.porTest.values()].sort((a, b) => a.numero - b.numero);
    return stats;
}

const porcentaje = (valor, total) => (total > 0 ? Math.round((valor / total) * 100) : 0);

function TarjetaKpi({ etiqueta, valor, detalle, color, icono }) {
    const colores = {
        slate: { borde: 'border-slate-700/50', texto: 'text-slate-400', icono: 'bg-indigo-500/20 text-indigo-400' },
        green: { borde: 'border-green-500/20', texto: 'text-green-400', icono: 'bg-green-500/20 text-green-400' },
        amber: { borde: 'border-amber-500/20', texto: 'text-amber-400', icono: 'bg-amber-500/20 text-amber-400' },
        red: { borde: 'border-red-500/20', texto: 'text-red-400', icono: 'bg-red-500/20 text-red-400' },
    }[color];
    return (
        <div className={`bg-slate-800/40 p-6 rounded-3xl border ${colores.borde}`}>
            <p className={`${colores.texto} text-sm font-semibold uppercase tracking-wider`}>{etiqueta}</p>
            <div className="flex items-end justify-between mt-2">
                <span className="text-4xl font-bold text-white tabular-nums">{valor}</span>
                <div className={`p-2 rounded-lg ${colores.icono}`} aria-hidden="true">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icono} />
                    </svg>
                </div>
            </div>
            {detalle && <p className="text-xs text-slate-400 mt-2">{detalle}</p>}
        </div>
    );
}

function Barra({ etiqueta, valor, total, colorTexto, colorBarra, sufijo }) {
    const pct = porcentaje(valor, total);
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm gap-4">
                <span className={`${colorTexto} font-bold`}>{etiqueta}</span>
                <span className="text-white tabular-nums">
                    {pct}% <span className="text-slate-400 text-xs">({valor}{sufijo ?? ''})</span>
                </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-3" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={etiqueta}>
                <div className={`${colorBarra} h-3 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }}></div>
            </div>
        </div>
    );
}

const ICONOS = {
    usuarios: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    aprobado: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    progreso: 'M13 10V3L4 14h7v7l9-11h-7z',
    alerta: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
};

export default function StatsDashboard() {
    const { status, usuarios, error, recargar } = useUsuarios();
    const f = useFiltros(usuarios);
    const stats = useMemo(() => calcularStats(f.filtrados), [f.filtrados]);

    return (
        <div className="space-y-8">
            <PageHeader
                titulo="Estadísticas Generales"
                descripcion="Resumen del rendimiento de los estudiantes en el simulador"
                contador={status === 'ready' ? (f.activos ? `${f.filtrados.length} de ${usuarios.length} usuarios` : `${usuarios.length} usuarios`) : null}
                onRecargar={recargar}
                cargando={status === 'loading'}
            />

            {status === 'loading' && <LoadingState mensaje="Cargando datos del sistema..." />}
            {status === 'error' && <ErrorState mensaje={error} onReintentar={recargar} />}

            {status === 'ready' && (
                <>
                    <FiltrosBar f={f} />

                    {stats.total === 0 ? (
                        <EmptyState />
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <TarjetaKpi etiqueta="Total usuarios" valor={stats.total} detalle={`${stats.sinActividad} sin tests realizados`} color="slate" icono={ICONOS.usuarios} />
                                <TarjetaKpi etiqueta="Aprobados" valor={stats.aprobados} detalle={`${TESTS_PARA_APROBAR} o más tests aprobados`} color="green" icono={ICONOS.aprobado} />
                                <TarjetaKpi etiqueta="En progreso" valor={stats.enProgreso} detalle={`De 1 a ${TESTS_PARA_APROBAR - 1} tests aprobados`} color="amber" icono={ICONOS.progreso} />
                                <TarjetaKpi etiqueta="Sin aprobar" valor={stats.sinAprobar} detalle="Ningún test aprobado todavía" color="red" icono={ICONOS.alerta} />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <section className="bg-slate-900/50 p-6 md:p-8 rounded-3xl border border-slate-700/50 shadow-xl flex flex-col">
                                    <h2 className="text-xl font-bold text-white mb-6">Distribución de rendimiento</h2>
                                    <div className="flex-1 flex flex-col justify-center space-y-6">
                                        <Barra etiqueta="Aprobados" valor={stats.aprobados} total={stats.total} colorTexto="text-green-400" colorBarra="bg-green-500" />
                                        <Barra etiqueta="En progreso" valor={stats.enProgreso} total={stats.total} colorTexto="text-amber-400" colorBarra="bg-amber-500" />
                                        <Barra etiqueta="Sin aprobar / sin actividad" valor={stats.sinAprobar} total={stats.total} colorTexto="text-red-400" colorBarra="bg-red-500" />
                                    </div>
                                </section>

                                <section className="bg-slate-900/50 p-6 md:p-8 rounded-3xl border border-slate-700/50 shadow-xl">
                                    <h2 className="text-xl font-bold text-white mb-1">Rendimiento por test</h2>
                                    <p className="text-sm text-slate-400 mb-6">Porcentaje de estudiantes que aprobaron cada test (sobre quienes lo intentaron)</p>
                                    {stats.tests.length === 0 ? (
                                        <p className="text-slate-500 text-center py-8">Aún no hay tests registrados</p>
                                    ) : (
                                        <div className="space-y-5">
                                            {stats.tests.map((t) => (
                                                <Barra
                                                    key={t.numero}
                                                    etiqueta={t.nombre}
                                                    valor={t.aprobados}
                                                    total={t.intentos}
                                                    sufijo={` de ${t.intentos}`}
                                                    colorTexto="text-cyan-300"
                                                    colorBarra="bg-cyan-500"
                                                />
                                            ))}
                                        </div>
                                    )}
                                </section>
                            </div>

                            <section className="bg-slate-900/50 p-6 md:p-8 rounded-3xl border border-slate-700/50 shadow-xl">
                                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Última actividad por fecha
                                </h2>
                                {stats.fechas.length === 0 ? (
                                    <p className="text-slate-500 text-center py-8">Sin fechas de actividad registradas</p>
                                ) : (
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {stats.fechas.map(([fecha, cantidad]) => (
                                            <li key={fecha} className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-white/5 border border-white/5">
                                                <span className="text-slate-300 font-medium">
                                                    {new Date(`${fecha}T00:00:00`).toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </span>
                                                <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-sm font-bold whitespace-nowrap">
                                                    {cantidad} {cantidad === 1 ? 'usuario' : 'usuarios'}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </section>
                        </>
                    )}
                </>
            )}
        </div>
    );
}
