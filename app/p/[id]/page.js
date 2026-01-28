import prisma from '@/lib/prisma';
import { headers } from 'next/headers';
import { escapeHtml } from '@/lib/utils';

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
        return (
            <html lang="en">
                <head>
                    <meta charSet="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <title>Paste Not Found - QuickPaste</title>
                    <style>{`
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: #0a0a0f;
              color: #fff;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
            }
            .container {
              text-align: center;
              padding: 40px;
            }
            h1 { color: #ef4444; margin-bottom: 16px; }
            p { color: #a1a1aa; }
            a {
              color: #8b5cf6;
              text-decoration: none;
              margin-top: 24px;
              display: inline-block;
            }
          `}</style>
                </head>
                <body>
                    <div className="container">
                        <h1>404 - Paste Not Found</h1>
                        <p>This paste does not exist or has expired.</p>
                        <a href="/">Create a new paste →</a>
                    </div>
                </body>
            </html>
        );
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
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>{paste.title || 'Paste'} - QuickPaste</title>
                <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0a0a0f;
            color: #fff;
            min-height: 100vh;
            padding: 24px;
          }
          .container {
            max-width: 900px;
            margin: 0 auto;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            flex-wrap: wrap;
            gap: 16px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #8b5cf6;
            text-decoration: none;
          }
          .meta {
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
          }
          .badge {
            padding: 6px 12px;
            background: rgba(255,255,255,0.1);
            border-radius: 20px;
            font-size: 13px;
            color: #a1a1aa;
          }
          .badge.warning { background: rgba(245,158,11,0.2); color: #f59e0b; }
          .content {
            background: #12121a;
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 12px;
            padding: 24px;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 14px;
            line-height: 1.6;
            white-space: pre-wrap;
            word-break: break-word;
            overflow-x: auto;
          }
          .footer {
            margin-top: 24px;
            text-align: center;
          }
          .footer a {
            color: #8b5cf6;
            text-decoration: none;
          }
        `}</style>
            </head>
            <body>
                <div className="container">
                    <div className="header">
                        <a href="/" className="logo">QuickPaste</a>
                        <div className="meta">
                            {paste.expiresAt && (
                                <span className="badge warning">
                                    Expires: {new Date(paste.expiresAt).toLocaleString()}
                                </span>
                            )}
                            {remainingViews !== null && (
                                <span className="badge warning">
                                    {remainingViews} view{remainingViews !== 1 ? 's' : ''} remaining
                                </span>
                            )}
                        </div>
                    </div>
                    <pre className="content" dangerouslySetInnerHTML={{ __html: safeContent }} />
                    <div className="footer">
                        <a href="/">Create a new paste →</a>
                    </div>
                </div>
            </body>
        </html>
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
