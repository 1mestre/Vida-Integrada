// src/app/api/generate-pdf/route.ts
// src/app/api/generate-pdf/route.ts
import { NextResponse } from 'next/server';

// Función que contiene tu plantilla HTML exacta como un string.
const getContractHtml = (clientName: string, date: string): string => {
  // Esta función contiene tu plantilla HTML exacta, la que ya aprobamos.
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Rights of Use Transfer Agreement</title>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700&family=Poppins:ital,wght@0,400;1,400&family=Dancing+Script:wght@400;700&display=swap" rel="stylesheet">
      <style>
          body { width: 210mm; min-height: 297mm; position: relative; background-color: #e8e5df; background-image: url("https://www.transparenttextures.com/patterns/light-paper-fibers.png"); font-family: 'Poppins', sans-serif; padding: 20mm; box-sizing: border-box; color: #333333; margin: 0; }
          .signature-font { font-family: 'Dancing Script', cursive; }
          header { margin-top: 25mm; color: #105652; font-family: 'Montserrat', sans-serif; text-align: center; margin-bottom: 15mm; }
          .signature-section { margin-top: 30mm; display: flex; justify-content: space-between; font-size: 10pt; }
          .signature-block { flex: 0 0 45%; text-align: center; }
          .signature-block hr { border: none; border-top: 1px solid #333; width: 80%; margin: 5px auto 0 auto; }
      </style>
      </head>
      <body>
 <header>
 <h1 style="font-size: 30pt; font-weight: bold; margin: 0; letter-spacing: 1px;">RIGHTS OF USE</h1>
 <h1 style="font-size: 30pt; font-weight: bold; margin: 0; letter-spacing: 1px;">TRANSFER AGREEMENT</h1>
 <p style="font-size: 12pt; margin-top: 5px; letter-spacing: 2px; color: #1d5a2d;">FIVERR INSTRUMENTAL REMAKE SERVICE</p>
 </header>
 <hr style="border: none; border-top: 1px solid #105652; margin: 15mm 0;" />
 <p style="font-size: 9pt; line-height: 1.6; color: #555555; text-align: justify;">
 Rights of Use Transfer Agreement (Fiverr Remake Service @Danodals) Sebastián Mestre, with Fiverr username @Danodals, agree to transfer all exclusive usage rights of the music(s), instrumental(s), or beat(s) produced to <strong style="color: #105652;">@${clientName}</strong> under the following terms:
 </p>
 <div style="margin-top: 10mm; font-size: 9pt; color: #555555; space-y: 8px;">
 <p><strong>• Purpose:</strong> This agreement aims to transfer the exclusive usage rights of the beat/instrumental created by Sebastián Mestre.</p>
 <p><strong>• Scope of Transfer:</strong> The client acquires full commercial usage rights over the work, including the right to modify, distribute, and sell it without restrictions.</p>
 <p><strong>• Exclusivity Guarantee:</strong> The beat/instrumental transferred is 100% exclusive to the client, ensuring it will not be resold or distributed to third parties by Sebastián Mestre.</p>
 <p><strong>• Payment and Contract Completion:</strong> Upon full payment of the project on Fiverr, the client receives complete usage rights of the work.</p>
 <p><strong>• Duration:</strong> The transfer of rights is indefinite, with no time or territory restrictions.</p>
 </div>
 <div class="signature-section">
 <div class="signature-block">
 <p class="signature-font" style="font-size: 40pt; margin-bottom: 5px; line-height: 1;">Dano</p>
 <hr/>
 <p style="margin-top: 5px;">Danodals Beats</p>
        </div>
 <div class="signature-block">
 <div style="height: 50px;"></div>
 <hr/>
 <p style="margin-top: 5px;">CLIENT'S SIGNATURE</p>
        </div>
 </div>
          </body>
    </html>
  `;
};

export async function POST(request: Request) {
  try {
    const { clientName, orderNumber } = await request.json();
    const accessKey = process.env.APIFLASH_ACCESS_KEY;

    if (!accessKey) throw new Error('ApiFlash access key is not configured in Vercel environment variables.');
    if (!clientName || !orderNumber) return new NextResponse('Client name and order number are required', { status: 400 });

    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const html = getContractHtml(clientName, date);

    // Construye la URL de la API de ApiFlash
    const apiUrl = new URL('https://api.apiflash.com/v1/htmltopdf');
    apiUrl.searchParams.append('access_key', accessKey);
    apiUrl.searchParams.append('html', html);
    apiUrl.searchParams.append('format', 'A4');
    apiUrl.searchParams.append('delay', '2'); // Espera 2s a que carguen fuentes/imágenes

    const apiResponse = await fetch(apiUrl.toString(), { method: 'POST' });

<<<<<<< HEAD
    if (!apiResponse.ok) {
        const errorBody = await apiResponse.text();
        throw new Error(`ApiFlash responded with status ${apiResponse.status}: ${errorBody}`);
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
