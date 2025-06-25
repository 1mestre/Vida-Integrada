
// Ruta: src/app/api/generate-pdf/route.ts
import { NextResponse } from 'next/server';
import { renderToString } from 'react-dom/server';
import chromium from '@sparticuz/chromium-min';
import puppeteer from 'puppeteer-core';
import { AgreementTemplate } from '@/components/pdf/AgreementTemplate';

// Importante: le decimos a Vercel que use el entorno Node.js, que es más compatible.
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { clientName, date, orderNumber } = await req.json();

    // 1. Convertimos el componente React en un string de HTML puro
    const html = renderToString(
      <AgreementTemplate clientName={clientName} date={date} />
    );

    // 2. Iniciamos el navegador invisible
    const browser = await puppeteer.launch({
      args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
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
    return NextResponse.json({ error: 'No se pudo generar el PDF.' }, { status: 500 });
  }
}
