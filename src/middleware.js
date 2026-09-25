import { defineMiddleware } from 'astro:middleware';
import { SESSION_COOKIE, readSession, safeNextPath } from './lib/server/session.js';

// Cabeceras que la CSP en <meta> no puede cubrir (frame-ancestors, etc.).
const SECURITY_HEADERS = {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
};

const isAdminPath = (pathname) => /^\/admin(\/|$)/.test(pathname);

export const onRequest = defineMiddleware(async (context, next) => {
    const { url, cookies, redirect, locals } = context;

    const session = await readSession(cookies.get(SESSION_COOKIE)?.value);
    locals.user = session;

    if (isAdminPath(url.pathname) && !session) {
        if (cookies.has(SESSION_COOKIE)) cookies.delete(SESSION_COOKIE, { path: '/' });
        return redirect(`/login?next=${encodeURIComponent(url.pathname)}`);
    }

    if (url.pathname.replace(/\/$/, '') === '/login' && session) {
        return redirect(safeNextPath(url.searchParams.get('next')));
    }

    const response = await next();
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
        response.headers.set(name, value);
    }
    if (isAdminPath(url.pathname) || url.pathname.startsWith('/login')) {
        response.headers.set('Cache-Control', 'private, no-store');
    }
    return response;
});
