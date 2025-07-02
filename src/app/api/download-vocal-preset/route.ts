
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// This forces the route to be deployed as a Node.js serverful function
export const runtime = 'nodejs'; 
export const dynamic = 'force-dynamic'; // prevent caching

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientName = searchParams.get('clientName') || 'CLIENT';
    const genre = searchParams.get('genre') || 'BEAT';

    const sourceFileName = 'vocal_preset.fst';
    const filePath = path.join(process.cwd(), 'public', sourceFileName);

    // Read the file from the filesystem
    const fileBuffer = await fs.readFile(filePath);

    // Construct the dynamic download filename
    const downloadFileName = `${clientName} ${genre} Vocal Chain BY @DANODALS on Fiverr.fst`;

    const headers = new Headers();
    headers.set('Content-Type', 'application/octet-stream');
    headers.set('Content-Disposition', `attachment; filename="${downloadFileName}"`);

    return new NextResponse(fileBuffer, { status: 200, headers });

  } catch (error: any) {
    // Specifically handle file not found error
    if (error.code === 'ENOENT') {
      console.error('File not found on server:', error.path);
      return new NextResponse(`File not found on server: ${error.path}`, { status: 404 });
    }
    
    console.error('Error in download-vocal-preset API route:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
