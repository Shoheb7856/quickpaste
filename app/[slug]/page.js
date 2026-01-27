'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function PastePage() {
    const params = useParams();
    const slug = params.slug;

    const [paste, setPaste] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!slug) return;

        const fetchPaste = async () => {
            try {
                const response = await fetch(`/api/pastes/${slug}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch paste');
                }

                setPaste(data.paste);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPaste();
    }, [slug]);

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const copyLink = () => {
        copyToClipboard(window.location.href);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    };

    const getTimeRemaining = (expiresAt) => {
        const now = new Date();
        const expiry = new Date(expiresAt);
        const diffMs = expiry - now;

        if (diffMs < 0) return 'Expired';

        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} remaining`;
        if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} remaining`;
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} remaining`;
    };

    // Loading state
    if (loading) {
        return (
            <div className="card animate-fadeIn">
                <div className="card-body" style={{ padding: '60px 24px', textAlign: 'center' }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        margin: '0 auto 20px',
                        border: '3px solid var(--border-primary)',
                        borderTopColor: 'var(--accent-primary)',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                    }} />
                    <p style={{ color: 'var(--text-secondary)' }}>Loading paste...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="card animate-fadeIn">
                <div className="card-body">
                    <div className="error-container">
                        <div className="error-icon">
                            {error.includes('expired') || error.includes('burned') ? '🔥' : '😕'}
                        </div>
                        <h1 className="error-title">
                            {error.includes('expired') || error.includes('burned') ? 'Paste Expired' : 'Paste Not Found'}
                        </h1>
                        <p className="error-message">{error}</p>
                        <a href="/" className="btn btn-primary">
                            ➕ Create New Paste
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-slideUp">
            <div className="card">
                <div className="card-header">
                    <div className="paste-header" style={{ width: '100%' }}>
                        <div>
                            <h1 className="paste-title">
                                {paste.title || 'Untitled Paste'}
                            </h1>
                            <div className="paste-meta">
                                <span className="paste-meta-item">
                                    📅 {formatDate(paste.createdAt)}
                                </span>
                                <span className="paste-meta-item">
                                    👁️ {paste.viewCount} view{paste.viewCount !== 1 ? 's' : ''}
                                </span>
                                <span className="paste-meta-item">
                                    📝 {paste.syntax}
                                </span>
                            </div>
                        </div>
                        <div className="paste-actions">
                            <button
                                className="btn btn-secondary"
                                onClick={() => copyToClipboard(paste.content)}
                                title="Copy content"
                            >
                                📋 {copied ? 'Copied!' : 'Copy'}
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={copyLink}
                                title="Copy link"
                            >
                                🔗 Share
                            </button>
                        </div>
                    </div>
                </div>

                <div className="card-body">
                    {/* Warning badges */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                        {paste.expiresAt && (
                            <span className="badge badge-warning">
                                ⏱️ {getTimeRemaining(paste.expiresAt)}
                            </span>
                        )}
                        {paste.maxViews && (
                            <span className={`badge ${paste.viewCount >= paste.maxViews - 1 ? 'badge-error' : 'badge-warning'}`}>
                                👁️ {paste.viewCount} / {paste.maxViews} views
                                {paste.willExpireAfterView && ' (Last view!)'}
                            </span>
                        )}
                    </div>

                    {/* Content display */}
                    <pre className="paste-content">{paste.content}</pre>

                    {/* Raw view link */}
                    <div style={{ marginTop: '20px', textAlign: 'center' }}>
                        <a
                            href={`/api/pastes/${slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                color: 'var(--text-tertiary)',
                                fontSize: '13px',
                                textDecoration: 'none',
                            }}
                        >
                            View Raw JSON →
                        </a>
                    </div>
                </div>
            </div>

            {/* Create new paste CTA */}
            <div style={{ marginTop: '32px', textAlign: 'center' }}>
                <a href="/" className="btn btn-primary">
                    ➕ Create New Paste
                </a>
            </div>

            {/* Toast notification */}
            {copied && (
                <div className="toast toast-success">
                    ✓ Copied to clipboard!
                </div>
            )}
        </div>
    );
}
