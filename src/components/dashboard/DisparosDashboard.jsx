import { useMemo, useState } from 'react';
import { useFiltros, useUsuarios } from './hooks.js';
import { EmptyState, ErrorState, FiltrosBar, LoadingState, PageHeader, UsuarioInfo, formatoFechaHora, formatoNumero } from './ui.jsx';

function resumenDisparos(disparos) {
    const valores = (campo) => disparos.map((d) => d[campo]).filter((v) => v !== null);
    const promedio = (lista) => (lista.length ? lista.reduce((a, b) => a + b, 0) / lista.length : null);
    const maximo = (lista) => (lista.length ? Math.max(...lista) : null);
    return {
        anguloPromedio: promedio(valores('angulo')),
        velocidadPromedio: promedio(valores('velocidad')),
        distanciaMax: maximo(valores('distancia')),
        alturaMax: maximo(valores('altura')),
    };
}

function Metrica({ etiqueta, valor }) {
    return (
        <div className="bg-slate-900/50 rounded-xl px-4 py-3 border border-slate-700/50">
            <dt className="text-[11px] uppercase tracking-wider text-slate-400">{etiqueta}</dt>
            <dd className="text-lg font-bold text-white tabular-nums">{valor}</dd>
        </div>
    );
}

function Badge({ color, children }) {
    const clases = {
        cyan: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
        teal: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
        indigo: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
    };
    return <span className={`px-2.5 py-1 rounded-lg border tabular-nums ${clases[color]}`}>{children}</span>;
}

function TablaDisparos({ disparos }) {
    return (
        <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-800/80 text-slate-300 border-b border-slate-700">
                    <tr>
                        <th scope="col" className="px-4 md:px-6 py-3 font-semibold">#</th>
                        <th scope="col" className="px-4 md:px-6 py-3 font-semibold">Fecha</th>
                        <th scope="col" className="px-4 md:px-6 py-3 font-semibold">Ángulo</th>
                        <th scope="col" className="px-4 md:px-6 py-3 font-semibold">Velocidad</th>
                        <th scope="col" className="px-4 md:px-6 py-3 font-semibold">Tiempo</th>
                        <th scope="col" className="px-4 md:px-6 py-3 font-semibold">Distancia</th>
                        <th scope="col" className="px-4 md:px-6 py-3 font-semibold">Altura máx.</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                    {disparos.map((d, index) => (
                        <tr key={d.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-4 md:px-6 py-3 text-slate-400 tabular-nums">{index + 1}</td>
                            <td className="px-4 md:px-6 py-3 text-slate-400">{formatoFechaHora(d.creadoEn)}</td>
                            <td className="px-4 md:px-6 py-3"><Badge color="cyan">{formatoNumero(d.angulo, 1, '°')}</Badge></td>
                            <td className="px-4 md:px-6 py-3 text-slate-300 tabular-nums">{formatoNumero(d.velocidad, 2, ' m/s')}</td>
                            <td className="px-4 md:px-6 py-3 text-slate-300 tabular-nums">{formatoNumero(d.tiempo, 2, ' s')}</td>
                            <td className="px-4 md:px-6 py-3"><Badge color="teal">{formatoNumero(d.distancia, 2, ' m')}</Badge></td>
                            <td className="px-4 md:px-6 py-3"><Badge color="indigo">{formatoNumero(d.altura, 2, ' m')}</Badge></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function DisparosDashboard() {
    const { status, usuarios, error, recargar } = useUsuarios({ incluirDisparos: true });
    const [soloConDisparos, setSoloConDisparos] = useState(true);
    const f = useFiltros(usuarios);

    const visibles = useMemo(
        () => (soloConDisparos ? f.filtrados.filter((u) => u.disparos.length > 0) : f.filtrados),
        [f.filtrados, soloConDisparos]
    );
    const totalDisparos = visibles.reduce((acc, u) => acc + u.disparos.length, 0);

    return (
        <div className="space-y-8">
            <PageHeader
                titulo="Registro de Disparos"
                descripcion="Consulta las métricas y la precisión de los tiros de cada estudiante"
                contador={status === 'ready' ? `${totalDisparos} disparos · ${visibles.length} usuarios` : null}
                acento="cyan"
                onRecargar={recargar}
                cargando={status === 'loading'}
            />

            {status === 'loading' && <LoadingState mensaje="Cargando registros de balística..." acento="cyan" />}
            {status === 'error' && <ErrorState mensaje={error} onReintentar={recargar} />}

            {status === 'ready' && (
                <>
                    <FiltrosBar f={f} acento="cyan">
                        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={soloConDisparos}
                                onChange={(e) => setSoloConDisparos(e.target.checked)}
                                className="w-4 h-4 rounded accent-cyan-500"
                            />
                            Solo con disparos
                        </label>
                    </FiltrosBar>

                    {visibles.length === 0 ? (
                        <EmptyState
                            detalle={soloConDisparos ? 'Ningún estudiante con disparos coincide. Desmarca "Solo con disparos" o ajusta los filtros.' : undefined}
                        />
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {visibles.map((user) => {
                                const r = resumenDisparos(user.disparos);
                                return (
                                    <details key={user.id} className="group bg-slate-800/40 rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden hover:border-cyan-500/30 transition-colors duration-500 open:border-cyan-500/30">
                                        <summary className="cursor-pointer list-none bg-gradient-to-r from-slate-900/80 to-slate-800/80 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 [&::-webkit-details-marker]:hidden">
                                            <UsuarioInfo usuario={user} acento="cyan" />
                                            <div className="flex items-center gap-4 shrink-0">
                                                <div className="flex flex-col md:items-end">
                                                    <span className="text-sm text-slate-400">Disparos</span>
                                                    <span className="text-2xl font-bold text-white tabular-nums">{user.disparos.length}</span>
                                                </div>
                                                <svg className="w-5 h-5 text-slate-400 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </summary>

                                        <div className="p-6 space-y-6 border-t border-slate-700/50">
                                            {user.disparos.length > 0 ? (
                                                <>
                                                    <dl className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                                        <Metrica etiqueta="Ángulo promedio" valor={formatoNumero(r.anguloPromedio, 1, '°')} />
                                                        <Metrica etiqueta="Velocidad promedio" valor={formatoNumero(r.velocidadPromedio, 2, ' m/s')} />
                                                        <Metrica etiqueta="Distancia máxima" valor={formatoNumero(r.distanciaMax, 2, ' m')} />
                                                        <Metrica etiqueta="Altura máxima" valor={formatoNumero(r.alturaMax, 2, ' m')} />
                                                    </dl>
                                                    <TablaDisparos disparos={user.disparos} />
                                                </>
                                            ) : (
                                                <div className="text-center py-10 bg-slate-900/30 rounded-2xl border border-dashed border-slate-700">
                                                    <p className="text-slate-500">Sin datos de disparos</p>
                                                </div>
                                            )}
                                        </div>
                                    </details>
                                );
                            })}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
