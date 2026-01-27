import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isPasteExpired } from '@/lib/utils';

// GET /api/pastes/[slug] - Get a paste by slug
export async function GET(request, { params }) {
    try {
        const { slug } = await params;

        if (!slug) {
            return NextResponse.json(
                { error: 'Slug is required' },
                { status: 400 }
            );
        }

        // Find the paste
        const paste = await prisma.paste.findUnique({
            where: { slug },
        });

        if (!paste) {
            return NextResponse.json(
                { error: 'Paste not found' },
                { status: 404 }
            );
        }

        // Check if paste has expired
        const expiration = isPasteExpired(paste);
        if (expiration.expired) {
            // Delete expired paste
            await prisma.paste.delete({ where: { id: paste.id } });

            const message = expiration.reason === 'time'
                ? 'This paste has expired based on time limit'
                : 'This paste has been burned after reaching maximum views';

            return NextResponse.json(
                { error: message, expired: true, reason: expiration.reason },
                { status: 410 } // Gone
            );
        }

        // Increment view count
        const updatedPaste = await prisma.paste.update({
            where: { id: paste.id },
            data: { viewCount: { increment: 1 } },
        });

        // Check if this view causes expiration (for burn-after-reading)
        const willExpireAfterView = updatedPaste.maxViews && updatedPaste.viewCount >= updatedPaste.maxViews;

        return NextResponse.json({
            success: true,
            paste: {
                id: updatedPaste.id,
                slug: updatedPaste.slug,
                title: updatedPaste.title,
                content: updatedPaste.content,
                syntax: updatedPaste.syntax,
                viewCount: updatedPaste.viewCount,
                maxViews: updatedPaste.maxViews,
                expiresAt: updatedPaste.expiresAt,
                createdAt: updatedPaste.createdAt,
                willExpireAfterView,
            },
        });

    } catch (error) {
        console.error('Error fetching paste:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE /api/pastes/[slug] - Delete a paste
export async function DELETE(request, { params }) {
    try {
        const { slug } = await params;

        if (!slug) {
            return NextResponse.json(
                { error: 'Slug is required' },
                { status: 400 }
            );
        }

        const paste = await prisma.paste.findUnique({
            where: { slug },
        });

        if (!paste) {
            return NextResponse.json(
                { error: 'Paste not found' },
                { status: 404 }
            );
        }

        await prisma.paste.delete({ where: { id: paste.id } });

        return NextResponse.json({ success: true, message: 'Paste deleted successfully' });

    } catch (error) {
        console.error('Error deleting paste:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
