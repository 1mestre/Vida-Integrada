# Flujo de Generación de PDF (Contratos)

Este documento describe el proceso completo para generar y descargar un contrato en PDF, un proceso que involucra tanto el frontend como el backend.

## Resumen del Flujo
1.  **Frontend**: El usuario hace clic en el botón "Contrato" en la tabla de órdenes de trabajo.
2.  **Frontend**: El cliente (navegador) envía una solicitud `POST` a un endpoint de la API del backend, incluyendo los datos del cliente y de la orden.
3.  **Backend**: La API recibe los datos, genera un documento HTML personalizado, y utiliza una librería de headless browser (Puppeteer) para "imprimir" ese HTML en un archivo PDF.
4.  **Backend**: El servidor envía el archivo PDF de vuelta al cliente con cabeceras especiales que le indican al navegador que debe descargarlo.
5.  **Frontend**: El navegador recibe la respuesta y automáticamente inicia la descarga del archivo PDF.

## Paso 1: El Frontend (`src/components/tabs/WorkTab.tsx`)
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

## Paso 2: El Backend (`src/app/api/generate-pdf/route.ts`)
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

## Puntos Clave y Decisiones de Diseño
- **Backend para Generación de PDF**: Se eligió generar el PDF en el backend porque es la única manera robusta de asegurar un formato consistente (A4, márgenes, etc.) y de forzar la descarga (`Content-Disposition`), algo que no es posible hacer de manera fiable solo con JavaScript en el cliente.
- **No JSX en el Backend**: Para evitar errores de compilación y mantener la API simple, se optó por generar el HTML como una cadena de texto en lugar de renderizar un componente de React en el servidor.
- **Librerías Específicas para Serverless**: El uso de `puppeteer-core` y `@sparticuz/chromium-min` es una decisión deliberada para garantizar la compatibilidad con plataformas de despliegue como Vercel, donde una instalación completa de Puppeteer fallaría.
