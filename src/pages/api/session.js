import {
    SESSION_COOKIE,
    createSession,
    isAdmin,
    sessionCookieOptions,
    verifyFirebaseIdToken,
} from '../../lib/server/session.js';

const json = (body, status = 200) =>
    new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });

/** Intercambia un ID token de Firebase por una cookie de sesión HttpOnly. */
export async function POST({ request, cookies }) {
    let idToken;
    try {
        ({ idToken } = await request.json());
    } catch {
        // cuerpo inválido: se trata abajo
    }
    if (typeof idToken !== 'string' || idToken.length === 0 || idToken.length > 4096) {
        return json({ error: 'invalid_request' }, 400);
    }

    let claims;
    try {
        claims = await verifyFirebaseIdToken(idToken);
    } catch {
        return json({ error: 'invalid_token' }, 401);
    }

    let admin;
    try {
        admin = await isAdmin(claims.sub, idToken);
    } catch (error) {
        console.error(error);
        return json({ error: 'admin_check_failed' }, 502);
    }
    if (!admin) {
        return json({ error: 'not_admin', uid: claims.sub }, 403);
    }

    let token;
    try {
        token = await createSession({ uid: claims.sub, email: claims.email });
    } catch (error) {
        console.error('[auth]', error);
        return json({ error: 'server_misconfigured' }, 503);
    }
    cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
    return json({ ok: true });
}

/** Cierra la sesión del servidor. */
export function DELETE({ cookies }) {
    cookies.delete(SESSION_COOKIE, { path: '/' });
    return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
}
