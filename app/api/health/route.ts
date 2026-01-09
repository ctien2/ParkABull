import { NextResponse } from 'next/server';

/**
 * Health check endpoint for cron jobs to keep the frontend service alive
 * GET /api/health
 */
export async function GET() {
  return new NextResponse("OK", { status: 200 });
}