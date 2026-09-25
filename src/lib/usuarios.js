import { collection, collectionGroup, getDocs } from 'firebase/firestore';
import { db } from './firebase.js';

/** Tests aprobados necesarios para considerar aprobado a un estudiante. */
export const TESTS_PARA_APROBAR = 4;

const toNumber = (v) => {
    const n = typeof v === 'string' ? Number(v.replace(',', '.')) : Number(v);
    return v === null || v === undefined || v === '' || !Number.isFinite(n) ? null : n;
};

const toDate = (v) => {
    if (!v) return null;
    if (typeof v.toDate === 'function') return v.toDate();
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
};

/** Convierte `ultimoTest.tests` ({ test1: {...}, ... }) en un array ordenado. */
function normalizarTests(mapa) {
    if (!mapa || typeof mapa !== 'object') return [];
    return Object.entries(mapa)
        .filter(([clave, valor]) => /^test\d+$/i.test(clave) && valor && typeof valor === 'object')
        .map(([clave, valor]) => {
            const numero = Number(clave.replace(/\D/g, ''));
            const aciertos = toNumber(valor.aciertos) ?? 0;
            const errores = toNumber(valor.errores) ?? 0;
            const completado = Boolean(valor.completado);
            return {
                clave,
                numero,
                nombre: `Test ${numero}`,
                aciertos,
                errores,
                completado,
                aprobado: completado && aciertos > errores,
            };
        })
        .sort((a, b) => a.numero - b.numero);
}

function normalizarDisparo(doc) {
    const d = doc.data();
    return {
        id: doc.id,
        angulo: toNumber(d.angulo),
        velocidad: toNumber(d.velocidad),
        distancia: toNumber(d.distancia),
        altura: toNumber(d.altura),
        tiempo: toNumber(d.tiempo),
        creadoEn: toDate(d.creadoEn),
    };
}

/** Agrupa documentos de un collectionGroup por el id del usuario padre (`usuarios/{id}/...`). */
function agruparPorUsuario(snapshot, mapear) {
    const grupos = new Map();
    for (const doc of snapshot.docs) {
        const padre = doc.ref.parent.parent;
        if (!padre || padre.parent.id !== 'usuarios') continue;
        if (!grupos.has(padre.id)) grupos.set(padre.id, []);
        grupos.get(padre.id).push(mapear(doc));
    }
    return grupos;
}

/**
 * Carga todos los usuarios con su formulario (y opcionalmente sus disparos).
 * Usa consultas de grupo de colecciones: 2-3 lecturas en total en lugar de
 * una consulta por usuario y subcolección.
 */
export async function cargarUsuarios({ incluirDisparos = false } = {}) {
    const [usuariosSnap, formulariosSnap, disparosSnap] = await Promise.all([
        getDocs(collection(db, 'usuarios')),
        getDocs(collectionGroup(db, 'formulario')),
        incluirDisparos ? getDocs(collectionGroup(db, 'disparos')) : Promise.resolve(null),
    ]);

    const formularios = agruparPorUsuario(formulariosSnap, (doc) => doc.data());
    const disparos = disparosSnap ? agruparPorUsuario(disparosSnap, normalizarDisparo) : new Map();

    return usuariosSnap.docs.map((doc) => {
        const data = doc.data();
        const tests = normalizarTests(data.ultimoTest?.tests);
        const listaDisparos = (disparos.get(doc.id) ?? []).sort(
            (a, b) => (a.creadoEn?.getTime() ?? 0) - (b.creadoEn?.getTime() ?? 0)
        );
        return {
            id: doc.id,
            nombre: typeof data.displayName === 'string' && data.displayName.trim() ? data.displayName.trim() : null,
            email: typeof data.email === 'string' && data.email ? data.email : null,
            actualizadoEn: toDate(data.actualizadoEn),
            formulario: formularios.get(doc.id)?.[0] ?? null,
            tests,
            testsAprobados: tests.filter((t) => t.aprobado).length,
            disparos: listaDisparos,
        };
    });
}

/** Clave de fecha local (YYYY-MM-DD) sin el desfase de toISOString(). */
export function claveFechaLocal(fecha) {
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const d = String(fecha.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}
