import {NextRequest, NextResponse} from 'next/server';

export async function GET(request: NextRequest) {
  const {searchParams} = new URL(request.url);
  const fileUrl = searchParams.get('url');

  if (!fileUrl) {
    return new NextResponse('Missing file URL', {status: 400});
  }
  
  // Basic validation that the URL is an R2 URL to prevent this becoming an open proxy
  const r2PublicUrl = process.env.R2_PUBLIC_URL;
  if (!r2PublicUrl || !fileUrl.startsWith(r2PublicUrl)) {
     return new NextResponse('Invalid file domain', {status: 403});
  }

  try {
    const response = await fetch(fileUrl);

    if (!response.ok) {
      return new NextResponse('Failed to fetch file from storage', {
        status: response.status,
      });
    }
    
    // Get the raw data as a blob
    const blob = await response.blob();
    
    // Create new headers, setting the content-type from the fetched file
    const headers = new Headers();
    headers.set('Content-Type', blob.type);
    
    // Return the file data
    return new NextResponse(blob, {status: 200, headers});
  } catch (error) {
    console.error('Error proxying R2 file:', error);
    return new NextResponse('Internal server error', {status: 500});
  }
}
