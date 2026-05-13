import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
    const { url, cookies, redirect } = context;

    // Si la URL empieza con /admin, verificamos la sesión
    if (url.pathname.startsWith("/admin")) {
        const session = cookies.get("session");

        if (!session) {
            // Si no hay sesión, nadie pasa: directo al login
            return redirect("/login");
        }
    }

    return next();
});