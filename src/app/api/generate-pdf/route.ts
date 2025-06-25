// src/app/api/generate-pdf/route.ts
import { NextResponse } from 'next/server';
import ReactDOMServer from 'react-dom/server';
import { AgreementTemplate } from '@/components/pdf/AgreementTemplate';
import React from 'react';

export const runtime = 'nodejs';

// Reusable function to get the full HTML content for the contract
const getContractHtml = (clientName: string, date: string) => {
  // These styles are necessary for ApiFlash to render the component correctly.
  const cssStyles = `
    body { margin: 0; padding: 0; background-color: #e8e5df; }
    .pdf-page-container { width: 210mm; min-height: 297mm; position: relative; background-color: #e8e5df; background-image: url("https://www.transparenttextures.com/patterns/light-paper-fibers.png"); font-family: 'Poppins', sans-serif; padding: 20mm; box-sizing: border-box; color: #333333; margin: 0 auto; overflow: hidden; }
    .main-content-wrapper { padding-bottom: 70mm; position: relative; z-index: 5; }
    .signature-font { font-family: 'Dancing Script', cursive; }
    .svg-graphics-corner { position: absolute; width: 200px; height: 200px; overflow: hidden; z-index: 0; }
    .top-left-graphics { top: 0; left: 0; transform: scaleY(-1); }
    .bottom-left-graphics { bottom: 0; left: 0; }
    .bottom-right-graphics { bottom: 0; right: 0; transform: scaleX(-1); }
    .contact-info { position: absolute; bottom: 55mm; left: 50%; transform: translateX(-50%); text-align: center; font-family: 'Poppins', sans-serif; font-size: 11pt; color: #555555; width: fit-content; z-index: 5; }
    .contact-info p { margin: 2px 0; }
    .signature-section { position: absolute; bottom: 20mm; left: 25mm; right: 25mm; display: flex; justify-content: space-between; font-size: 10pt; z-index: 5; }
    .signature-block { flex: 0 0 45%; text-align: center; }
    .signature-block hr { border: none; border-top: 1px solid #333; width: 80%; margin: 5px auto 0 auto; }
  `;

  // Render the React component to an HTML string using React.createElement
  const componentHtml = ReactDOMServer.renderToStaticMarkup(
    React.createElement(AgreementTemplate, { clientName, date })
  );

  // Wrap the component HTML in a full document structure with necessary headers
  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700&family=Poppins:ital,wght@0,400;0,700;1,400&family=Dancing+Script:wght@400;700&display=swap" rel="stylesheet" />
        <style>${cssStyles}</style>
      </head>
      <body>
        ${componentHtml}
      </body>
    </html>
  `;
};

export async function POST(request: Request) {
  try {
    const { clientName, orderNumber, date } = await request.json();
    const accessKey = "bc729acfd64d45a3a3dbe7bcf79fa220";

    if (!clientName || !orderNumber || !date) {
        return new NextResponse('Client name, order number, and date are required', { status: 400 });
    }
    
    // Generate the full contract HTML on the server
    const contractHtml = getContractHtml(clientName, date);
    
    // Use the ApiFlash endpoint for converting raw HTML to an image
    const apiUrl = 'https://api.apiflash.com/v1/htmltoimage';

    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_key: accessKey,
        html: contractHtml,
        format: 'png',
        full_page: 'true', // Capture the entire A4-sized component
        delay: 3, // Wait for external fonts/images to load
        no_ads: 'true',
      }),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      throw new Error(`ApiFlash API error (${apiResponse.status}): ${errorText}`);
    }

    const imageBuffer = await apiResponse.arrayBuffer();

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="Contract - ${clientName} - #${orderNumber}.png"`,
      },
    });

  } catch (error: any) {
    console.error('Error in screenshot generation API route:', error);
    return new NextResponse(error.message, { status: 500 });
  }
}
