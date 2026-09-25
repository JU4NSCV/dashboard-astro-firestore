// @ts-check
import { defineConfig, envField } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import netlify from '@astrojs/netlify';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: netlify(),

  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
  },

  // Variables de entorno validadas. Las PUBLIC_* se incrustan en el bundle del
  // cliente (la config web de Firebase es pública por diseño; la seguridad real
  // está en las reglas de Firestore). SESSION_SECRET solo existe en el servidor
  // y se lee en tiempo de ejecución desde las variables de entorno de Netlify.
  env: {
    schema: {
      PUBLIC_FIREBASE_API_KEY: envField.string({ context: 'client', access: 'public' }),
      PUBLIC_FIREBASE_AUTH_DOMAIN: envField.string({ context: 'client', access: 'public' }),
      PUBLIC_FIREBASE_PROJECT_ID: envField.string({ context: 'client', access: 'public' }),
      PUBLIC_FIREBASE_STORAGE_BUCKET: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_FIREBASE_MESSAGING_SENDER_ID: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_FIREBASE_APP_ID: envField.string({ context: 'client', access: 'public' }),
      PUBLIC_FIREBASE_MEASUREMENT_ID: envField.string({ context: 'client', access: 'public', optional: true }),
      // Opcional aquí para que un error de configuración no tumbe las páginas
      // públicas: se valida al usarse en src/lib/server/session.js.
      SESSION_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },

  security: {
    checkOrigin: true,
    // Astro calcula los hashes de sus scripts/estilos inline y genera la
    // cabecera CSP. Firebase necesita conectar con los dominios de Google.
    csp: {
      directives: [
        "default-src 'self'",
        "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com",
        "frame-src https://*.firebaseapp.com",
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ],
    },
  },
});
