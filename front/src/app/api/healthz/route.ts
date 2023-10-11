import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { message: 'Service is healthy.', uptime: process.uptime() },
    { status: 200 },
  );
}
