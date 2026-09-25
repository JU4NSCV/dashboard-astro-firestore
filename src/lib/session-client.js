// Cliente: sincroniza la sesión de Firebase Auth con la cookie del servidor.

/** Crea la sesión del servidor a partir del usuario de Firebase. Lanza un error con `.code`. */
export async function crearSesionServidor(user) {
    const idToken = await user.getIdToken(true);
    const res = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
        credentials: 'same-origin',
    });
    if (res.ok) return;
    const body = await res.json().catch(() => ({}));
    const error = new Error(body.error || `HTTP ${res.status}`);
    error.code = body.error || 'session_error';
    error.uid = body.uid;
    throw error;
}

/** Cierra la sesión en Firebase y en el servidor, y vuelve al login. */
export async function cerrarSesion(destino = '/login') {
    try {
        const [{ auth }, { signOut }] = await Promise.all([import('./firebase.js'), import('firebase/auth')]);
        await signOut(auth);
    } catch (error) {
        console.error('Error al cerrar sesión en Firebase:', error);
    }
    await fetch('/api/session', { method: 'DELETE', credentials: 'same-origin' }).catch(() => {});
    window.location.assign(destino);
}
