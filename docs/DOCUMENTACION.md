# Documentación del Proyecto: Dashboard de Simulador de Tiro Parabólico

## Descripción General
Este proyecto es una aplicación web (Dashboard) que actúa como complemento de un simulador interactivo de **Tiro Parabólico** desarrollado en Unity. Su principal objetivo es visualizar y analizar los datos generados por los estudiantes al utilizar el simulador.

La aplicación permite a profesores y estudiantes hacer un seguimiento en tiempo real del progreso, visualizar los tiros realizados, revisar los resultados de los tests o exámenes de física, y observar estadísticas generales de rendimiento.

## Arquitectura y Tecnologías
El proyecto ha sido desarrollado utilizando tecnologías web modernas para garantizar un rendimiento óptimo, una interfaz de usuario atractiva y un desarrollo ágil:

- **Astro:** Framework web principal utilizado para la creación de las páginas y la optimización del rendimiento (generación de sitios estáticos y renderizado del lado del servidor).
- **React:** Biblioteca de JavaScript utilizada para construir componentes interactivos y dinámicos (las vistas del dashboard).
- **Tailwind CSS:** Framework de utilidades CSS utilizado para el diseño y la estilización de la interfaz de usuario.
- **Firebase (Firestore):** Base de datos NoSQL en la nube utilizada para almacenar y sincronizar en tiempo real los datos provenientes del juego en Unity (usuarios, tiros, tests).

## Estructura del Proyecto

```text
/
├── public/                 # Archivos estáticos públicos
├── src/                    # Código fuente principal
│   ├── components/         # Componentes React y Astro (UI, Dashboards)
│   │   ├── DisparosDashboard.jsx # Visualización de datos de disparos
│   │   ├── StatsDashboard.jsx    # Estadísticas generales
│   │   ├── TestsDashboard.jsx    # Resultados de tests
│   │   ├── Header.astro          # Componente de cabecera
│   │   └── Footer.astro          # Componente de pie de página
│   ├── layouts/            # Plantillas de diseño principales (Layout.astro)
│   ├── lib/                # Utilidades (Configuración de Firebase)
│   │   └── firebase.js     # Inicialización de la base de datos
│   ├── pages/              # Rutas de la aplicación (Basado en archivos)
│   │   ├── index.astro     # Página de inicio / Landing page
│   │   ├── login.astro     # Página de inicio de sesión
│   │   └── admin/          # Vistas del panel de administración
│   │       ├── disparos.astro
│   │       ├── stats.astro
│   │       └── tests.astro
│   ├── styles/             # Estilos globales (CSS)
│   └── middleware.js       # Middleware de Astro (probablemente para autenticación)
├── astro.config.mjs        # Configuración de Astro
├── package.json            # Dependencias y scripts del proyecto
```

## Funcionalidades Principales

1. **Landing Page (`/`):**
   - Presenta el simulador de física.
   - Proporciona un enlace directo para jugar el simulador alojado en Itch.io.
   - Destaca las características del proyecto (Motor Unity 3D, Análisis en tiempo real, Aprendizaje práctico).

2. **Panel de Estadísticas (`/admin/stats`):**
   - Muestra métricas generales de todos los usuarios registrados en el sistema.
   - Calcula el total de usuarios, cuántos han aprobado los tests (4 o más tests pasados), cuántos están en progreso y cuántos han reprobado.

3. **Panel de Tests (`/admin/tests`):**
   - Permite visualizar de forma detallada los resultados de las pruebas o exámenes que los estudiantes completan dentro del simulador de Unity.
   - Evalúa aciertos, errores y si el test fue completado.

4. **Panel de Disparos (`/admin/disparos`):**
   - Visualiza la información cinemática de cada tiro realizado en el simulador.
   - Analiza parámetros como velocidad inicial, ángulo, distancia, altura máxima, etc.

5. **Autenticación:**
   - Rutas protegidas (mediante middleware) para asegurar que solo los usuarios autorizados (profesores o administradores) puedan acceder a los paneles de datos en `/admin`.

## ¿Cómo se ha realizado?

1. **Desarrollo Frontend:** Se configuró un proyecto inicial con Astro y Tailwind CSS. Se integró React de forma híbrida (mediante `@astrojs/react`) para habilitar el manejo de estados complejos en las tablas y gráficos interactivos de los dashboards de administración.
2. **Integración con Firebase:** En `src/lib/firebase.js` se inicializó la aplicación de Firebase. Los componentes React utilizan el SDK de Firebase para hacer consultas (`getDocs`) a las colecciones de Firestore (como `usuarios`) donde se alojan los resultados de los estudiantes.
3. **Diseño de UI/UX:** Se aplicó un estilo moderno, similar a "dark mode" con efectos de glassmorphism (desenfoque de fondo), bordes redondeados y colores vibrantes (cyan, indigo) utilizando las clases de Tailwind CSS, dándole un aspecto "gamer" y tecnológico adecuado para un simulador de Unity.
4. **Flujo de Datos:**
   - El juego desarrollado en Unity envía los datos físicos y cinemáticos a Firebase a través de su propia integración.
   - El Dashboard de Astro se conecta a la misma base de datos de Firebase, lee los datos y muestra esta información de forma organizada a través de los componentes de React, cerrando el ciclo entre el videojuego y el aula de clases.
