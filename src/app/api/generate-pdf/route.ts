// src/app/api/generate-pdf/route.ts
import { NextResponse } from 'next/server';

// This function is not used in the diagnostic version but is kept for future restoration.
const getContractHtml = (clientName: string, date: string): string => {
  return `...`; // HTML content omitted for brevity
};

export async function POST(request: Request) {
  try {
    const { clientName, orderNumber } = await request.json();
    const accessKey = "bc729acfd64d45a3a3dbe7bcf79fa220";
    
    // --- DIAGNOSTIC LOGIC ---
    // Instead of using local HTML, we use a public URL to test the API.
    const urlToScreenshot = 'https://google.com';
    
    const params = new URLSearchParams();
    params.append('access_key', accessKey);
    params.append('url', urlToScreenshot);
    params.append('format', 'png'); // We request a PNG image for this test.

    const apiUrl = `https://api.apiflash.com/v1/urltoimage?${params.toString()}`;

    const apiResponse = await fetch(apiUrl, {
      method: 'GET', // The urltoimage endpoint often works best with GET.
    });
    // --- END DIAGNOSTIC LOGIC ---

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      throw new Error(`ApiFlash API error (${apiResponse.status}): ${errorText}`);
    }

    const imageBuffer = await apiResponse.arrayBuffer();

    // We return an image instead of a PDF for this test.
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="test-screenshot-for-${clientName}-${orderNumber}.png"`,
      },
    });

  } catch (error: any) {
    console.error('Error in screenshot generation API route:', error);
    return new NextResponse(error.message, { status: 500 });
  }
}
