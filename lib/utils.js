import { customAlphabet } from 'nanoid';

// Create a custom nanoid with URL-safe characters
const nanoid = customAlphabet('abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789', 8);

export function generateId() {
    return nanoid();
}

/**
 * Get the current time, supporting TEST_MODE for deterministic testing
 * @param {Request} request - The incoming request object
 * @returns {Date} - The current time (or test time if TEST_MODE=1)
 */
export function getCurrentTime(request) {
    // Check if TEST_MODE is enabled
    if (process.env.TEST_MODE === '1') {
        const testNowMs = request?.headers?.get('x-test-now-ms');
        if (testNowMs) {
            const timestamp = parseInt(testNowMs, 10);
            if (!isNaN(timestamp)) {
                return new Date(timestamp);
            }
        }
    }
    return new Date();
}

/**
 * Calculate expiration date from TTL seconds
 * @param {number|null} ttlSeconds - Time to live in seconds
 * @param {Date} currentTime - The current time to calculate from
 * @returns {Date|null} - The expiration date or null if no TTL
 */
export function calculateExpirationDate(ttlSeconds, currentTime = new Date()) {
    if (!ttlSeconds || ttlSeconds < 1) return null;
    return new Date(currentTime.getTime() + ttlSeconds * 1000);
}

/**
 * Check if a paste has expired based on time
 * @param {Object} paste - The paste object
 * @param {Date} currentTime - The current time to check against
 * @returns {boolean} - True if expired
 */
export function isExpiredByTime(paste, currentTime) {
    if (!paste.expiresAt) return false;
    return new Date(paste.expiresAt) <= currentTime;
}

/**
 * Check if a paste has exceeded its view limit
 * @param {Object} paste - The paste object
 * @returns {boolean} - True if view limit exceeded
 */
export function isExpiredByViews(paste) {
    if (!paste.maxViews) return false;
    return paste.viewCount >= paste.maxViews;
}

/**
 * Check if a paste is unavailable (expired or view limit exceeded)
 * @param {Object} paste - The paste object
 * @param {Date} currentTime - The current time to check against
 * @returns {boolean} - True if unavailable
 */
export function isPasteUnavailable(paste, currentTime) {
    return isExpiredByTime(paste, currentTime) || isExpiredByViews(paste);
}

/**
 * Calculate remaining views for a paste
 * @param {Object} paste - The paste object
 * @returns {number|null} - Remaining views or null if unlimited
 */
export function getRemainingViews(paste) {
    if (!paste.maxViews) return null;
    const remaining = paste.maxViews - paste.viewCount;
    return Math.max(0, remaining);
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - The text to escape
 * @returns {string} - Escaped text
 */
export function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, char => map[char]);
}
