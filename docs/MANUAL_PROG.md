# 👨‍💻 Manual del Programador - Dashboard Tiro Parabólico 🚀

¡Bienvenido al Manual del Programador! Aquí encontrarás toda la información técnica necesaria para entender, mantener y escalar el proyecto. 🛠️

## 🏗️ Arquitectura y Tecnologías
Este proyecto utiliza un stack moderno enfocado en la velocidad y la reactividad:
- **Astro 🚀:** Framework principal. Utilizado para el enrutamiento, generación de páginas y layouts. Nos permite enviar el mínimo JavaScript posible al cliente.
- **React ⚛️:** Utilizado para los componentes interactivos de los dashboards (tablas, gráficos, filtrado). Integrado en Astro a través de las "islas" (`client:load`, `client:idle`).
- **Tailwind CSS 🎨:** Para todo el estilizado. Permite un desarrollo rápido con clases de utilidad y un diseño unificado (Dark mode, glassmorphism).
- **Firebase (Firestore) 🔥:** Base de datos en la nube. Se conecta con el juego de Unity para recibir datos y con este Dashboard para leerlos en tiempo real.

---

## 📂 Estructura del Proyecto

A continuación, se detalla el propósito de cada directorio y archivo importante dentro de la carpeta `src/`:

### 🔹 `src/pages/` (Rutas de la aplicación)
Astro utiliza enrutamiento basado en archivos. Cada archivo `.astro` aquí es una página web.
- `index.astro` 🏠: La *Landing Page*. Contiene la presentación del proyecto y llamadas a la acción (jugar en Itch.io).
- `login.astro` 🔐: Página de inicio de sesión para que profesores/admins accedan al panel.
- `admin/` 🛡️: Carpeta protegida (rutas de administración).
  - `admin/stats.astro` 📊: Página principal del panel. Muestra estadísticas globales.
  - `admin/disparos.astro` 🎯: Página que renderiza la tabla detallada de cada tiro parabólico.
  - `admin/tests.astro` 📝: Página que muestra los resultados de los exámenes de los estudiantes.

### 🔹 `src/components/` (Componentes de UI)
Aquí viven las piezas reutilizables de la interfaz. Los `.astro` son estáticos, los `.jsx` son interactivos (React).
- **Componentes React (.jsx):**
  - `DisparosDashboard.jsx` 🔫: Se conecta a Firestore y renderiza la tabla dinámica de disparos.
  - `StatsDashboard.jsx` 📈: Calcula y renderiza gráficos o tarjetas con las métricas globales de usuarios (aprobados/reprobados).
  - `TestsDashboard.jsx` ✅: Muestra la tabla de evaluaciones de los estudiantes.
  - `NavMenu.jsx` 🧭: Menú de navegación interactivo para moverse entre las vistas del panel admin.
  - `LogoutButton.jsx` 🚪: Botón para cerrar la sesión de Firebase y redirigir al inicio.
- **Componentes Astro (.astro):**
  - `Header.astro` 🔝: Cabecera principal del sitio web público.
  - `Footer.astro` ⬇️: Pie de página de la aplicación.

### 🔹 `src/layouts/` (Plantillas base)
- `Layout.astro` 🖼️: Define la estructura HTML global (el `<head>`, tipografías, metadatos, y el contenedor principal `<slot />`). Todas las páginas envuelven su contenido en este layout.

### 🔹 `src/lib/` (Lógica de negocio y utilidades)
- `firebase.js` 🔥: Contiene la inicialización del SDK de Firebase y la exportación de las instancias de `auth` y `db` (Firestore). ¡Es el corazón de la conexión de datos!

### 🔹 `src/middleware.js` 🛡️
- Intercepta las peticiones de red. Su función principal es proteger las rutas que empiezan por `/admin`. Verifica si existe un token de sesión válido; si no, redirige al usuario a `/login`.

### 🔹 `src/styles/` 🎨
- `global.css`: Estilos globales base y directivas de Tailwind (`@tailwind base;`, etc.).

---

## 🔄 Flujo de Datos (Data Flow)

1. **Entrada de Datos:** El jugador (estudiante) utiliza el simulador en Unity. El juego envía documentos JSON a las colecciones de Firestore (ej. `usuarios`, `disparos`, `tests`).
2. **Lectura de Datos:** Cuando un administrador entra a `/admin/disparos`, el componente `DisparosDashboard.jsx` se monta en el navegador.
3. **Petición:** A través del SDK de Firebase (`firebase.js`), el componente React hace un `getDocs` o un `onSnapshot` a la colección correspondiente.
4. **Renderizado:** React actualiza su estado local con los datos obtenidos y renderiza la tabla interactiva utilizando clases de Tailwind para el diseño.

---

## 🛠️ Comandos Útiles

- `npm run dev`: Inicia el servidor de desarrollo en `localhost:4321`.
- `npm run build`: Genera la versión de producción optimizada en la carpeta `dist/`.
- `npm run preview`: Previsualiza la build de producción localmente.

¡Feliz código! 💻✨
