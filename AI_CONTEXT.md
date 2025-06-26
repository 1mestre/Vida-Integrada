
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

## 5. Flujo de Generación de PDF (Contratos)

Este flujo describe el proceso completo para generar y descargar un contrato en PDF, un proceso que involucra tanto el frontend como el backend.

### Resumen del Flujo
1.  **Frontend**: El usuario hace clic en el botón "Descargar Contrato" en la tabla de órdenes de trabajo.
2.  **Frontend**: El cliente (navegador) envía una solicitud `POST` a un endpoint de la API del backend, incluyendo los datos del cliente y de la orden.
3.  **Backend**: La API recibe los datos, genera un documento HTML personalizado, y utiliza una librería de headless browser (Puppeteer) para "imprimir" ese HTML en un archivo PDF.
4.  **Backend**: El servidor envía el archivo PDF de vuelta al cliente con cabeceras especiales que le indican al navegador que debe descargarlo.
5.  **Frontend**: El navegador recibe la respuesta y automáticamente inicia la descarga del archivo PDF.

### Paso 1: El Frontend (`src/components/tabs/WorkTab.tsx`)
- **Acción del Usuario**: En la tabla de órdenes de trabajo, cada fila tiene un botón de "Contrato".
- **Función `handleGenerateContract`**:
    - Se activa al hacer clic en el botón.
    - Recopila los datos necesarios de la orden: `clientName`, `deliveryDate`, y `orderNumber`.
    - Realiza una llamada `fetch` con el método `POST` al endpoint `/api/generate-pdf`.
    - Envía los datos recopilados en el `body` de la solicitud, en formato JSON.
    - **Manejo de la Respuesta**:
        - Si la respuesta del servidor es exitosa (`response.ok`), significa que el backend ha enviado el PDF.
        - El código convierte la respuesta en un `blob` (un objeto que representa datos binarios, en este caso, el PDF).
        - Se crea una URL temporal para este blob usando `window.URL.createObjectURL()`.
        - Se crea un elemento `<a>` (un enlace) en la memoria, se le asigna la URL del blob y se establece el atributo `download` con un nombre de archivo dinámico.
        - Se simula un clic en este enlace, lo que hace que el navegador inicie la descarga del archivo.
        - Finalmente, se libera la memoria eliminando el enlace y revocando la URL del objeto.
    - **Manejo de Errores**: Si la respuesta del servidor no es exitosa, se muestra una notificación de error (`toast`).

### Paso 2: El Backend (`src/app/api/generate-pdf/route.ts`)
- **Entorno de Ejecución**: Este archivo está configurado para ejecutarse en un entorno de `nodejs` (`export const runtime = 'nodejs';`), lo que es crucial para poder usar librerías como Puppeteer.
- **Librerías Clave**:
    - `puppeteer-core`: Una versión ligera de Puppeteer.
    - `@sparticuz/chromium-min`: Un paquete que proporciona una versión mínima y compatible de Chromium, diseñada para funcionar en entornos sin servidor (serverless) como Vercel.
- **Proceso de la API**:
    - **Recepción de Datos**: La función `POST` recibe la solicitud y extrae `clientName`, `date`, y `orderNumber` del cuerpo JSON.
    - **Generación de HTML**: **No utiliza React/JSX**. En su lugar, una función auxiliar `getAgreementHtml` genera una cadena de texto (template literal) que contiene la estructura HTML completa del contrato. Los datos (`clientName`, `date`) se insertan en esta cadena. Esto evita errores de compilación de JSX en el entorno de backend.
    - **Lanzamiento de Puppeteer**: Se inicia una instancia del navegador headless (invisible) usando la configuración de Chromium proporcionada por `@sparticuz/chromium-min`.
    - **Renderizado y Creación del PDF**:
        - Se abre una nueva página en el navegador headless.
        - Se usa `page.setContent()` para cargar la cadena HTML generada.
        - Se llama a `page.pdf()` para convertir la página renderizada en un buffer de PDF. Se especifican opciones clave como `format: 'A4'` y `printBackground: true`.
    - **Envío de la Respuesta**:
        - Se crea una `Response` que contiene el buffer del PDF.
        - Se establecen dos cabeceras HTTP críticas:
            - `'Content-Type': 'application/pdf'`: Le dice al navegador que el contenido es un archivo PDF.
            - `'Content-Disposition': 'attachment; filename="..."'`: Esta es la instrucción clave que le dice al navegador que debe descargar el archivo en lugar de intentar mostrarlo, y le proporciona un nombre de archivo sugerido.

### Puntos Clave y Decisiones de Diseño
- **Backend para Generación de PDF**: Se eligió generar el PDF en el backend porque es la única manera robusta de asegurar un formato consistente (A4, márgenes, etc.) y de forzar la descarga (`Content-Disposition`), algo que no es posible hacer de manera fiable solo con JavaScript en el cliente.
- **No JSX en el Backend**: Para evitar errores de compilación y mantener la API simple, se optó por generar el HTML como una cadena de texto en lugar de renderizar un componente de React en el servidor.
- **Librerías Específicas para Serverless**: El uso de `puppeteer-core` y `@sparticuz/chromium-min` es una decisión deliberada para garantizar la compatibilidad con plataformas de despliegue como Vercel, donde una instalación completa de Puppeteer fallaría.
