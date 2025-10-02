/**
 * Tests for color utilities
 */

const chalk = require('chalk');
const {
  LOG_LEVEL_COLORS,
  SOURCE_COLORS,
  getSourceColor,
  getLogLevelColor,
} = require('../../src/formatters/colors');

describe('Color Utilities', () => {
  describe('LOG_LEVEL_COLORS', () => {
    test('defines colors for all log levels', () => {
      expect(LOG_LEVEL_COLORS.log).toBeDefined();
      expect(LOG_LEVEL_COLORS.info).toBeDefined();
      expect(LOG_LEVEL_COLORS.warn).toBeDefined();
      expect(LOG_LEVEL_COLORS.error).toBeDefined();
      expect(LOG_LEVEL_COLORS.debug).toBeDefined();
    });

    test('all colors are chalk functions', () => {
      expect(typeof LOG_LEVEL_COLORS.log).toBe('function');
      expect(typeof LOG_LEVEL_COLORS.info).toBe('function');
      expect(typeof LOG_LEVEL_COLORS.warn).toBe('function');
      expect(typeof LOG_LEVEL_COLORS.error).toBe('function');
      expect(typeof LOG_LEVEL_COLORS.debug).toBe('function');
    });
  });

  describe('SOURCE_COLORS', () => {
    test('is an array of colors', () => {
      expect(Array.isArray(SOURCE_COLORS)).toBe(true);
      expect(SOURCE_COLORS.length).toBeGreaterThan(0);
    });

    test('all colors are chalk functions', () => {
      SOURCE_COLORS.forEach((color) => {
        expect(typeof color).toBe('function');
      });
    });

    test('has at least 5 different colors', () => {
      expect(SOURCE_COLORS.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('getSourceColor', () => {
    test('returns a chalk function', () => {
      const color = getSourceColor('localhost:5555');
      expect(typeof color).toBe('function');
    });

    test('returns same color for same source', () => {
      const color1 = getSourceColor('localhost:5555');
      const color2 = getSourceColor('localhost:5555');
      expect(color1).toBe(color2);
    });

    test('returns different colors for different sources', () => {
      // Note: This test might occasionally fail due to hash collisions
      // but is unlikely with 7+ colors
      const sources = [
        'localhost:5555',
        'localhost:6666',
        'localhost:7777',
        'localhost:8888',
        'localhost:9999',
        'localhost:5001',
        'localhost:5002',
      ];

      const colors = sources.map((s) => getSourceColor(s));
      const uniqueColors = new Set(colors);

      // Expect at least some variety (not all the same)
      expect(uniqueColors.size).toBeGreaterThan(1);
    });

    test('color is from SOURCE_COLORS array', () => {
      const color = getSourceColor('localhost:5555');
      expect(SOURCE_COLORS).toContain(color);
    });

    test('handles empty string', () => {
      const color = getSourceColor('');
      expect(SOURCE_COLORS).toContain(color);
    });

    test('handles long URLs consistently', () => {
      const url = 'http://localhost:5555/very/long/path/to/test/consistency';
      const color1 = getSourceColor(url);
      const color2 = getSourceColor(url);
      expect(color1).toBe(color2);
    });

    test('hash distribution is deterministic', () => {
      // Test that the same inputs always produce the same outputs
      const testCases = [
        'localhost:5555',
        'localhost:6666',
        '127.0.0.1:8765',
      ];

      testCases.forEach((source) => {
        const results = Array(10)
          .fill(null)
          .map(() => getSourceColor(source));
        const firstColor = results[0];

        // All results should be identical
        results.forEach((color) => {
          expect(color).toBe(firstColor);
        });
      });
    });
  });

  describe('getLogLevelColor', () => {
    test('returns correct color for log', () => {
      expect(getLogLevelColor('log')).toBe(LOG_LEVEL_COLORS.log);
    });

    test('returns correct color for info', () => {
      expect(getLogLevelColor('info')).toBe(LOG_LEVEL_COLORS.info);
    });

    test('returns correct color for warn', () => {
      expect(getLogLevelColor('warn')).toBe(LOG_LEVEL_COLORS.warn);
    });

    test('returns correct color for error', () => {
      expect(getLogLevelColor('error')).toBe(LOG_LEVEL_COLORS.error);
    });

    test('returns correct color for debug', () => {
      expect(getLogLevelColor('debug')).toBe(LOG_LEVEL_COLORS.debug);
    });

    test('returns white for unknown level', () => {
      expect(getLogLevelColor('unknown')).toBe(chalk.white);
    });

    test('returns white for undefined level', () => {
      expect(getLogLevelColor(undefined)).toBe(chalk.white);
    });

    test('returns white for null level', () => {
      expect(getLogLevelColor(null)).toBe(chalk.white);
    });
  });
});
