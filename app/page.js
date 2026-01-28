'use client';

import { useState } from 'react';

const TTL_OPTIONS = [
  { label: 'Never expires', value: '' },
  { label: '1 Minute', value: '60' },
  { label: '10 Minutes', value: '600' },
  { label: '1 Hour', value: '3600' },
  { label: '1 Day', value: '86400' },
  { label: '1 Week', value: '604800' },
];

const VIEW_LIMIT_OPTIONS = [
  { label: 'Unlimited views', value: '' },
  { label: '1 View (Burn after reading)', value: '1' },
  { label: '5 Views', value: '5' },
  { label: '10 Views', value: '10' },
  { label: '50 Views', value: '50' },
  { label: '100 Views', value: '100' },
];

export default function HomePage() {
  const [content, setContent] = useState('');
  const [ttlSeconds, setTtlSeconds] = useState('');
  const [maxViews, setMaxViews] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('Please enter some content');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const payload = {
        content: content,
      };

      // Only add optional fields if they have values
      if (ttlSeconds) {
        payload.ttl_seconds = parseInt(ttlSeconds, 10);
      }
      if (maxViews) {
        payload.max_views = parseInt(maxViews, 10);
      }

      const response = await fetch('/api/pastes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create paste');
      }

      setSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const resetForm = () => {
    setContent('');
    setTtlSeconds('');
    setMaxViews('');
    setSuccess(null);
    setError('');
    setCopied(false);
  };

  // Success view after paste creation
  if (success) {
    return (
      <div className="animate-slideUp">
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">✨ Paste Created!</h1>
          </div>
          <div className="card-body">
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 24px',
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.2) 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '36px',
              }}>
                ✓
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
                Your paste is ready to share
              </p>
            </div>

            <div className="share-section">
              <div className="share-label">📎 Shareable Link</div>
              <div className="share-url-wrapper">
                <input
                  type="text"
                  readOnly
                  value={success.url}
                  className="share-url-input"
                />
                <button
                  className="btn btn-primary"
                  onClick={() => copyToClipboard(success.url)}
                >
                  {copied ? '✓ Copied!' : '📋 Copy'}
                </button>
              </div>
            </div>

            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <code style={{
                color: 'var(--text-tertiary)',
                fontSize: '13px',
                background: 'var(--bg-tertiary)',
                padding: '4px 8px',
                borderRadius: '4px'
              }}>
                ID: {success.id}
              </code>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginTop: '32px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href={success.url} className="btn btn-secondary" target="_blank" rel="noopener noreferrer">
                👀 View Paste
              </a>
              <button className="btn btn-primary" onClick={resetForm}>
                ➕ Create Another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">📝 New Paste</h1>
          <span className="badge">Pastebin-Lite</span>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{
                padding: '14px 18px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--error)',
                marginBottom: '24px',
                fontSize: '14px',
              }}>
                ⚠️ {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="content">
                Content *
              </label>
              <textarea
                id="content"
                className="form-textarea"
                placeholder="Paste your text content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                style={{ minHeight: '200px' }}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="ttlSeconds">
                  ⏱️ Expiration (TTL)
                </label>
                <select
                  id="ttlSeconds"
                  className="form-select"
                  value={ttlSeconds}
                  onChange={(e) => setTtlSeconds(e.target.value)}
                >
                  {TTL_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="maxViews">
                  👁️ View Limit
                </label>
                <select
                  id="maxViews"
                  className="form-select"
                  value={maxViews}
                  onChange={(e) => setMaxViews(e.target.value)}
                >
                  {VIEW_LIMIT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginTop: '8px' }}>
              <button
                type="submit"
                className={`btn btn-primary ${isLoading ? 'btn-loading' : ''}`}
                disabled={isLoading || !content.trim()}
                style={{ width: '100%', padding: '16px' }}
              >
                {isLoading ? '' : '🚀 Create Paste'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div style={{ marginTop: '32px' }}>
        <div className="card">
          <div className="card-body">
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)' }}>
              ✨ Features
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '24px' }}>🔗</span>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Instant Sharing</strong>
                  <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                    Get a shareable link immediately
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '24px' }}>⏰</span>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Time-to-Live</strong>
                  <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                    Auto-expire after set duration
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '24px' }}>🔥</span>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>View Limits</strong>
                  <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                    Self-destruct after N views
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
