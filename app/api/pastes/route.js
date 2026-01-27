import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateSlug, calculateExpirationDate } from '@/lib/utils';

// POST /api/pastes - Create a new paste
export async function POST(request) {
    try {
        const body = await request.json();
        const { content, title, syntax, expiresIn, maxViews } = body;

        // Validation
        if (!content || typeof content !== 'string') {
            return NextResponse.json(
                { error: 'Content is required and must be a string' },
                { status: 400 }
            );
        }

        if (content.length > 500000) {
            return NextResponse.json(
                { error: 'Content exceeds maximum length of 500,000 characters' },
                { status: 400 }
            );
        }

        // Generate unique slug
        let slug = generateSlug();
        let attempts = 0;
        const maxAttempts = 5;

        // Ensure slug is unique
        while (attempts < maxAttempts) {
            const existing = await prisma.paste.findUnique({ where: { slug } });
            if (!existing) break;
            slug = generateSlug();
            attempts++;
        }

        if (attempts >= maxAttempts) {
            return NextResponse.json(
                { error: 'Failed to generate unique slug. Please try again.' },
                { status: 500 }
            );
        }

        // Calculate expiration date
        const expiresAt = calculateExpirationDate(expiresIn);

        // Create paste
        const paste = await prisma.paste.create({
            data: {
                slug,
                content,
                title: title || null,
                syntax: syntax || 'plaintext',
                expiresAt,
                maxViews: maxViews || null,
                viewCount: 0,
            },
        });

        // Build the shareable URL
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.headers.get('origin') || 'http://localhost:3000';
        const shareableUrl = `${baseUrl}/${paste.slug}`;

        return NextResponse.json({
            success: true,
            paste: {
                id: paste.id,
                slug: paste.slug,
                title: paste.title,
                syntax: paste.syntax,
                expiresAt: paste.expiresAt,
                maxViews: paste.maxViews,
                createdAt: paste.createdAt,
                shareableUrl,
            },
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating paste:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// GET /api/pastes - Get all pastes (for admin/debug purposes, limited)
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = Math.min(parseInt(searchParams.get('limit')) || 10, 50);

        const pastes = await prisma.paste.findMany({
            select: {
                id: true,
                slug: true,
                title: true,
                syntax: true,
                viewCount: true,
                expiresAt: true,
                maxViews: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });

        return NextResponse.json({ pastes });
    } catch (error) {
        console.error('Error fetching pastes:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
