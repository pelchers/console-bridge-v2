/**
 * Tests for URL utilities
 */

const {
  normalizeUrl,
  validateUrl,
  parseUrls,
  getDisplayName,
} = require('../../src/utils/url');

describe('URL Utilities', () => {
  describe('normalizeUrl', () => {
    test('adds http:// to URL without protocol', () => {
      expect(normalizeUrl('localhost:5555')).toBe('http://localhost:5555/');
    });

    test('preserves http:// protocol', () => {
      expect(normalizeUrl('http://localhost:5555')).toBe(
        'http://localhost:5555/'
      );
    });

    test('preserves https:// protocol', () => {
      expect(normalizeUrl('https://localhost:5555')).toBe(
        'https://localhost:5555/'
      );
    });

    test('accepts 127.0.0.1', () => {
      expect(normalizeUrl('127.0.0.1:5555')).toBe('http://127.0.0.1:5555/');
    });

    test('accepts 0.0.0.0', () => {
      expect(normalizeUrl('0.0.0.0:8765')).toBe('http://0.0.0.0:8765/');
    });

    test('accepts [::1] (IPv6 localhost)', () => {
      expect(normalizeUrl('http://[::1]:5555')).toBe('http://[::1]:5555/');
    });

    test('trims whitespace', () => {
      expect(normalizeUrl('  localhost:5555  ')).toBe('http://localhost:5555/');
    });

    test('throws error for empty string', () => {
      expect(() => normalizeUrl('')).toThrow('URL must be a non-empty string');
    });

    test('throws error for null', () => {
      expect(() => normalizeUrl(null)).toThrow(
        'URL must be a non-empty string'
      );
    });

    test('throws error for non-localhost hostname', () => {
      expect(() => normalizeUrl('example.com:5555')).toThrow(
        'Only localhost URLs are supported'
      );
    });

    test('throws error for remote IP', () => {
      expect(() => normalizeUrl('192.168.1.1:5555')).toThrow(
        'Only localhost URLs are supported'
      );
    });

    test('throws error for invalid URL format', () => {
      expect(() => normalizeUrl('not a url')).toThrow('Invalid URL format');
    });
  });

  describe('validateUrl', () => {
    test('returns valid for correct localhost URL', () => {
      const result = validateUrl('localhost:5555');
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('returns valid for 127.0.0.1', () => {
      const result = validateUrl('127.0.0.1:8765');
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('returns invalid with error message for non-localhost', () => {
      const result = validateUrl('example.com:5555');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Only localhost URLs are supported');
    });

    test('returns invalid with error message for empty string', () => {
      const result = validateUrl('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('URL must be a non-empty string');
    });

    test('returns invalid with error message for invalid format', () => {
      const result = validateUrl('not a url');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid URL format');
    });
  });

  describe('parseUrls', () => {
    test('parses array of URLs', () => {
      const result = parseUrls(['localhost:5555', 'localhost:6666']);
      expect(result).toEqual([
        'http://localhost:5555/',
        'http://localhost:6666/',
      ]);
    });

    test('parses space-separated string', () => {
      const result = parseUrls('localhost:5555 localhost:6666');
      expect(result).toEqual([
        'http://localhost:5555/',
        'http://localhost:6666/',
      ]);
    });

    test('parses comma-separated string', () => {
      const result = parseUrls('localhost:5555,localhost:6666');
      expect(result).toEqual([
        'http://localhost:5555/',
        'http://localhost:6666/',
      ]);
    });

    test('parses mixed separators', () => {
      const result = parseUrls('localhost:5555, localhost:6666 localhost:7777');
      expect(result).toEqual([
        'http://localhost:5555/',
        'http://localhost:6666/',
        'http://localhost:7777/',
      ]);
    });

    test('deduplicates URLs', () => {
      const result = parseUrls('localhost:5555 localhost:5555');
      expect(result).toEqual(['http://localhost:5555/']);
      expect(result).toHaveLength(1);
    });

    test('filters empty strings', () => {
      const result = parseUrls('localhost:5555  localhost:6666');
      expect(result).toEqual([
        'http://localhost:5555/',
        'http://localhost:6666/',
      ]);
    });

    test('throws error for non-string non-array input', () => {
      expect(() => parseUrls(123)).toThrow('URLs must be a string or array');
    });

    test('throws error if any URL is invalid', () => {
      expect(() => parseUrls(['localhost:5555', 'example.com:5555'])).toThrow(
        'Only localhost URLs are supported'
      );
    });
  });

  describe('getDisplayName', () => {
    test('extracts hostname and port', () => {
      expect(getDisplayName('http://localhost:5555')).toBe('localhost:5555');
    });

    test('uses port 80 as default for http', () => {
      expect(getDisplayName('http://localhost')).toBe('localhost:80');
    });

    test('extracts custom port', () => {
      expect(getDisplayName('http://127.0.0.1:8765')).toBe('127.0.0.1:8765');
    });

    test('handles IPv6 localhost', () => {
      expect(getDisplayName('http://[::1]:5555')).toBe('[::1]:5555');
    });

    test('returns original string for invalid URL', () => {
      expect(getDisplayName('not a url')).toBe('not a url');
    });

    test('handles URL with path', () => {
      expect(getDisplayName('http://localhost:5555/app')).toBe('localhost:5555');
    });
  });
});
