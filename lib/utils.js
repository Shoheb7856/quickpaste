import { customAlphabet } from 'nanoid';

// Create a custom nanoid with URL-safe characters (no confusing chars like 0, O, l, 1)
const nanoid = customAlphabet('abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789', 8);

export function generateSlug() {
    return nanoid();
}

// Expiration options in minutes
export const EXPIRATION_OPTIONS = [
    { label: 'Never', value: null },
    { label: '10 Minutes', value: 10 },
    { label: '1 Hour', value: 60 },
    { label: '1 Day', value: 1440 },
    { label: '1 Week', value: 10080 },
    { label: '1 Month', value: 43200 },
];

// View limit options
export const VIEW_LIMIT_OPTIONS = [
    { label: 'Unlimited', value: null },
    { label: '1 View (Burn after reading)', value: 1 },
    { label: '5 Views', value: 5 },
    { label: '10 Views', value: 10 },
    { label: '50 Views', value: 50 },
    { label: '100 Views', value: 100 },
];

// Syntax highlighting options
export const SYNTAX_OPTIONS = [
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
    { label: 'Ruby', value: 'ruby' },
    { label: 'Go', value: 'go' },
    { label: 'Rust', value: 'rust' },
    { label: 'TypeScript', value: 'typescript' },
];

// Calculate expiration date from minutes
export function calculateExpirationDate(minutes) {
    if (!minutes) return null;
    return new Date(Date.now() + minutes * 60 * 1000);
}

// Check if a paste has expired
export function isPasteExpired(paste) {
    if (paste.expiresAt && new Date(paste.expiresAt) < new Date()) {
        return { expired: true, reason: 'time' };
    }
    if (paste.maxViews && paste.viewCount >= paste.maxViews) {
        return { expired: true, reason: 'views' };
    }
    return { expired: false };
}

// Format relative time
export function formatRelativeTime(date) {
    const now = new Date();
    const target = new Date(date);
    const diffMs = target - now;
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    if (diffMs < 0) return 'Expired';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''}`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
}
