
# Contexto del Proyecto: Vida Integrada (Organizador Personal)

## 1. Resumen General

**Vida Integrada** es una aplicación web de organización personal diseñada para ser compartida, funcionando como un "dashboard" de vida. Permite a los usuarios gestionar de forma centralizada su calendario, finanzas, horario académico y tareas de productividad. La aplicación está construida para ser altamente interactiva, con un diseño inspirado en la estética de iOS y con sincronización de datos en tiempo real a través de Firebase.

### Objetivos Clave:
- **Centralización:** Unificar múltiples aspectos de la organización personal en una sola interfaz.
- **Sincronización en Tiempo Real:** Los datos se guardan y actualizan instantáneamente en todos los dispositivos o para todos los usuarios que compartan el acceso, gracias a Firebase Firestore.
- **Interfaz Moderna y Reactiva:** Ofrecer una experiencia de usuario fluida y estéticamente agradable, con animaciones y un diseño limpio.
- **Productividad:** Incorporar herramientas específicas como un temporizador Pomodoro, un gestor de tareas y sonidos ambientales para ayudar a la concentración.

## 2. Pila Tecnológica (Tech Stack)

- **Framework Principal:** Next.js (con App Router)
- **Lenguaje:** TypeScript
- **Librería UI:** React
- **Estilos:** Tailwind CSS
- **Componentes UI:** ShadCN UI (una colección de componentes Radix UI y Tailwind CSS)
- **Animaciones:** Framer Motion
- **Calendario:** FullCalendar.js
- **Base de Datos:** Google Firebase (Firestore para la base de datos en tiempo real)
- **Funcionalidad AI (Potencial):** Genkit (actualmente inicializado pero sin flujos implementados)

## 3. Arquitectura y Flujo de Datos

El núcleo de la aplicación es su **gestión de estado centralizada y reactiva**, impulsada por React Context y Firebase.

1.  **`AppStateContext.tsx`**: Este es el cerebro de la aplicación.
    -   Establece una conexión en tiempo real con un único documento en Firestore: `organizador-publico/datos-compartidos`.
    -   Utiliza el hook `onSnapshot` de Firebase para "escuchar" cualquier cambio en ese documento.
    -   Cuando los datos cambian en el servidor, el `context` actualiza su estado local.
    -   Todos los componentes que consumen este `context` (a través del hook `useAppState`) se re-renderizan automáticamente con los nuevos datos.

2.  **Interacción del Usuario y Actualización de Datos**:
    -   Cuando un usuario realiza una acción que modifica el estado (ej: añade un nuevo evento al calendario, registra un ingreso), se llama a la función `setAppState` del contexto.
    -   `setAppState` realiza una **actualización optimista**: primero actualiza el estado local en el cliente para que la UI responda instantáneamente.
    -   Inmediatamente después, envía el objeto de estado completo y actualizado de vuelta al documento de Firestore.
    -   Este guardado en Firestore propaga el cambio a todos los demás clientes conectados, manteniendo la sincronización.

## 4. Descripción Detallada de Archivos

### `src/app/` - Ruteo y Vistas Principales

-   `page.tsx`: La página de inicio y el componente principal. Contiene la lógica para renderizar las cuatro pestañas principales ('Calendario', 'Ingresos', 'Universidad', 'Productividad'). Utiliza `React.lazy` para cargar los componentes de cada pestaña de forma diferida, mejorando el rendimiento inicial.
-   `layout.tsx`: El layout raíz de la aplicación. Configura la estructura HTML, aplica la fuente `Manrope`, el tema oscuro por defecto, e incluye el componente `Toaster` para notificaciones.
-   `globals.css`: El archivo CSS global. Define las variables de color para el tema (inspirado en iOS), las clases de utilidad de Tailwind CSS y animaciones personalizadas como `glassmorphism-card`.

### `src/context/` - Gestión de Estado

-   `AppStateContext.tsx`: Como se describió anteriormente, maneja toda la lógica de estado compartido y la sincronización con Firebase. Define la estructura de datos para `contributions` (ingresos), `monthlyTargets` (metas mensuales), `timetableData` (horario) y `calendarEventsData` (eventos del calendario).

### `src/components/` - Componentes Reutilizables

-   **`tabs/`**: Contiene los componentes para cada una de las pestañas principales.
    -   `CalendarTab.tsx`: Muestra el `FullCalendar` y widgets de progreso para el año, mes y día. Permite crear y ver eventos.
    -   `IncomeTab.tsx`: Un dashboard financiero. Permite registrar ingresos (USD o COP), establecer metas mensuales y ver un historial. Realiza una llamada a una API externa para obtener la tasa de cambio.
    -   `UniversityTab.tsx`: Renderiza un horario semanal visualmente atractivo usando CSS Grid. Los eventos se posicionan dinámicamente según el día y la hora.
    -   `ProductivityTab.tsx`: Un contenedor para las herramientas de productividad, incluyendo el temporizador, el gestor de tareas y el reproductor de sonidos.

-   **`productivity/`**: Componentes específicos para la pestaña de productividad.
    -   `PomodoroTimer.tsx`: Un temporizador Pomodoro con ciclos de trabajo y descanso.
    -   `TaskManager.tsx`: Un tablero Kanban con funcionalidad de arrastrar y soltar.
    -   `AmbiancePlayer.tsx`: Utiliza la **Web Audio API** para generar o reproducir sonidos de fondo, gestionando nodos de audio para controlar la reproducción y el volumen.

-   **`ui/`**: La colección de componentes de ShadCN (Button, Card, Input, etc.). Son los bloques de construcción básicos de la interfaz.

-   `EventModal.tsx`: Un formulario modal que se reutiliza para crear y editar eventos tanto en el `CalendarTab` como en el `UniversityTab`.
-   `FullCalendar.tsx`: Un componente envoltorio (wrapper) para la librería `FullCalendar.js`, adaptándola al ecosistema de React.
-   `FloatingEmojis.tsx`: Un componente puramente decorativo que crea un efecto de emojis flotantes.

### `src/lib/` - Lógica de Soporte

-   `firebase.ts`: Inicializa y configura la conexión con Firebase. Exporta las instancias de `db` (Firestore) y `auth`.
-   `utils.ts`: Contiene la función de utilidad `cn` para combinar clases de Tailwind CSS de forma segura.

### `src/ai/` - Funcionalidad de IA

-   `genkit.ts`: Inicializa Genkit con el plugin de Google AI. Define el modelo por defecto a usar.
-   `dev.ts`: Archivo destinado a registrar los flujos de Genkit para el entorno de desarrollo. Actualmente vacío.

### Archivos de Configuración Raíz

-   `package.json`: Define los scripts (`dev`, `build`, etc.) y lista todas las dependencias del proyecto.
-   `tailwind.config.ts`: Configura Tailwind CSS, incluyendo la extensión del tema con los colores personalizados y la fuente.
-   `next.config.ts`: Configuración de Next.js.
-   `tsconfig.json`: Configuración del compilador de TypeScript.
-   `components.json`: Archivo de configuración para ShadCN UI.
