import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateId, calculateExpirationDate, getCurrentTime } from '@/lib/utils';

// POST /api/pastes - Create a new paste
export async function POST(request) {
    try {
        const body = await request.json();
        const { content, ttl_seconds, max_views } = body;

        // Validation: content is required and must be a non-empty string
        if (!content || typeof content !== 'string' || content.trim() === '') {
            return NextResponse.json(
                { error: 'content is required and must be a non-empty string' },
                { status: 400 }
            );
        }

        // Validation: ttl_seconds must be an integer >= 1 if provided
        if (ttl_seconds !== undefined && ttl_seconds !== null) {
            if (!Number.isInteger(ttl_seconds) || ttl_seconds < 1) {
                return NextResponse.json(
                    { error: 'ttl_seconds must be an integer >= 1' },
                    { status: 400 }
                );
            }
        }

        // Validation: max_views must be an integer >= 1 if provided
        if (max_views !== undefined && max_views !== null) {
            if (!Number.isInteger(max_views) || max_views < 1) {
                return NextResponse.json(
                    { error: 'max_views must be an integer >= 1' },
                    { status: 400 }
                );
            }
        }

        // Generate unique ID
        let id = generateId();
        let attempts = 0;
        const maxAttempts = 5;

        // Ensure ID is unique
        while (attempts < maxAttempts) {
            const existing = await prisma.paste.findUnique({ where: { slug: id } });
            if (!existing) break;
            id = generateId();
            attempts++;
        }

        if (attempts >= maxAttempts) {
            return NextResponse.json(
                { error: 'Failed to generate unique ID. Please try again.' },
                { status: 500 }
            );
        }

        // Calculate expiration date using current time
        const currentTime = getCurrentTime(request);
        const expiresAt = calculateExpirationDate(ttl_seconds, currentTime);

        // Create paste
        const paste = await prisma.paste.create({
            data: {
                slug: id,
                content,
                expiresAt,
                maxViews: max_views || null,
                viewCount: 0,
            },
        });

        // Build the URL
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.headers.get('origin') || 'http://localhost:3000';
        const url = `${baseUrl}/p/${paste.slug}`;

        return NextResponse.json({
            id: paste.slug,
            url,
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating paste:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
