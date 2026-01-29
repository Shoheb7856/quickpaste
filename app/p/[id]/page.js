import prisma from '@/lib/prisma';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { escapeHtml } from '@/lib/utils';
import './paste.css';

// Helper to get current time (supports TEST_MODE)
function getCurrentTimeFromHeaders(headersList) {
    if (process.env.TEST_MODE === '1') {
        const testNowMs = headersList.get('x-test-now-ms');
        if (testNowMs) {
            const timestamp = parseInt(testNowMs, 10);
            if (!isNaN(timestamp)) {
                return new Date(timestamp);
            }
        }
    }
    return new Date();
}

// Check if paste is unavailable
function isPasteUnavailable(paste, currentTime) {
    // Check time expiry
    if (paste.expiresAt && new Date(paste.expiresAt) <= currentTime) {
        return true;
    }
    // Check view limit
    if (paste.maxViews && paste.viewCount >= paste.maxViews) {
        return true;
    }
    return false;
}

export default async function PastePage({ params }) {
    const { id } = await params;
    const headersList = await headers();
    const currentTime = getCurrentTimeFromHeaders(headersList);

    // Find the paste
    const paste = await prisma.paste.findUnique({
        where: { slug: id },
    });

    // Paste not found or unavailable - return 404
    if (!paste || isPasteUnavailable(paste, currentTime)) {
        notFound();
    }

    // Increment view count
    await prisma.paste.update({
        where: { id: paste.id },
        data: { viewCount: { increment: 1 } },
    });

    // Safely escape content to prevent XSS
    const safeContent = escapeHtml(paste.content);

    // Calculate remaining views after this view
    const remainingViews = paste.maxViews
        ? Math.max(0, paste.maxViews - paste.viewCount - 1)
        : null;

    return (
        <div className="paste-page">
            <div className="paste-container">
                <div className="paste-header">
                    <a href="/" className="paste-logo">QuickPaste</a>
                    <div className="paste-meta">
                        {paste.expiresAt && (
                            <span className="paste-badge warning">
                                Expires: {new Date(paste.expiresAt).toLocaleString()}
                            </span>
                        )}
                        {remainingViews !== null && (
                            <span className="paste-badge warning">
                                {remainingViews} view{remainingViews !== 1 ? 's' : ''} remaining
                            </span>
                        )}
                    </div>
                </div>
                <pre className="paste-content" dangerouslySetInnerHTML={{ __html: safeContent }} />
                <div className="paste-footer">
                    <a href="/">Create a new paste →</a>
                </div>
            </div>
        </div>
    );
}

// Force dynamic rendering to support headers and database access
export const dynamic = 'force-dynamic';

// Return 404 status for unavailable pastes
export async function generateMetadata({ params }) {
    const { id } = await params;

    const paste = await prisma.paste.findUnique({
        where: { slug: id },
    });

    if (!paste) {
        return {
            title: 'Paste Not Found - QuickPaste',
        };
    }

    return {
        title: `${paste.title || 'Paste'} - QuickPaste`,
    };
}
