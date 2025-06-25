
// src/app/pdf-preview/[orderNumber]/page.tsx
import { AgreementTemplate } from '@/components/pdf/AgreementTemplate';
import React from 'react';

// This ensures the page is always dynamically rendered on the server with the latest search parameters.
export const dynamic = 'force-dynamic';

// This page component renders the contract as a self-contained, clean HTML page.
// It's designed to be called by the ApiFlash service for screenshotting.
export default function ContractPreviewPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const clientName = typeof searchParams.clientName === 'string' ? searchParams.clientName : 'Client';
  const date = typeof searchParams.date === 'string' ? searchParams.date : new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });

  // CSS styles are defined here and injected into the page's <head>.
  // This makes the HTML self-contained, so ApiFlash can render it correctly without needing external CSS files.
  const cssStyles = `
    body {
      margin: 0;
      padding: 0;
      background-color: #e8e5df;
    }
    .pdf-page-container {
      width: 210mm;
      min-height: 297mm;
      position: relative;
      background-color: #e8e5df;
      background-image: url("https://www.transparenttextures.com/patterns/light-paper-fibers.png");
      font-family: 'Poppins', sans-serif;
      padding: 20mm;
      box-sizing: border-box;
      color: #333333;
      margin: 0 auto;
      overflow: hidden;
    }
    .main-content-wrapper {
      padding-bottom: 70mm;
      position: relative;
      z-index: 5;
    }
    .signature-font {
      font-family: 'Dancing Script', cursive;
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
    .contact-info {
      position: absolute;
      bottom: 55mm;
      left: 50%;
      transform: translateX(-50%);
      text-align: center;
      font-family: 'Poppins', sans-serif;
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
  `;

  return (
    <html>
      <head>
        <title>Contract Preview - {clientName}</title>
        <meta charSet="utf-8" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700&family=Poppins:ital,wght@0,400;0,700;1,400&family=Dancing+Script:wght@400;700&display=swap" rel="stylesheet" />
        <style>{cssStyles}</style>
      </head>
      <body>
        <AgreementTemplate clientName={clientName} date={date} />
      </body>
    </html>
  );
}
