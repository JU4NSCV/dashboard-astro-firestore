# Dashboard - Simulador de Tiro Parabólico 🚀

Panel de control web para un simulador educativo de **Tiro Parabólico** desarrollado en Unity. Permite a los docentes ver estadísticas, resultados de tests y datos cinemáticos de cada disparo realizado en el juego.

## 🎮 Juega el Simulador

[**Jugar en Itch.io - Proyecto de Física**](https://piper-ka.itch.io/proyectofisica)

## ✨ Características

- **Estadísticas:** estudiantes aprobados / en progreso / sin aprobar, rendimiento por test y actividad por fecha.
- **Tests:** resultado de cada test por estudiante (aciertos, errores, % de acierto).
- **Disparos:** ángulo, velocidad, tiempo, distancia y altura de cada tiro, con promedios y máximos.
- **Filtros** por carrera, período, paralelo y modalidad, y búsqueda por nombre, email o ID.
- **Acceso restringido** a administradores, verificado en el servidor.

## 🛠️ Tecnologías

[Astro 6](https://astro.build/) (SSR en Netlify) · [React 19](https://react.dev/) · [Tailwind CSS 4](https://tailwindcss.com/) · [Firebase](https://firebase.google.com/) (Auth + Firestore) · [jose](https://github.com/panva/jose) (JWT)

## 🔐 Cómo funciona la seguridad

1. El docente inicia sesión con Firebase Auth (email y contraseña) en `/login`.
2. El navegador envía su ID token a `POST /api/session`. El servidor verifica la firma con las claves públicas de Google y comprueba que exista el documento `admins/{uid}` en Firestore.
3. Si es administrador, el servidor crea una cookie de sesión **HttpOnly, Secure, SameSite=Strict**, firmada con `SESSION_SECRET` y válida 8 horas.
4. `src/middleware.js` valida esa cookie en cada petición a `/admin/*`.
5. Los datos se leen desde el navegador con el SDK de Firebase, y **las reglas de Firestore** (`firestore.rules`) son las que impiden que alguien que no sea administrador los lea.

> ⚠️ La configuración web de Firebase (`PUBLIC_FIREBASE_*`) es pública por diseño: cualquiera puede verla en el JavaScript del sitio. Por eso la protección real de los datos son las **reglas de Firestore**. Sin ellas, cualquiera puede descargar la base de datos.

## 🚀 Instalación local

Requisitos: Node.js 22.12 o superior y [pnpm](https://pnpm.io/).

```bash
pnpm install
cp .env.example .env   # y completa los valores
pnpm dev
```

Genera un `SESSION_SECRET` aleatorio con:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

El proyecto queda disponible en `http://localhost:4321`.

> En Windows, `pnpm build` puede fallar al final con `EPERM: operation not permitted, symlink` si el Modo de desarrollador de Windows está desactivado. Es una limitación local al empaquetar la función de Netlify. En Netlify (Linux) no ocurre.

## ☁️ Despliegue en Netlify

1. Conecta el repositorio en Netlify. `netlify.toml` ya define el comando (`pnpm build`), la carpeta de salida y Node 22.
2. En **Site configuration → Environment variables**, crea:

   | Variable | Alcance |
   | :-- | :-- |
   | `PUBLIC_FIREBASE_API_KEY`, `PUBLIC_FIREBASE_AUTH_DOMAIN`, `PUBLIC_FIREBASE_PROJECT_ID`, `PUBLIC_FIREBASE_APP_ID` (obligatorias) | Builds + Functions |
   | `PUBLIC_FIREBASE_STORAGE_BUCKET`, `PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `PUBLIC_FIREBASE_MEASUREMENT_ID` (opcionales) | Builds + Functions |
   | `SESSION_SECRET` (mínimo 32 caracteres; márcala como secreta) | Functions |

3. En Firebase Console → **Authentication → Settings → Authorized domains**, añade el dominio de Netlify (por ejemplo `tu-sitio.netlify.app`).
4. Configura los administradores y las reglas (ver abajo).

## 👩‍🏫 Dar acceso a un administrador

1. Crea el usuario en Firebase Console → **Authentication → Users → Add user** (email y contraseña).
2. Copia su **UID**. También aparece en el mensaje de error si intenta entrar sin permisos.
3. En **Firestore → Datos**, crea la colección `admins` con un documento cuyo **ID sea ese UID**. El contenido da igual; por ejemplo `{ email: "docente@uni.edu" }`.

Para quitarle el acceso, borra ese documento.

## 🛡️ Reglas de Firestore

El archivo [`firestore.rules`](firestore.rules) permite que:

- Solo los administradores lean todos los usuarios, formularios y disparos.
- Cada estudiante lea y escriba únicamente su propio documento `usuarios/{uid}` y sus subcolecciones.
- Nadie pueda crear documentos en `admins` desde un cliente.

Publícalas en Firebase Console → **Firestore Database → Reglas**, o con `firebase deploy --only firestore:rules`.

> ⚠️ **Antes de publicarlas, comprueba cómo escribe el juego de Unity.** Algunos documentos de `usuarios` tienen como ID el UID de Firebase Auth (inicio de sesión con Google) y otros un ID distinto. Si el juego escribe sin autenticarse, o con un ID que no es el UID, la regla `allow write: if isOwner(userId)` bloqueará esas escrituras. En ese caso ajusta **solo la parte de escritura**. No vuelvas a abrir la lectura pública.

## 🧞 Comandos

| Comando | Acción |
| :-- | :-- |
| `pnpm install` | Instala las dependencias |
| `pnpm dev` | Servidor de desarrollo en `localhost:4321` |
| `pnpm build` | Build de producción para Netlify |

## 📁 Estructura

```text
src/
├── components/
│   ├── dashboard/       # Paneles (Stats, Tests, Disparos), hooks y UI compartida
│   └── layout/          # Header, Footer, NavMenu, LogoutButton
├── layouts/Layout.astro
├── lib/
│   ├── firebase.js      # Inicialización del SDK (cliente)
│   ├── usuarios.js      # Carga y normalización de datos de Firestore
│   ├── session-client.js
│   └── server/session.js  # Verificación de tokens y cookie de sesión (solo servidor)
├── middleware.js        # Protección de /admin y cabeceras de seguridad
└── pages/
    ├── api/session.js   # POST: crear sesión · DELETE: cerrar sesión
    ├── admin/           # stats, tests, disparos
    ├── index.astro, login.astro, 404.astro
firestore.rules          # Reglas de seguridad recomendadas
netlify.toml             # Configuración de build y cabeceras
```
