import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'https://craftai-backend.onrender.com';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const res = await fetch(`${BACKEND_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  const data = await res.text();
  return new NextResponse(data, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
