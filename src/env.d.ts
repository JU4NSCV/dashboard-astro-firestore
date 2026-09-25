declare namespace App {
    interface Locals {
        /** Sesión de administrador verificada por el middleware, o `null`. */
        user: { uid: string; email: string | null } | null;
    }
}
