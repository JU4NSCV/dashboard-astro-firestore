import { CAMPOS_FILTRO } from './hooks.js';

const ACENTOS = {
    indigo: { glow: 'bg-indigo-500/20', titulo: 'from-indigo-400 via-cyan-400 to-teal-300', spinner: 'border-indigo-500/30 border-t-indigo-500', ring: 'focus:ring-indigo-500/50 focus:border-indigo-500/50', texto: 'text-indigo-400' },
    cyan: { glow: 'bg-cyan-500/20', titulo: 'from-cyan-400 via-teal-300 to-green-400', spinner: 'border-cyan-500/30 border-t-cyan-500', ring: 'focus:ring-cyan-500/50 focus:border-cyan-500/50', texto: 'text-cyan-400' },
};

const CHIPS = {
    indigo: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/25',
    cyan: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25',
    teal: 'bg-teal-500/15 text-teal-300 border-teal-500/25',
    purple: 'bg-purple-500/15 text-purple-300 border-purple-500/25',
};

export function PageHeader({ titulo, descripcion, contador, acento = 'indigo', onRecargar, cargando }) {
    const a = ACENTOS[acento];
    return (
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 p-6 md:p-8 rounded-3xl border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className={`absolute -top-24 -right-24 w-64 h-64 ${a.glow} rounded-full blur-3xl pointer-events-none`}></div>
            <div className="relative z-10">
                <h1 className={`text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${a.titulo}`}>
                    {titulo}
                </h1>
                <p className="text-slate-400 mt-2 md:text-lg">{descripcion}</p>
            </div>
            <div className="relative z-10 flex flex-wrap items-center gap-3">
                {contador && (
                    <div className="flex items-center gap-3 bg-slate-900/50 py-2 px-4 rounded-full border border-slate-700/50" aria-live="polite">
                        <div className="w-2 h-2 rounded-full bg-green-500 motion-safe:animate-pulse"></div>
                        <span className="text-sm font-medium text-slate-300">{contador}</span>
                    </div>
                )}
                {onRecargar && (
                    <button
                        type="button"
                        onClick={onRecargar}
                        disabled={cargando}
                        className="flex items-center gap-2 py-2 px-4 rounded-full text-sm font-medium text-slate-300 bg-slate-900/50 border border-slate-700/50 hover:bg-slate-800 hover:text-white disabled:opacity-50 transition-colors"
                    >
                        <svg className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Actualizar
                    </button>
                )}
            </div>
        </header>
    );
}

export function LoadingState({ mensaje, acento = 'indigo' }) {
    return (
        <div className="flex flex-col items-center justify-center py-20" role="status">
            <div className={`w-12 h-12 border-4 ${ACENTOS[acento].spinner} rounded-full animate-spin`}></div>
            <p className="text-slate-400 mt-4 motion-safe:animate-pulse">{mensaje}</p>
        </div>
    );
}

export function ErrorState({ mensaje, onReintentar }) {
    return (
        <div className="text-center py-16 px-6 bg-red-500/5 rounded-3xl border border-red-500/20" role="alert">
            <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-red-300 font-medium max-w-xl mx-auto">{mensaje}</p>
            {onReintentar && (
                <button type="button" onClick={onReintentar} className="mt-6 px-5 py-2 rounded-xl text-sm font-bold text-white bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 transition-colors">
                    Reintentar
                </button>
            )}
        </div>
    );
}

export function EmptyState({ titulo = 'No se encontraron usuarios', detalle = 'Intenta ajustar los filtros aplicados' }) {
    return (
        <div className="text-center py-20 bg-slate-800/20 rounded-3xl border border-dashed border-slate-700">
            <svg className="w-12 h-12 text-slate-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-slate-400 font-medium">{titulo}</p>
            <p className="text-slate-500 text-sm mt-1">{detalle}</p>
        </div>
    );
}

function Chevron() {
    return (
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </div>
    );
}

/** Barra de filtros compartida por todos los paneles. Recibe el objeto de useFiltros(). */
export function FiltrosBar({ f, acento = 'indigo', children }) {
    const a = ACENTOS[acento];
    const control =
        'w-full bg-slate-900/50 border border-slate-700 text-slate-300 text-sm rounded-xl px-3 py-2.5 ' +
        `focus:outline-none focus:ring-2 ${a.ring} transition-all duration-200`;

    return (
        <section aria-label="Filtros" className="bg-slate-800/40 rounded-2xl border border-slate-700/50 backdrop-blur-sm p-5 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                    <svg className={`w-4 h-4 ${a.texto}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                    </svg>
                    <h2 className="text-sm font-semibold text-slate-300">Filtrar por</h2>
                </div>
                <div className="flex items-center gap-3">
                    {children}
                    {f.activos && (
                        <button
                            type="button"
                            onClick={f.limpiar}
                            className="text-xs text-slate-300 hover:text-white transition-colors flex items-center gap-1 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Limpiar filtros
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div>
                    <label htmlFor="filtro-busqueda" className="block text-xs font-medium text-slate-400 mb-1.5 pl-1">Buscar</label>
                    <input
                        id="filtro-busqueda"
                        type="search"
                        value={f.busqueda}
                        onChange={(e) => f.setBusqueda(e.target.value)}
                        placeholder="Nombre, email o ID"
                        className={`${control} placeholder:text-slate-500`}
                    />
                </div>
                {CAMPOS_FILTRO.map(({ clave, etiqueta, todos }) => (
                    <div key={clave}>
                        <label htmlFor={`filtro-${clave}`} className="block text-xs font-medium text-slate-400 mb-1.5 pl-1">{etiqueta}</label>
                        <div className="relative">
                            <select
                                id={`filtro-${clave}`}
                                value={f.filtros[clave]}
                                onChange={(e) => f.setFiltro(clave, e.target.value)}
                                className={`${control} cursor-pointer appearance-none pr-9`}
                            >
                                <option value="">{todos}</option>
                                {f.opciones[clave].map((valor) => (
                                    <option key={valor} value={valor}>{valor}</option>
                                ))}
                            </select>
                            <Chevron />
                        </div>
                    </div>
                ))}
            </div>

            {f.activos && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-700/50">
                    {CAMPOS_FILTRO.filter(({ clave }) => f.filtros[clave]).map(({ clave, etiqueta, chip }) => (
                        <span key={clave} className={`flex items-center gap-1.5 text-xs border px-3 py-1 rounded-full ${CHIPS[chip]}`}>
                            {etiqueta}: {f.filtros[clave]}
                            <button type="button" onClick={() => f.setFiltro(clave, '')} className="hover:text-white transition-colors" aria-label={`Quitar filtro ${etiqueta}`}>
                                ×
                            </button>
                        </span>
                    ))}
                    {f.busqueda.trim() && (
                        <span className={`flex items-center gap-1.5 text-xs border px-3 py-1 rounded-full ${CHIPS.cyan}`}>
                            Búsqueda: “{f.busqueda.trim()}”
                            <button type="button" onClick={() => f.setBusqueda('')} className="hover:text-white transition-colors" aria-label="Quitar búsqueda">
                                ×
                            </button>
                        </span>
                    )}
                </div>
            )}
        </section>
    );
}

/** Avatar + nombre + email + etiquetas del formulario de un usuario. */
export function UsuarioInfo({ usuario, acento = 'indigo' }) {
    const titulo = usuario.nombre || usuario.email || usuario.id;
    const gradiente = acento === 'cyan' ? 'from-cyan-500 to-teal-500 shadow-cyan-500/20' : 'from-indigo-500 to-cyan-500 shadow-indigo-500/20';
    const f = usuario.formulario;
    return (
        <div className="flex items-center gap-4 min-w-0">
            <div className={`w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-2xl bg-gradient-to-br ${gradiente} flex items-center justify-center text-xl font-bold text-white shadow-lg`} aria-hidden="true">
                {titulo.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
                <h2 className="text-white font-bold text-lg md:text-xl truncate">{titulo}</h2>
                <p className="text-slate-400 text-sm truncate">
                    {usuario.email && usuario.email !== titulo ? usuario.email : `ID: ${usuario.id}`}
                </p>
                {f && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {f.carrera && <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">{f.carrera}</span>}
                        {f.periodoAcademico && <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">{f.periodoAcademico}</span>}
                        {f.paralelo && <span className="text-[11px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20">Paralelo {f.paralelo}</span>}
                        {f.modalidad && <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">{f.modalidad}</span>}
                    </div>
                )}
            </div>
        </div>
    );
}

export const formatoNumero = (valor, decimales = 2, unidad = '') =>
    valor === null || valor === undefined ? '—' : `${valor.toLocaleString('es-EC', { minimumFractionDigits: decimales, maximumFractionDigits: decimales })}${unidad}`;

export const formatoFechaHora = (fecha) =>
    fecha ? fecha.toLocaleString('es-EC', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
