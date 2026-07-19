# Dashboard - Simulador de Tiro Parabólico 🚀

Este proyecto es el panel de control (Dashboard) web para un simulador educativo e interactivo de **Tiro Parabólico** desarrollado en Unity. 

Sirve como una herramienta analítica en tiempo real para profesores y estudiantes, permitiendo observar las estadísticas, los resultados de los tests de física y los datos cinemáticos de cada disparo realizado en el juego.

## 🎮 Juega el Simulador

Puedes probar el simulador de física 3D alojado en Itch.io desde el siguiente enlace:
[**Jugar en Itch.io - Proyecto de Física**](https://piper-ka.itch.io/proyectofisica)

## ✨ Características del Dashboard

- **Análisis en Tiempo Real:** Todos los datos (disparos y tests) se sincronizan instantáneamente desde el juego usando Firebase Firestore.
- **Métricas de Estudiantes:** Visualiza cuántos usuarios están activos, cuántos han aprobado las pruebas y dónde están teniendo dificultades.
- **Desglose de Disparos:** Analiza la velocidad inicial, ángulo, gravedad y trayectoria de los tiros realizados por los estudiantes.
- **Diseño Moderno:** Interfaz rápida, accesible y con un diseño atractivo basado en Astro, React y TailwindCSS.

## 🛠️ Tecnologías Utilizadas

- **[Astro](https://astro.build/)** - Framework web para un rendimiento ultrarrápido y renderizado de páginas estáticas.
- **[React](https://react.dev/)** - Para la interactividad de las tablas y componentes del panel de control.
- **[Tailwind CSS](https://tailwindcss.com/)** - Para el estilizado ágil de la interfaz moderna.
- **[Firebase](https://firebase.google.com/)** - Base de datos en la nube (Firestore) para almacenar la información de las físicas proveniente del juego.

## 🚀 Instalación y Desarrollo Local

Si deseas ejecutar este dashboard en tu máquina local:

1. **Clona el repositorio e instala las dependencias:**
   ```bash
   npm install
   ```

2. **Configura Firebase:**
   Asegúrate de configurar tus credenciales de Firebase en el entorno o directamente en `src/lib/firebase.js`.

3. **Inicia el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   El proyecto estará disponible en `http://localhost:4321`.

## 🧞 Comandos Útiles

| Comando                   | Acción                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Instala las dependencias del proyecto            |
| `npm run dev`             | Inicia el servidor local de desarrollo           |
| `npm run build`           | Construye el sitio para producción en `./dist/`  |
| `npm run preview`         | Previsualiza el build localmente                 |
