/**
 * URL Utilities
 * Handles URL validation, normalization, and parsing for localhost addresses
 */

/**
 * Normalize a URL to ensure it has proper format
 * @param {string} url - The URL to normalize
 * @returns {string} Normalized URL
 * @throws {Error} If URL is invalid or not localhost
 */
function normalizeUrl(url) {
  if (!url || typeof url !== 'string') {
    throw new Error('URL must be a non-empty string');
  }

  let normalized = url.trim();

  // Add http:// if no protocol specified
  if (!normalized.match(/^https?:\/\//)) {
    normalized = `http://${normalized}`;
  }

  // Validate URL format
  let parsedUrl;
  try {
    parsedUrl = new URL(normalized);
  } catch (error) {
    throw new Error(`Invalid URL format: ${url}`);
  }

  // Ensure it's localhost
  const validHosts = ['localhost', '127.0.0.1', '0.0.0.0', '[::1]'];
  if (!validHosts.includes(parsedUrl.hostname)) {
    throw new Error(
      `Only localhost URLs are supported. Got: ${parsedUrl.hostname}`
    );
  }

  return parsedUrl.href;
}

/**
 * Validate a URL
 * @param {string} url - The URL to validate
 * @returns {{valid: boolean, error: string|null}} Validation result
 */
function validateUrl(url) {
  try {
    normalizeUrl(url);
    return { valid: true, error: null };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

/**
 * Parse multiple URLs from various input formats
 * @param {string|string[]} urls - URLs as array or space-separated string
 * @returns {string[]} Array of normalized URLs
 */
function parseUrls(urls) {
  let urlArray;

  if (typeof urls === 'string') {
    // Split by whitespace or comma
    urlArray = urls.split(/[\s,]+/).filter(Boolean);
  } else if (Array.isArray(urls)) {
    urlArray = urls;
  } else {
    throw new Error('URLs must be a string or array');
  }

  // Normalize and deduplicate
  const normalized = urlArray.map((url) => normalizeUrl(url));
  return [...new Set(normalized)];
}

/**
 * Extract display name from URL (for labeling)
 * @param {string} url - The URL
 * @returns {string} Display name (e.g., "localhost:3000")
 */
function getDisplayName(url) {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}:${parsed.port || '80'}`;
  } catch {
    return url;
  }
}

module.exports = {
  normalizeUrl,
  validateUrl,
  parseUrls,
  getDisplayName,
};
