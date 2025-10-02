/**
 * Tests for LogFormatter
 */

const LogFormatter = require('../../src/formatters/LogFormatter');
const chalk = require('chalk');

describe('LogFormatter', () => {
  let formatter;

  beforeEach(() => {
    formatter = new LogFormatter();
  });

  describe('constructor', () => {
    test('creates formatter with default options', () => {
      expect(formatter.showTimestamp).toBe(true);
      expect(formatter.showSource).toBe(true);
      expect(formatter.showLocation).toBe(false);
      expect(formatter.timestampFormat).toBe('time');
    });

    test('creates formatter with custom options', () => {
      const customFormatter = new LogFormatter({
        showTimestamp: false,
        showSource: false,
        showLocation: true,
        timestampFormat: 'iso',
      });

      expect(customFormatter.showTimestamp).toBe(false);
      expect(customFormatter.showSource).toBe(false);
      expect(customFormatter.showLocation).toBe(true);
      expect(customFormatter.timestampFormat).toBe('iso');
    });
  });

  describe('format', () => {
    test('formats a basic log entry', () => {
      const logData = {
        type: 'log',
        args: ['Hello world'],
        source: 'http://localhost:5555/',
        timestamp: 1609459200000, // 2021-01-01 00:00:00 UTC
        location: {},
      };

      const result = formatter.format(logData);

      expect(result).toContain('log:');
      expect(result).toContain('Hello world');
      expect(result).toContain('localhost:5555');
    });

    test('formats log with multiple arguments', () => {
      const logData = {
        type: 'log',
        args: ['Hello', 'world', '123'],
        source: 'http://localhost:5555/',
        timestamp: Date.now(),
        location: {},
      };

      const result = formatter.format(logData);

      expect(result).toContain('Hello');
      expect(result).toContain('world');
      expect(result).toContain('123');
    });

    test('formats different log levels', () => {
      const levels = ['log', 'info', 'warn', 'error', 'debug'];

      levels.forEach((level) => {
        const logData = {
          type: level,
          args: ['test'],
          source: 'http://localhost:5555/',
          timestamp: Date.now(),
          location: {},
        };

        const result = formatter.format(logData);
        expect(result).toContain(`${level}:`);
      });
    });

    test('formats log without timestamp when disabled', () => {
      const noTimestampFormatter = new LogFormatter({
        showTimestamp: false,
      });

      const logData = {
        type: 'log',
        args: ['test'],
        source: 'http://localhost:5555/',
        timestamp: Date.now(),
        location: {},
      };

      const result = noTimestampFormatter.format(logData);

      // Should not contain timestamp format [HH:MM:SS]
      expect(result).not.toMatch(/\[\d{2}:\d{2}:\d{2}\]/);
      expect(result).toContain('test');
    });

    test('formats log without source when disabled', () => {
      const noSourceFormatter = new LogFormatter({
        showSource: false,
      });

      const logData = {
        type: 'log',
        args: ['test'],
        source: 'http://localhost:5555/',
        timestamp: Date.now(),
        location: {},
      };

      const result = noSourceFormatter.format(logData);

      expect(result).not.toContain('localhost:5555');
      expect(result).toContain('test');
    });

    test('formats log with location when enabled', () => {
      const locationFormatter = new LogFormatter({
        showLocation: true,
      });

      const logData = {
        type: 'log',
        args: ['test'],
        source: 'http://localhost:5555/',
        timestamp: Date.now(),
        location: {
          url: 'http://localhost:5555/app.js',
          lineNumber: 42,
          columnNumber: 10,
        },
      };

      const result = locationFormatter.format(logData);

      expect(result).toContain('app.js:42:10');
    });
  });

  describe('formatTimestamp', () => {
    test('formats timestamp in time format', () => {
      const timestamp = new Date('2021-01-01T12:34:56Z').getTime();
      const result = formatter.formatTimestamp(timestamp);

      expect(result).toMatch(/\[\d{2}:\d{2}:\d{2}\]/);
    });

    test('formats timestamp in ISO format', () => {
      const isoFormatter = new LogFormatter({
        timestampFormat: 'iso',
      });

      const timestamp = new Date('2021-01-01T12:34:56Z').getTime();
      const result = isoFormatter.formatTimestamp(timestamp);

      expect(result).toContain('2021-01-01');
    });
  });

  describe('formatSource', () => {
    test('formats source with port', () => {
      const result = formatter.formatSource('http://localhost:5555/');

      expect(result).toContain('localhost:5555');
    });

    test('formats source without explicit port', () => {
      const result = formatter.formatSource('http://localhost/');

      expect(result).toContain('localhost');
    });

    test('uses consistent color for same source', () => {
      const result1 = formatter.formatSource('http://localhost:5555/');
      const result2 = formatter.formatSource('http://localhost:5555/');

      expect(result1).toBe(result2);
    });
  });

  describe('formatLevel', () => {
    test('formats log level', () => {
      const result = formatter.formatLevel('log');
      expect(result).toContain('log:');
    });

    test('formats warn level', () => {
      const result = formatter.formatLevel('warn');
      expect(result).toContain('warn:');
    });

    test('formats error level', () => {
      const result = formatter.formatLevel('error');
      expect(result).toContain('error:');
    });
  });

  describe('formatMessage', () => {
    test('formats empty args', () => {
      const result = formatter.formatMessage([]);
      expect(result).toBe('');
    });

    test('formats single string arg', () => {
      const result = formatter.formatMessage(['Hello']);
      expect(result).toContain('Hello');
    });

    test('formats multiple args', () => {
      const result = formatter.formatMessage(['Hello', 'world']);
      expect(result).toContain('Hello');
      expect(result).toContain('world');
    });

    test('formats mixed type args', () => {
      const result = formatter.formatMessage(['text', 123, true]);
      expect(result).toContain('text');
      expect(result).toContain('123');
      expect(result).toContain('true');
    });
  });

  describe('formatArg', () => {
    test('formats null', () => {
      const result = formatter.formatArg(null);
      expect(result).toContain('null');
    });

    test('formats undefined', () => {
      const result = formatter.formatArg(undefined);
      expect(result).toContain('undefined');
    });

    test('formats string', () => {
      const result = formatter.formatArg('test');
      expect(result).toBe('test');
    });

    test('formats number', () => {
      const result = formatter.formatArg(123);
      expect(result).toContain('123');
    });

    test('formats boolean', () => {
      const result = formatter.formatArg(true);
      expect(result).toContain('true');
    });

    test('formats function', () => {
      const result = formatter.formatArg(() => {});
      expect(result).toContain('[Function]');
    });

    test('formats symbol', () => {
      const result = formatter.formatArg(Symbol('test'));
      expect(result).toContain('Symbol(test)');
    });

    test('formats object', () => {
      const result = formatter.formatArg({ key: 'value' });
      expect(result).toContain('key');
      expect(result).toContain('value');
    });

    test('formats array', () => {
      const result = formatter.formatArg([1, 2, 3]);
      expect(result).toContain('1');
      expect(result).toContain('2');
      expect(result).toContain('3');
    });

    test('handles circular references', () => {
      const circular = {};
      circular.self = circular;

      const result = formatter.formatArg(circular);
      expect(result).toContain('[Object]');
    });
  });

  describe('formatLocation', () => {
    test('formats location with line and column', () => {
      const location = {
        url: 'http://localhost:5555/app.js',
        lineNumber: 42,
        columnNumber: 10,
      };

      const result = formatter.formatLocation(location);

      expect(result).toContain('app.js');
      expect(result).toContain('42');
      expect(result).toContain('10');
    });

    test('formats location with only line number', () => {
      const location = {
        url: 'http://localhost:5555/app.js',
        lineNumber: 42,
      };

      const result = formatter.formatLocation(location);

      expect(result).toContain('app.js');
      expect(result).toContain('42');
    });

    test('formats location with only URL', () => {
      const location = {
        url: 'http://localhost:5555/app.js',
      };

      const result = formatter.formatLocation(location);

      expect(result).toContain('app.js');
    });
  });

  describe('integration', () => {
    test('formats complete log entry', () => {
      const logData = {
        type: 'warn',
        args: ['Warning message', { data: 'value' }],
        source: 'http://localhost:5555/',
        timestamp: Date.now(),
        location: {
          url: 'http://localhost:5555/app.js',
          lineNumber: 10,
        },
      };

      const locationFormatter = new LogFormatter({
        showLocation: true,
      });

      const result = locationFormatter.format(logData);

      // Should contain all parts
      expect(result).toMatch(/\[\d{2}:\d{2}:\d{2}\]/); // timestamp
      expect(result).toContain('localhost:5555'); // source
      expect(result).toContain('warn:'); // level
      expect(result).toContain('Warning message'); // message
      expect(result).toContain('data'); // object
      expect(result).toContain('app.js:10'); // location
    });

    test('formats minimal log entry', () => {
      const minimalFormatter = new LogFormatter({
        showTimestamp: false,
        showSource: false,
        showLocation: false,
      });

      const logData = {
        type: 'log',
        args: ['Simple message'],
        source: 'http://localhost:5555/',
        timestamp: Date.now(),
        location: {},
      };

      const result = minimalFormatter.format(logData);

      expect(result).toContain('log:');
      expect(result).toContain('Simple message');
      expect(result).not.toContain('localhost:5555');
      expect(result).not.toMatch(/\[\d{2}:\d{2}:\d{2}\]/);
    });
  });
});
