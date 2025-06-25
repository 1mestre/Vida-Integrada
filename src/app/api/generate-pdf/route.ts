// VERSION FINAL 2.0 - Reconstrucción Limpia
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
        <div class="svg-graphics-corner top-left-graphics"><svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0 C 100 0, 200 100, 200 200 L 0 200 Z" fill="#1d5a2d" opacity="0.4"/><path d="M0 0 C 80 0, 160 80, 160 160 L 0 160 Z" fill="#105652" opacity="0.4"/><path d="M0 0 C 60 0, 120 60, 120 120 L 0 120 Z" fill="#588157" opacity="0.4"/></svg></div>
        <div class="svg-graphics-corner bottom-left-graphics"><svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0 C 100 0, 200 100, 200 200 L 0 200 Z" fill="#1d5a2d" opacity="0.4"/><path d="M0 0 C 80 0, 160 80, 160 160 L 0 160 Z" fill="#105652" opacity="0.4"/><path d="M0 0 C 60 0, 120 60, 120 120 L 0 120 Z" fill="#588157" opacity="0.4"/></svg></div>
        <div class="svg-graphics-corner bottom-right-graphics"><svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0 C 100 0, 200 100, 200 200 L 0 200 Z" fill="#1d5a2d" opacity="0.4"/><path d="M0 0 C 80 0, 160 80, 160 160 L 0 160 Z" fill="#105652" opacity="0.4"/><path d="M0 0 C 60 0, 120 60, 120 120 L 0 120 Z" fill="#588157" opacity="0.4"/></svg></div>
        <div class="main-content-wrapper">
             <header><h1 style="font-size: 30pt; font-weight: bold; margin: 0; letter-spacing: 1px;">RIGHTS OF USE</h1><h1 style="font-size: 30pt; font-weight: bold; margin: 0; letter-spacing: 1px;">TRANSFER AGREEMENT</h1><p style="font-size: 12pt; margin-top: 5px; letter-spacing: 2px; color: #1d5a2d;">FIVERR INSTRUMENTAL REMAKE SERVICE</p></header>
             <hr style="border: none; border-top: 1px solid #105652; margin: 15mm 0;" />
             <table style="width: 100%; border-collapse: collapse; font-size: 10pt; margin-bottom: 15mm;"><tbody><tr><td style="padding: 8px 0;"><strong>Services from</strong></td><td style="padding: 8px 0;">@Danodals</td><td style="padding: 8px 0;"><strong>Contact</strong></td></tr><tr><td style="padding: 8px 0;"><strong>Date</strong></td><td style="padding: 8px 0;">${date}</td><td style="padding: 8px 0;">danodalbeats@gmail.com</td></tr></tbody></table>
             <h3 style="font-size: 13.2pt; color: #105652; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10mm; font-weight: bold;">Digital Services Contract</h3>
             <p style="font-size: 9pt; line-height: 1.6; color: #555555; text-align: justify;">Rights of Use Transfer Agreement (Fiverr Remake Service @Danodals) Sebastián Mestre, with Fiverr username @Danodals, agree to transfer all exclusive usage rights of the music(s), instrumental(s), or beat(s) produced to <strong style="color: #105652;">@${clientName}</strong> under the following terms:</p>
             <div style="margin-top: 10mm; font-size: 9pt; color: #555555;"><p style="margin-top: 8px;"><strong>• Purpose:</strong> This agreement aims to transfer the exclusive usage rights of the beat/instrumental created by Sebastián Mestre.</p><p style="margin-top: 8px;"><strong>• Scope of Transfer:</strong> The client acquires full commercial usage rights over the work, including the right to modify, distribute, and sell it without restrictions, while respecting the moral rights of the author.</p><p style="margin-top: 8px;"><strong>• Exclusivity Guarantee:</strong> The beat/instrumental transferred is 100% exclusive to the client, ensuring it will not be resold or distributed to third parties by Sebastián Mestre.</p><p style="margin-top: 8px;"><strong>• Payment and Contract Completion:</strong> Upon full payment of the project on Fiverr, the client receives complete usage rights of the work.</p><p style="margin-top: 8px;"><strong>• Duration:</strong> The transfer of rights is indefinite, with no time or territory restrictions.</p></div>
        </div>
        <div class="contact-info"><p>fiverr.com</p><p>(+57) 3223238670</p><p>Bogotá, Colombia</p></div>
        <div class="signature-section"><div class="signature-block"><p class="signature-font" style="font-size: 40pt; margin: 0 0 5px 0; line-height: 1;">Dano</p><hr style="border-top: 1px solid #333; margin: 0 auto; width: 80%;" /><p style="margin-top: 5px;">Danodals Beats</p></div><div class="signature-block"><div style="height: 50px; margin: 0 auto; width: 150px;"></div><hr style="border-top: 1px solid #333; margin: 0 auto; width: 80%;" /><p style="margin-top: 5px;">CLIENT'S SIGNATURE</p></div></div>
    </body>
    </html>
  `;
};

// La función principal de la API
export async function POST(request: Request) {
  try {
    const accessKey = process.env.APIFLASH_ACCESS_KEY;

    if (!accessKey) {
      throw new Error('ApiFlash access key not found in server environment.');
    }

    const { clientName, orderNumber, date } = await request.json();

    if (!clientName || !orderNumber || !date) {
      return new NextResponse('Client name, order number, and date are required', { status: 400 });
    }

    const html = getContractHtml(clientName, date);

    const apiUrl = 'https://api.apiflash.com/v1/htmltopdf';

    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_key: accessKey,
        html: html,
        format: 'A4',
        margin: 0,
        delay: 3,
      }),
    });

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