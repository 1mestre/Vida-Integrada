
// Ruta: src/app/api/generate-pdf/route.ts
import { NextResponse } from 'next/server';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

// Importante: le decimos a Vercel que use el entorno Node.js, que es más compatible.
export const runtime = 'nodejs';

// Helper function to generate the HTML string, avoiding JSX in this file.
// This version is simplified to be self-contained and avoid external network requests for debugging.
const getAgreementHtml = (clientName: string, date: string): string => {
  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Acuerdo de Transferencia de Derechos de Uso</title>
      <style>
          .pdf-page-container {
              width: 210mm;
              min-height: 297mm;
              position: relative;
              background-color: #e8e5df; /* Removed background-image */
              font-family: sans-serif; /* Using safe font */
              padding: 20mm;
              box-sizing: border-box;
              color: #333333;
              margin: 0 auto;
              overflow: hidden;
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
          }
          .main-content-wrapper {
              padding-bottom: 50mm;
              position: relative;
              z-index: 5;
          }
          .signature-font {
              font-family: cursive; /* Safe fallback */
          }
          .fiverr-logo-container {
              display: none; /* Hide logo container for debugging */
          }
          .svg-graphics-corner {
              position: absolute;
              width: 200px;
              height: 200px;
              overflow: hidden;
              z-index: 0;
          }
          .top-left-graphics {
              top: 0;
              left: 0;
              transform: scaleY(-1);
          }
          .bottom-left-graphics {
              bottom: 0;
              left: 0;
          }
          .bottom-right-graphics {
              bottom: 0;
              right: 0;
              transform: scaleX(-1);
          }
          header {
              margin-top: 35mm;
              color: #105652;
              font-family: sans-serif; /* Safe font */
              text-align: center;
              margin-bottom: 15mm;
          }
          .contact-info {
              position: absolute;
              bottom: 55mm;
              left: 50%;
              transform: translateX(-50%);
              text-align: center;
              font-family: sans-serif; /* Safe font */
              font-size: 11pt;
              color: #555555;
              width: fit-content;
              z-index: 5;
          }
          .contact-info p {
              margin: 2px 0;
          }
          .signature-section {
              position: absolute;
              bottom: 20mm;
              left: 25mm;
              right: 25mm;
              display: flex;
              justify-content: space-between;
              font-size: 10pt;
              z-index: 5;
          }
          .signature-block {
              flex: 0 0 45%;
              text-align: center;
          }
          .signature-block hr {
              border: none;
              border-top: 1px solid #333;
              width: 80%;
              margin: 5px auto 0 auto;
          }
          @media print {
              html, body {
                  margin: 0 !important;
                  padding: 0 !important;
                  height: auto !important;
              }
              @page {
                  size: A4;
                  margin: 0;
              }
              .pdf-page-container {
                  margin: 0 !important;
                  padding: 20mm !important;
                  box-shadow: none !important;
                  border: none !important;
                  background-color: #e8e5df !important;
                  -webkit-print-color-adjust: exact !important;
                  color-adjust: exact !important;
              }
          }
      </style>
  </head>
  <body>
      <div class="pdf-page-container">
          <div class="svg-graphics-corner top-left-graphics">
              <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 0 C 100 0, 200 100, 200 200 L 0 200 Z" fill="#1d5a2d" opacity="0.4"/>
                  <path d="M0 0 C 80 0, 160 80, 160 160 L 0 160 Z" fill="#105652" opacity="0.4"/>
                  <path d="M0 0 C 60 0, 120 60, 120 120 L 0 120 Z" fill="#588157" opacity="0.4"/>
              </svg>
          </div>
          <div class="svg-graphics-corner bottom-left-graphics">
              <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 0 C 100 0, 200 100, 200 200 L 0 200 Z" fill="#1d5a2d" opacity="0.4"/>
                  <path d="M0 0 C 80 0, 160 80, 160 160 L 0 160 Z" fill="#105652" opacity="0.4"/>
                  <path d="M0 0 C 60 0, 120 60, 120 120 L 0 120 Z" fill="#588157" opacity="0.4"/>
              </svg>
          </div>
          <div class="svg-graphics-corner bottom-right-graphics">
              <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 0 C 100 0, 200 100, 200 200 L 0 200 Z" fill="#1d5a2d" opacity="0.4"/>
                  <path d="M0 0 C 80 0, 160 80, 160 160 L 0 160 Z" fill="#105652" opacity="0.4"/>
                  <path d="M0 0 C 60 0, 120 60, 120 120 L 0 120 Z" fill="#588157" opacity="0.4"/>
              </svg>
          </div>
          <div class="fiverr-logo-container">
              <!-- Logo removed for debugging -->
          </div>
          <div class="main-content-wrapper">
              <header>
                  <h1 style="font-size: 30pt; font-weight: bold; margin: 0; letter-spacing: 1px;">RIGHTS OF USE</h1>
                  <h1 style="font-size: 30pt; font-weight: bold; margin: 0; letter-spacing: 1px;">TRANSFER AGREEMENT</h1>
                  <p style="font-size: 12pt; margin-top: 5px; letter-spacing: 2px; color: #1d5a2d;">FIVERR INSTRUMENTAL REMAKE SERVICE</p>
              </header>
              <hr style="border: none; border-top: 1px solid #105652; margin: 15mm 0;" />
              <table style="width: 100%; border-collapse: collapse; font-size: 10pt; margin-bottom: 15mm;">
                  <tbody>
                      <tr>
                          <td style="padding: 8px 0;"><strong>Services from</strong></td><td style="padding: 8px 0;">@danodals</td><td style="padding: 8px 0;"><strong>Contact</strong></td>
                      </tr>
                      <tr>
                          <td style="padding: 8px 0;"><strong>Date</strong></td><td style="padding: 8px 0; font-family: sans-serif;">${date}</td><td style="padding: 8px 0;">danodalbeats@gmail.com</td>
                      </tr>
                  </tbody>
              </table>
              <h3 style="font-size: 15.18pt; color: #105652; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10mm; font-weight: bold;">
                  Digital Services Contract
              </h3>
              <p style="font-size: 9pt; lineHeight: 1.6; color: #555555; text-align: justify;">
                  Rights of Use Transfer Agreement (Fiverr Remake Service @danodals) Sebastián Mestre, with Fiverr username @danodals, agree to transfer all exclusive usage rights of the music(s), instrumental(s), or beat(s) produced to <strong style="color: #105652;">@${clientName}</strong> under the following terms:
              </p>
              <div style="margin-top: 10mm; font-size: 9pt; color: #555555;">
                  <p style="margin-top: 8px;"><strong>• Purpose:</strong> This agreement aims to transfer the exclusive usage rights of the beat/instrumental created by Sebastián Mestre.</p>
                  <p style="margin-top: 8px;"><strong>• Scope of Transfer:</strong> The client acquires full commercial usage rights over the work, including the right to modify, distribute, and sell it without restrictions, while respecting the moral rights of the author.</p>
                  <p style="margin-top: 8px;"><strong>• Exclusivity Guarantee:</strong> The beat/instrumental transferred is 100% exclusive to the client, ensuring it will not be resold or distributed to third parties by Sebastián Mestre.</p>
                  <p style="margin-top: 8px;"><strong>• Payment and Contract Completion:</strong> Upon full payment of the project on Fiverr, the client receives complete usage rights of the work.</p>
                  <p style="margin-top: 8px;"><strong>• Duration:</strong> The transfer of rights is indefinite, with no time or territory restrictions.</p>
              </div>
          </div>
          <div class="contact-info">
              <p>fiverr.com/danodals</p>
              <p>(+57) 3223238670</p>
              <p>Bogotá, Colombia</p>
          </div>
          <div class="signature-section">
              <div class="signature-block">
                  <p class="signature-font" style="font-size: 40pt; margin: 0 0 5px 0; line-height: 1;">Dano</p>
                  <hr style="border: none; border-top: 1px solid #333; width: 80%; margin: 0 auto;" />
                  <p style="margin-top: 5px;">Danodals Beats</p>
              </div>
              <div class="signature-block">
                  <div style="width: 150px; height: 50px; margin: 0 auto;"></div>
                  <hr style="border: none; border-top: 1px solid #333; width: 80%; margin: 0 auto;" />
                  <p style="margin-top: 5px;">CLIENT'S SIGNATURE</p>
              </div>
          </div>
      </div>
  </body>
  </html>
  `;
};

export async function POST(req: Request) {
  try {
    const { clientName, date, orderNumber } = await req.json();

    // 1. Generate the HTML string using the helper function
    const html = getAgreementHtml(clientName, date);

    // 2. Iniciamos el navegador invisible
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    // 3. Renderizamos el HTML y creamos el PDF
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
    });

    await browser.close();

    // 4. Devolvemos el PDF al navegador del usuario para que lo descargue
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Rights Of Use - ${clientName} - #${orderNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Detalle del servidor: ${errorMessage}` }, { status: 500 });
  }
}
