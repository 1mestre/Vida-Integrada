// src/app/api/generate-pdf/route.ts
import { NextResponse } from 'next/server';

const getContractHtml = (clientName: string, date: string): string => {
  const fontUrl = "https://fonts.googleapis.com/css2?family=Montserrat:wght@700&family=Poppins:ital,wght@0,400;1,400&family=Dancing+Script:wght@400;700&display=swap";

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>RIGHTS OF USE TRANSFER AGREEMENT</title>
      <link href="${fontUrl}" rel="stylesheet">
      <style>
        body { 
          width: 210mm; 
          height: 297mm; 
          font-family: 'Poppins', sans-serif; 
          color: #333333; 
          margin: 0; 
          padding: 20mm; 
          box-sizing: border-box;
          background-color: #FEFEFE;
        }
        main { font-size: 11pt; line-height: 1.6; }
        header { 
          text-align: center; 
          margin-bottom: 1.5cm; 
          border-bottom: 2px solid #EEEEEE; 
          padding-bottom: 0.5cm; 
        }
        h1 { 
          font-family: 'Montserrat', sans-serif; 
          font-size: 28pt; 
          font-weight: 700; 
          color: #111; 
          margin: 0; 
        }
        h2 { 
          font-family: 'Montserrat', sans-serif; 
          font-size: 22pt; 
          font-weight: 700; 
          color: #444; 
          margin: 5px 0 0 0; 
        }
        header p { 
          font-size: 10pt; 
          color: #666; 
          margin-top: 5px; 
        }
        table { 
          width: 100%; 
          margin-bottom: 1.5cm; 
          border-collapse: collapse; 
        }
        td { padding: 4px 0; }
        .label { font-weight: bold; }
        footer { 
          position: absolute; 
          bottom: 2cm; 
          left: 2cm; 
          right: 2cm; 
          display: flex; 
          justify-content: space-between; 
          align-items: flex-end;
          font-size: 10pt; 
        }
        .signature-block { 
          width: 40%; 
          text-align: center; 
        }
        .signature-line { 
          font-family: 'Dancing Script', cursive; 
          font-size: 28pt; 
          height: 40px;
          padding-bottom: 5px; 
        }
        .signature-hr { 
          border: 0; 
          border-top: 1px solid #333; 
          margin-top: 2px; 
        }
        .signature-title { 
          font-weight: bold; 
          font-size: 9pt; 
        }
      </style>
    </head>
    <body>
        <header>
            <h1>RIGHTS OF USE</h1>
            <h2>TRANSFER AGREEMENT</h2>
            <p>FIVERR INSTRUMENTAL REMAKE SERVICE</p>
        </header>
        <main>
            <table>
                <tbody>
                    <tr>
                        <td class="label">Services from:</td>
                        <td>@Danodals</td>
                        <td class="label">Contact:</td>
                        <td>danodalbeats@gmail.com</td>
                    </tr>
                    <tr>
                        <td class="label">Date:</td>
                        <td>${date}</td>
                        <td></td>
                        <td></td>
                    </tr>
                </tbody>
            </table>
            <h3 style="font-size: 14pt; font-weight: bold; margin-bottom: 1rem;">Digital Services Contract</h3>
            <p style="text-align: justify; margin-bottom: 1cm;">
                Rights of Use Transfer Agreement (Fiverr Remake Service @Danodals) Sebastián Mestre, with Fiverr username @Danodals, agree to transfer all exclusive usage rights of the music(s), instrumental(s), or beat(s) produced to <strong style="font-weight: bold;">@${clientName}</strong> under the following terms:
            </p>
            <div class="terms">
                <p><strong>• Purpose:</strong> This agreement aims to transfer the exclusive usage rights of the beat/instrumental created by Sebastián Mestre.</p>
                <p><strong>• Scope of Transfer:</strong> The client acquires full commercial usage rights over the work, including the right to modify, distribute, and sell it without restrictions, while respecting the moral rights of the author.</p>
                <p><strong>• Exclusivity Guarantee:</strong> The beat/instrumental transferred is 100% exclusive to the client, ensuring it will not be resold or distributed to third parties by Sebastián Mestre.</p>
                <p><strong>• Payment and Contract Completion:</strong> Upon full payment of the project on Fiverr, the client receives complete usage rights of the work.</p>
                <p><strong>• Duration:</strong> The transfer of rights is indefinite, with no time or territory restrictions.</p>
            </div>
        </main>
        <footer>
            <div class="signature-block">
                <div class="signature-line">Dano</div>
                <hr class="signature-hr" />
                <p class="signature-title">Danodals Beats</p>
            </div>
            <div class="signature-block">
                <div class="signature-line"></div>
                <hr class="signature-hr" />
                <p class="signature-title">CLIENT'S SIGNATURE</p>
            </div>
        </footer>
    </body>
    </html>
  `;
};

export async function POST(request: Request) {
  try {
    const { clientName, orderNumber, date } = await request.json();
    const accessKey = "1f59247d762f4e32841f3d43c9657519";

    if (!accessKey) {
      return new NextResponse('ApiFlash access key is not available.', { status: 500 });
    }
    if (!clientName || !orderNumber || !date) {
      return new NextResponse('Client, order number, and date are required', { status: 400 });
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
        delay: 2, 
      }),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error(`ApiFlash Error: ${errorText}`);
      throw new Error(`ApiFlash API error (${apiResponse.status})`);
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

export const runtime = 'edge';
