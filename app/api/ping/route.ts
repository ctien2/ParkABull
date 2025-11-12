import { NextResponse } from 'next/server';

/**
 * Simple ping endpoint for uptime monitoring
 * GET /api/ping
 */
export async function GET() {
  return NextResponse.json({
    message: 'pong',
  });
}
