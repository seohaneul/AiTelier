import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'https://craft-ai-backend-nu9o.onrender.com';

export async function POST(request: NextRequest) {
  console.log('[Proxy API] Incoming POST request to /api/auth/register');
  try {
    const body = await request.text();
    console.log('[Proxy API] Request body size:', body.length);
    
    const targetUrl = `${BACKEND_URL}/api/v1/auth/register`;
    console.log('[Proxy API] Fetching backend target:', targetUrl);

    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    
    console.log('[Proxy API] Backend response status:', res.status);
    const data = await res.text();
    console.log('[Proxy API] Backend response body preview:', data.substring(0, 100));

    return new NextResponse(data, {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('[Proxy API] Error proxying request:', error);
    return new NextResponse(JSON.stringify({ message: 'Internal Server Error in Proxy', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
