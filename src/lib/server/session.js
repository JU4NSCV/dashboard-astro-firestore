// Solo servidor: verificación de tokens de Firebase y sesión firmada del panel.
import { SignJWT, jwtVerify, createRemoteJWKSet } from 'jose';
import { getSecret } from 'astro:env/server';
import { PUBLIC_FIREBASE_PROJECT_ID as PROJECT_ID } from 'astro:env/client';

export const SESSION_COOKIE = 'df_session';
export const SESSION_MAX_AGE = 60 * 60 * 8; // 8 horas

const SESSION_ISSUER = 'dashboard-fisica';
const SESSION_AUDIENCE = 'admin';

// Claves públicas con las que Google firma los ID tokens de Firebase Auth.
const FIREBASE_JWKS = createRemoteJWKSet(
    new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
);

export class ConfigError extends Error {}

let secretKey;
/** Lee y valida SESSION_SECRET al usarse (no al arrancar) con un mensaje claro. */
function getSecretKey() {
    if (secretKey) return secretKey;
    const secret = getSecret('SESSION_SECRET');
    if (!secret || secret.length < 32) {
        throw new ConfigError(
            secret
                ? `SESSION_SECRET tiene ${secret.length} caracteres; se requieren al menos 32.`
                : 'Falta la variable de entorno SESSION_SECRET (en Netlify debe tener alcance "Functions").'
        );
    }
    secretKey = new TextEncoder().encode(secret);
    return secretKey;
}

/** Verifica firma, emisor, audiencia y expiración de un ID token de Firebase. */
export async function verifyFirebaseIdToken(idToken) {
    const { payload } = await jwtVerify(idToken, FIREBASE_JWKS, {
        issuer: `https://securetoken.google.com/${PROJECT_ID}`,
        audience: PROJECT_ID,
        algorithms: ['RS256'],
    });
    if (typeof payload.sub !== 'string' || payload.sub.length === 0) {
        throw new Error('El token no contiene un uid');
    }
    return payload;
}

/**
 * Un usuario es administrador si existe el documento `admins/{uid}` en Firestore.
 * Se consulta con el propio token del usuario, así las reglas de Firestore
 * deciden (ver firestore.rules) y no hace falta una cuenta de servicio.
 */
export async function isAdmin(uid, idToken) {
    const url =
        `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}` +
        `/databases/(default)/documents/admins/${encodeURIComponent(uid)}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${idToken}` } });
    if (res.ok) return true;
    if (res.status === 404 || res.status === 403) return false;
    throw new Error(`Firestore respondió ${res.status} al verificar el rol de administrador`);
}

export function createSession({ uid, email }) {
    return new SignJWT({ email: email ?? null })
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject(uid)
        .setIssuer(SESSION_ISSUER)
        .setAudience(SESSION_AUDIENCE)
        .setIssuedAt()
        .setExpirationTime(`${SESSION_MAX_AGE}s`)
        .sign(getSecretKey());
}

/** Devuelve `{ uid, email }` si la cookie de sesión es válida, o `null`. */
export async function readSession(token) {
    if (!token) return null;
    const key = getSecretKey();
    try {
        const { payload } = await jwtVerify(token, key, {
            issuer: SESSION_ISSUER,
            audience: SESSION_AUDIENCE,
            algorithms: ['HS256'],
        });
        return { uid: String(payload.sub), email: payload.email ? String(payload.email) : null };
    } catch {
        return null;
    }
}

export const sessionCookieOptions = {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: /** @type {const} */ ('strict'),
    path: '/',
    maxAge: SESSION_MAX_AGE,
};

/** Solo permite volver a rutas internas del panel (evita open redirects). */
export function safeNextPath(next) {
    if (typeof next === 'string' && /^\/admin(\/[\w\-/]*)?$/.test(next)) return next;
    return '/admin/stats';
}
