
// src/app/api/generate-pdf/route.ts
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { clientName, orderNumber, date } = await request.json();
    const accessKey = "bc729acfd64d45a3a3dbe7bcf79fa220";

    if (!clientName || !orderNumber || !date) {
        return new NextResponse('Client name, order number, and date are required', { status: 400 });
    }
    
    // Determine the base URL dynamically for Vercel or use a localhost fallback.
    const host = request.headers.get('host');
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // Construct the public URL for the contract preview page.
    const contractUrl = new URL(`/pdf-preview/${orderNumber}`, baseUrl);
    contractUrl.searchParams.set('clientName', clientName);
    contractUrl.searchParams.set('date', date);
    
    // Construct the ApiFlash URL.
    const apiFlashUrl = new URL('https://api.apiflash.com/v1/urltoimage');
    apiFlashUrl.searchParams.set('access_key', accessKey);
    apiFlashUrl.searchParams.set('url', contractUrl.toString());
    apiFlashUrl.searchParams.set('format', 'png');
    apiFlashUrl.searchParams.set('full_page', 'true');
    apiFlashUrl.searchParams.set('delay', '2'); // Wait for fonts/images to load
    apiFlashUrl.searchParams.set('no_ads', 'true');

    const apiResponse = await fetch(apiFlashUrl.toString(), {
      method: 'GET',
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
