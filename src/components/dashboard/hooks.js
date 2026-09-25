import { useCallback, useEffect, useMemo, useState } from 'react';
import { auth } from '../../lib/firebase.js';
import { cargarUsuarios } from '../../lib/usuarios.js';
import { cerrarSesion } from '../../lib/session-client.js';

function mensajeDeError(error) {
    if (error?.code === 'permission-denied') {
        return 'Tu cuenta no tiene permiso para leer estos datos. Verifica que esté registrada en la colección "admins" y que las reglas de Firestore estén desplegadas.';
    }
    if (error?.code === 'unavailable') {
        return 'No se pudo conectar con Firestore. Revisa tu conexión a internet.';
    }
    return 'Ocurrió un error inesperado al cargar los datos.';
}

/** Carga los usuarios de Firestore esperando a que Firebase Auth restaure la sesión. */
export function useUsuarios({ incluirDisparos = false } = {}) {
    const [estado, setEstado] = useState({ status: 'loading', usuarios: [], error: null });

    const cargar = useCallback(async () => {
        setEstado((prev) => ({ ...prev, status: 'loading', error: null }));
        await auth.authStateReady();
        if (!auth.currentUser) {
            // La cookie del servidor sigue viva pero Firebase perdió la sesión: reautenticar.
            await cerrarSesion(`/login?next=${encodeURIComponent(window.location.pathname)}`);
            return;
        }
        try {
            const usuarios = await cargarUsuarios({ incluirDisparos });
            setEstado({ status: 'ready', usuarios, error: null });
        } catch (error) {
            console.error('Error cargando usuarios:', error);
            setEstado({ status: 'error', usuarios: [], error: mensajeDeError(error) });
        }
    }, [incluirDisparos]);

    useEffect(() => {
        cargar();
    }, [cargar]);

    return { ...estado, recargar: cargar };
}

export const CAMPOS_FILTRO = [
    { clave: 'carrera', etiqueta: 'Carrera', todos: 'Todas las carreras', chip: 'indigo' },
    { clave: 'periodoAcademico', etiqueta: 'Período académico', todos: 'Todos los períodos', chip: 'cyan' },
    { clave: 'paralelo', etiqueta: 'Paralelo', todos: 'Todos los paralelos', chip: 'teal' },
    { clave: 'modalidad', etiqueta: 'Modalidad', todos: 'Todas las modalidades', chip: 'purple' },
];

const FILTROS_VACIOS = Object.fromEntries(CAMPOS_FILTRO.map((c) => [c.clave, '']));

const normalizar = (texto) =>
    String(texto ?? '')
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase();

/** Filtros por datos del formulario + búsqueda por nombre, email o id. */
export function useFiltros(usuarios) {
    const [filtros, setFiltros] = useState(FILTROS_VACIOS);
    const [busqueda, setBusqueda] = useState('');

    const opciones = useMemo(() => {
        const resultado = {};
        for (const { clave } of CAMPOS_FILTRO) {
            const valores = usuarios.map((u) => u.formulario?.[clave]).filter((v) => v !== undefined && v !== null && v !== '');
            resultado[clave] = [...new Set(valores.map(String))].sort((a, b) =>
                a.localeCompare(b, 'es', { numeric: true })
            );
        }
        return resultado;
    }, [usuarios]);

    const filtrados = useMemo(() => {
        const termino = normalizar(busqueda.trim());
        return usuarios.filter((u) => {
            for (const { clave } of CAMPOS_FILTRO) {
                if (filtros[clave] && String(u.formulario?.[clave] ?? '') !== filtros[clave]) return false;
            }
            if (termino && ![u.nombre, u.email, u.id].some((campo) => normalizar(campo).includes(termino))) {
                return false;
            }
            return true;
        });
    }, [usuarios, filtros, busqueda]);

    const activos = Object.values(filtros).some(Boolean) || busqueda.trim() !== '';

    return {
        filtros,
        setFiltro: (clave, valor) => setFiltros((prev) => ({ ...prev, [clave]: valor })),
        busqueda,
        setBusqueda,
        limpiar: () => {
            setFiltros(FILTROS_VACIOS);
            setBusqueda('');
        },
        opciones,
        filtrados,
        activos,
    };
}
