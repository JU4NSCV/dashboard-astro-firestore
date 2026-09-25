import { useFiltros, useUsuarios } from './hooks.js';
import { EmptyState, ErrorState, FiltrosBar, LoadingState, PageHeader, UsuarioInfo } from './ui.jsx';

function estadoTest(t) {
    if (!t.completado) return { etiqueta: 'En progreso', clase: 'bg-amber-500/10 text-amber-400', barra: 'bg-amber-500' };
    if (t.aprobado) return { etiqueta: 'Aprobado', clase: 'bg-green-500/10 text-green-400', barra: 'bg-green-500' };
    return { etiqueta: 'Reprobado', clase: 'bg-red-500/10 text-red-400', barra: 'bg-red-500' };
}

function TarjetaTest({ t }) {
    const total = t.aciertos + t.errores;
    const porcentaje = total > 0 ? Math.round((t.aciertos / total) * 100) : 0;
    const estado = estadoTest(t);

    return (
        <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-700/50 hover:bg-slate-800/80 transition-colors duration-300">
            <div className="flex justify-between items-start gap-2 mb-4">
                <span className="text-sm font-bold text-slate-200">{t.nombre}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase whitespace-nowrap ${estado.clase}`}>{estado.etiqueta}</span>
            </div>
            <dl className="space-y-2 text-xs">
                <div className="flex justify-between text-green-400">
                    <dt>Aciertos</dt>
                    <dd className="font-bold">{t.aciertos}</dd>
                </div>
                <div className="flex justify-between text-red-400">
                    <dt>Errores</dt>
                    <dd className="font-bold">{t.errores}</dd>
                </div>
            </dl>
            <div className="mt-4 flex items-center gap-2">
                <div
                    className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden"
                    role="progressbar"
                    aria-valuenow={porcentaje}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Porcentaje de aciertos en ${t.nombre}`}
                >
                    <div className={`h-full ${estado.barra} transition-all duration-700`} style={{ width: `${porcentaje}%` }}></div>
                </div>
                <span className="text-[11px] text-slate-400 tabular-nums w-9 text-right">{porcentaje}%</span>
            </div>
        </div>
    );
}

export default function TestsDashboard() {
    const { status, usuarios, error, recargar } = useUsuarios();
    const f = useFiltros(usuarios);

    const contador =
        status === 'ready'
            ? f.activos
                ? `${f.filtrados.length} de ${usuarios.length} usuarios`
                : `${usuarios.length} usuarios registrados`
            : null;

    return (
        <div className="space-y-8">
            <PageHeader
                titulo="Resultados de Tests"
                descripcion="Supervisa el progreso y rendimiento de cada estudiante en las pruebas"
                contador={contador}
                onRecargar={recargar}
                cargando={status === 'loading'}
            />

            {status === 'loading' && <LoadingState mensaje="Analizando progreso de estudiantes..." />}
            {status === 'error' && <ErrorState mensaje={error} onReintentar={recargar} />}

            {status === 'ready' && (
                <>
                    <FiltrosBar f={f} />
                    {f.filtrados.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <div className="grid grid-cols-1 gap-8">
                            {f.filtrados.map((user) => (
                                <article key={user.id} className="bg-slate-800/40 rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden hover:border-indigo-500/30 transition-colors duration-500">
                                    <div className="bg-gradient-to-r from-slate-900/80 to-slate-800/80 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-700/50">
                                        <UsuarioInfo usuario={user} />
                                        <div className="flex gap-6 md:flex-col md:items-end md:gap-0 shrink-0">
                                            <span className="text-sm text-slate-400">Tests aprobados</span>
                                            <span className="text-2xl font-bold text-white tabular-nums">
                                                {user.testsAprobados} <span className="text-slate-500 text-lg">/ {user.tests.length}</span>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        {user.tests.length > 0 ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
                                                {user.tests.map((t) => (
                                                    <TarjetaTest key={t.clave} t={t} />
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-center text-slate-500 py-4">Este estudiante aún no ha realizado tests</p>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
