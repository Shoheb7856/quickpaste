import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentTime, isPasteUnavailable, getRemainingViews } from '@/lib/utils';

// GET /api/pastes/:id - Get a paste by ID
export async function GET(request, { params }) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { error: 'Paste ID is required' },
                { status: 400 }
            );
        }

        // Find the paste
        const paste = await prisma.paste.findUnique({
            where: { slug: id },
        });

        // Paste not found
        if (!paste) {
            return NextResponse.json(
                { error: 'Paste not found' },
                { status: 404 }
            );
        }

        // Get current time (supports TEST_MODE)
        const currentTime = getCurrentTime(request);

        // Check if paste is unavailable (expired or view limit exceeded)
        if (isPasteUnavailable(paste, currentTime)) {
            return NextResponse.json(
                { error: 'Paste not found' },
                { status: 404 }
            );
        }

        // Increment view count BEFORE returning
        const updatedPaste = await prisma.paste.update({
            where: { id: paste.id },
            data: { viewCount: { increment: 1 } },
        });

        // Calculate remaining views after this view
        const remainingViews = updatedPaste.maxViews
            ? Math.max(0, updatedPaste.maxViews - updatedPaste.viewCount)
            : null;

        // Format expires_at as ISO string or null
        const expiresAt = updatedPaste.expiresAt
            ? updatedPaste.expiresAt.toISOString()
            : null;

        return NextResponse.json({
            content: updatedPaste.content,
            remaining_views: remainingViews,
            expires_at: expiresAt,
        }, { status: 200 });

    } catch (error) {
        console.error('Error fetching paste:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
