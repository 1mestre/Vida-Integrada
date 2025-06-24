// src/app/api/generate-pdf/route.ts
import { NextResponse } from 'next/server';

// Función auxiliar para construir el HTML. La mantenemos separada por limpieza.
const getContractHtml = (clientName: string, date: string): string => {
  // Aquí va el HTML completo y correcto de tu contrato
  return `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>RIGHTS OF USE TRANSFER AGREEMENT</title>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700&family=Poppins:ital,wght@0,400;1,400&family=Dancing+Script:wght@400;700&display=swap" rel="stylesheet">
        <style>
          body { width: 210mm; min-height: 297mm; position: relative; background-color: #e8e5df; background-image: url("https://www.transparenttextures.com/patterns/light-paper-fibers.png"); font-family: 'Poppins', sans-serif; padding: 20mm; box-sizing: border-box; color: #333333; margin: 0 auto; overflow: hidden; }
          .main-content-wrapper { padding-bottom: 70mm; position: relative; z-index: 5; }
          .signature-font { font-family: 'Dancing Script', cursive; }
          .svg-graphics-corner { position: absolute; width: 200px; height: 200px; overflow: hidden; z-index: 0; }
          .top-left-graphics { top: 0; left: 0; transform: scaleY(-1); }
          .bottom-left-graphics { bottom: 0; left: 0; }
          .bottom-right-graphics { bottom: 0; right: 0; transform: scaleX(-1); }
          header { margin-top: 45mm; color: #105652; font-family: 'Montserrat', sans-serif; text-align: center; margin-bottom: 15mm; }
          .contact-info { position: absolute; bottom: 55mm; left: 50%; transform: translateX(-50%); text-align: center; font-family: 'Poppins', sans-serif; font-size: 11pt; color: #555555; width: fit-content; z-index: 5; }
          .contact-info p { margin: 2px 0; }
          .signature-section { position: absolute; bottom: 20mm; left: 25mm; right: 25mm; display: flex; justify-content: space-between; font-size: 10pt; z-index: 5; }
          .signature-block { flex: 0 0 45%; text-align: center; }
          .signature-block hr { border: none; border-top: 1px solid #333; width: 80%; margin: 5px auto 0 auto; }
        </style>
      </head>
      <body>
          <div class="main-content-wrapper">
             <header><h1 style="font-size: 30pt; font-weight: bold; margin: 0; letter-spacing: 1px;">RIGHTS OF USE</h1><h1 style="font-size: 30pt; font-weight: bold; margin: 0; letter-spacing: 1px;">TRANSFER AGREEMENT</h1><p style="font-size: 12pt; margin-top: 5px; letter-spacing: 2px; color: #1d5a2d;">FIVERR INSTRUMENTAL REMAKE SERVICE</p></header>
             <p style="font-size: 9pt; line-height: 1.6; color: #555555; text-align: justify;">Rights of Use Transfer Agreement ... to <strong style="color: #105652;">@${clientName}</strong> under the following terms:</p>
             {/* ... etc ... */}
          </div>
          <div class="signature-section"><div class="signature-block"><p class="signature-font" style="font-size: 40pt; margin: 0 0 5px 0; line-height: 1;">Dano</p><hr style="border-top: 1px solid #333; margin: 0 auto; width: 80%;" /><p style="margin-top: 5px;">Danodals Beats</p></div>{/* ... etc ... */}</div>
      </body>
    </html>
  `;
};

// La función principal de la API
export async function POST(request: Request) {
  try {
    const { clientName, orderNumber, date } = await request.json();
    const accessKey = process.env.APIFLASH_ACCESS_KEY;

    if (!accessKey) {
      throw new Error('ApiFlash access key is not configured in Vercel environment variables.');
    }
    if (!clientName || !orderNumber || !date) {
      return new NextResponse('Client name, order number and date are required', { status: 400 });
    }

    const html = getContractHtml(clientName, date); // Esta función no cambia

    // --- INICIO DE LA CORRECCIÓN CLAVE ---
    const apiUrl = 'https://api.apiflash.com/v1/htmltopdf'; // URL base del endpoint

    const apiResponse = await fetch(apiUrl, {
      method: 'POST', // Usamos el método POST
      headers: {
        'Content-Type': 'application/json',
      },
      // Enviamos los datos en el cuerpo de la petición, no en la URL
      body: JSON.stringify({
        access_key: accessKey,
        html: html,
        format: 'A4',
        margin: 0,
        delay: 3, // Damos 3s para que carguen fuentes, texturas, etc.
      }),
    });
    // --- FIN DE LA CORRECCIÓN ---

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      throw new Error(`ApiFlash API error (${apiResponse.status}): ${errorText}`);
    }

    const pdfBuffer = await apiResponse.arrayBuffer();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Rights Of Use - ${clientName} - #${orderNumber}.pdf"`,
      },
    });

  } catch (error: any) {
    console.error('Error in PDF generation API route:', error);
    return new NextResponse(error.message, { status: 500 });
  }
}