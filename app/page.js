'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const EXPIRATION_OPTIONS = [
  { label: 'Never', value: '' },
  { label: '10 Minutes', value: '10' },
  { label: '1 Hour', value: '60' },
  { label: '1 Day', value: '1440' },
  { label: '1 Week', value: '10080' },
  { label: '1 Month', value: '43200' },
];

const VIEW_LIMIT_OPTIONS = [
  { label: 'Unlimited', value: '' },
  { label: '1 View (Burn after reading)', value: '1' },
  { label: '5 Views', value: '5' },
  { label: '10 Views', value: '10' },
  { label: '50 Views', value: '50' },
  { label: '100 Views', value: '100' },
];

const SYNTAX_OPTIONS = [
  { label: 'Plain Text', value: 'plaintext' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Python', value: 'python' },
  { label: 'HTML', value: 'html' },
  { label: 'CSS', value: 'css' },
  { label: 'JSON', value: 'json' },
  { label: 'SQL', value: 'sql' },
  { label: 'Markdown', value: 'markdown' },
  { label: 'Java', value: 'java' },
  { label: 'C++', value: 'cpp' },
  { label: 'PHP', value: 'php' },
  { label: 'TypeScript', value: 'typescript' },
];

export default function HomePage() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [syntax, setSyntax] = useState('plaintext');
  const [expiresIn, setExpiresIn] = useState('');
  const [maxViews, setMaxViews] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const MAX_CHARS = 500000;
  const charCount = content.length;
  const charPercentage = (charCount / MAX_CHARS) * 100;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('Please enter some content to paste');
      return;
    }

    if (content.length > MAX_CHARS) {
      setError('Content exceeds maximum length');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/pastes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          title: title.trim() || null,
          syntax,
          expiresIn: expiresIn ? parseInt(expiresIn) : null,
          maxViews: maxViews ? parseInt(maxViews) : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create paste');
      }

      setSuccess(data.paste);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // Visual feedback would be added here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const resetForm = () => {
    setContent('');
    setTitle('');
    setSyntax('plaintext');
    setExpiresIn('');
    setMaxViews('');
    setSuccess(null);
    setError('');
  };

  // Success view after paste creation
  if (success) {
    return (
      <div className="animate-slideUp">
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">✨ Paste Created Successfully!</h1>
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
              {success.title && (
                <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>
                  {success.title}
                </h2>
              )}
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
                  value={success.shareableUrl}
                  className="share-url-input"
                />
                <button
                  className="btn btn-primary"
                  onClick={() => copyToClipboard(success.shareableUrl)}
                >
                  📋 Copy Link
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '24px', justifyContent: 'center' }}>
              {success.expiresAt && (
                <span className="badge badge-warning">
                  ⏱️ Expires: {new Date(success.expiresAt).toLocaleString()}
                </span>
              )}
              {success.maxViews && (
                <span className="badge badge-warning">
                  👁️ Max Views: {success.maxViews}
                </span>
              )}
              <span className="badge">
                📝 Syntax: {success.syntax}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginTop: '32px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href={`/${success.slug}`} className="btn btn-secondary">
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
          <span className="badge">Quick Share</span>
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
              <label className="form-label" htmlFor="title">
                Title (Optional)
              </label>
              <input
                type="text"
                id="title"
                className="form-input"
                placeholder="Give your paste a title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
              />
            </div>

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
              />
              <div className={`char-counter ${charPercentage > 90 ? 'warning' : ''} ${charPercentage >= 100 ? 'error' : ''}`}>
                {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="syntax">
                  📄 Syntax Highlighting
                </label>
                <select
                  id="syntax"
                  className="form-select"
                  value={syntax}
                  onChange={(e) => setSyntax(e.target.value)}
                >
                  {SYNTAX_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="expiresIn">
                  ⏱️ Expiration
                </label>
                <select
                  id="expiresIn"
                  className="form-select"
                  value={expiresIn}
                  onChange={(e) => setExpiresIn(e.target.value)}
                >
                  {EXPIRATION_OPTIONS.map((option) => (
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
                  <strong style={{ color: 'var(--text-primary)' }}>Auto Expiration</strong>
                  <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                    Set time-based expiration
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '24px' }}>🔥</span>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Burn After Reading</strong>
                  <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                    Self-destruct after X views
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
