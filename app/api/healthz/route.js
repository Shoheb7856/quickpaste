import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/healthz - Health check endpoint
export async function GET() {
    try {
        // Check database connectivity by running a simple query
        await prisma.$queryRaw`SELECT 1`;

        return NextResponse.json(
            { ok: true },
            { status: 200 }
        );
    } catch (error) {
        console.error('Health check failed:', error);
        return NextResponse.json(
            { ok: false, error: 'Database connection failed' },
            { status: 503 }
        );
    }
}
