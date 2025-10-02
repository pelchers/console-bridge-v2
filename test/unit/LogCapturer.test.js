/**
 * Tests for LogCapturer
 */

const LogCapturer = require('../../src/core/LogCapturer');

describe('LogCapturer', () => {
  let mockPage;
  let capturer;
  let callback;

  beforeEach(() => {
    // Create mock page
    mockPage = {
      on: jest.fn(),
      removeAllListeners: jest.fn(),
    };

    callback = jest.fn();
    capturer = new LogCapturer(mockPage, 'http://localhost:5555/', {
      levels: ['log', 'info', 'warn', 'error', 'debug'],
    });
  });

  describe('constructor', () => {
    test('creates capturer with page and url', () => {
      expect(capturer.page).toBe(mockPage);
      expect(capturer.url).toBe('http://localhost:5555/');
    });

    test('uses default log levels if not specified', () => {
      const defaultCapturer = new LogCapturer(
        mockPage,
        'http://localhost:5555/'
      );
      expect(defaultCapturer.levels).toEqual([
        'log',
        'info',
        'warn',
        'error',
        'debug',
      ]);
    });

    test('uses custom log levels if specified', () => {
      const customCapturer = new LogCapturer(
        mockPage,
        'http://localhost:5555/',
        { levels: ['log', 'error'] }
      );
      expect(customCapturer.levels).toEqual(['log', 'error']);
    });

    test('initializes callback as null', () => {
      expect(capturer.callback).toBeNull();
    });
  });

  describe('start', () => {
    test('sets callback', () => {
      capturer.start(callback);
      expect(capturer.callback).toBe(callback);
    });

    test('registers console event listener', () => {
      capturer.start(callback);
      expect(mockPage.on).toHaveBeenCalledWith('console', expect.any(Function));
    });

    test('registers pageerror event listener', () => {
      capturer.start(callback);
      expect(mockPage.on).toHaveBeenCalledWith(
        'pageerror',
        expect.any(Function)
      );
    });

    test('registers requestfailed event listener', () => {
      capturer.start(callback);
      expect(mockPage.on).toHaveBeenCalledWith(
        'requestfailed',
        expect.any(Function)
      );
    });
  });

  describe('handleConsoleMessage', () => {
    beforeEach(() => {
      capturer.start(callback);
    });

    test('calls callback with log data for console.log', async () => {
      const mockMsg = {
        type: () => 'log',
        args: () => [
          {
            jsonValue: async () => 'test message',
          },
        ],
        location: () => ({ url: 'test.js', lineNumber: 10 }),
      };

      await capturer.handleConsoleMessage(mockMsg);

      expect(callback).toHaveBeenCalledWith({
        type: 'log',
        args: ['test message'],
        source: 'http://localhost:5555/',
        timestamp: expect.any(Number),
        location: { url: 'test.js', lineNumber: 10 },
      });
    });

    test('calls callback for different log levels', async () => {
      const levels = ['log', 'info', 'warn', 'error', 'debug'];

      for (const level of levels) {
        callback.mockClear();

        const mockMsg = {
          type: () => level,
          args: () => [
            {
              jsonValue: async () => 'test',
            },
          ],
          location: () => ({}),
        };

        await capturer.handleConsoleMessage(mockMsg);

        expect(callback).toHaveBeenCalledWith(
          expect.objectContaining({
            type: level,
          })
        );
      }
    });

    test('filters messages not in specified levels', async () => {
      const filteredCapturer = new LogCapturer(
        mockPage,
        'http://localhost:5555/',
        { levels: ['error'] }
      );
      filteredCapturer.start(callback);

      const mockMsg = {
        type: () => 'log',
        args: () => [],
        location: () => ({}),
      };

      await filteredCapturer.handleConsoleMessage(mockMsg);

      expect(callback).not.toHaveBeenCalled();
    });

    test('handles errors in extractArgs gracefully', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const mockMsg = {
        type: () => 'log',
        args: () => {
          throw new Error('Args extraction failed');
        },
        location: () => ({}),
      };

      await capturer.handleConsoleMessage(mockMsg);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error processing console message:',
        'Args extraction failed'
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('handlePageError', () => {
    beforeEach(() => {
      capturer.start(callback);
    });

    test('calls callback with error log data', () => {
      const error = new Error('Uncaught error');

      capturer.handlePageError(error);

      expect(callback).toHaveBeenCalledWith({
        type: 'error',
        args: ['Uncaught Exception: Uncaught error'],
        source: 'http://localhost:5555/',
        timestamp: expect.any(Number),
        location: {},
      });
    });

    test('does not call callback if error level not included', () => {
      const noErrorCapturer = new LogCapturer(
        mockPage,
        'http://localhost:5555/',
        { levels: ['log', 'info'] }
      );
      noErrorCapturer.start(callback);

      const error = new Error('Uncaught error');

      noErrorCapturer.handlePageError(error);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('handleRequestFailed', () => {
    beforeEach(() => {
      capturer.start(callback);
    });

    test('calls callback with request failure log data', () => {
      const mockRequest = {
        url: () => 'http://localhost:5555/api/data',
        failure: () => ({ errorText: 'net::ERR_CONNECTION_REFUSED' }),
      };

      capturer.handleRequestFailed(mockRequest);

      expect(callback).toHaveBeenCalledWith({
        type: 'error',
        args: [
          'Request failed: http://localhost:5555/api/data - net::ERR_CONNECTION_REFUSED',
        ],
        source: 'http://localhost:5555/',
        timestamp: expect.any(Number),
        location: {},
      });
    });

    test('does not call callback if error level not included', () => {
      const noErrorCapturer = new LogCapturer(
        mockPage,
        'http://localhost:5555/',
        { levels: ['log', 'info'] }
      );
      noErrorCapturer.start(callback);

      const mockRequest = {
        url: () => 'http://localhost:5555/api/data',
        failure: () => ({ errorText: 'Failed' }),
      };

      noErrorCapturer.handleRequestFailed(mockRequest);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('extractArgs', () => {
    test('extracts simple string argument', async () => {
      const mockMsg = {
        args: () => [
          {
            jsonValue: async () => 'hello',
          },
        ],
      };

      const args = await capturer.extractArgs(mockMsg);
      expect(args).toEqual(['hello']);
    });

    test('extracts multiple arguments', async () => {
      const mockMsg = {
        args: () => [
          { jsonValue: async () => 'hello' },
          { jsonValue: async () => 123 },
          { jsonValue: async () => true },
        ],
      };

      const args = await capturer.extractArgs(mockMsg);
      expect(args).toEqual(['hello', 123, true]);
    });

    test('extracts object argument', async () => {
      const mockMsg = {
        args: () => [
          {
            jsonValue: async () => ({ key: 'value' }),
          },
        ],
      };

      const args = await capturer.extractArgs(mockMsg);
      expect(args).toEqual([{ key: 'value' }]);
    });

    test('extracts null', async () => {
      const mockMsg = {
        args: () => [
          {
            jsonValue: async () => null,
          },
        ],
      };

      const args = await capturer.extractArgs(mockMsg);
      expect(args).toEqual([null]);
    });

    test('extracts undefined', async () => {
      const mockMsg = {
        args: () => [
          {
            jsonValue: async () => undefined,
          },
        ],
      };

      const args = await capturer.extractArgs(mockMsg);
      expect(args).toEqual([undefined]);
    });

    test('falls back to string representation for non-serializable values', async () => {
      const mockMsg = {
        args: () => [
          {
            jsonValue: async () => {
              throw new Error('Cannot serialize');
            },
            evaluate: jest.fn().mockResolvedValue('function() {}'),
          },
        ],
      };

      const args = await capturer.extractArgs(mockMsg);
      expect(args).toEqual(['function() {}']);
    });

    test('handles null in evaluate fallback', async () => {
      const mockMsg = {
        args: () => [
          {
            jsonValue: async () => {
              throw new Error('Cannot serialize');
            },
            evaluate: jest.fn().mockImplementation((fn) => {
              return Promise.resolve(fn(null));
            }),
          },
        ],
      };

      const args = await capturer.extractArgs(mockMsg);
      expect(args).toEqual(['null']);
    });

    test('handles undefined in evaluate fallback', async () => {
      const mockMsg = {
        args: () => [
          {
            jsonValue: async () => {
              throw new Error('Cannot serialize');
            },
            evaluate: jest.fn().mockImplementation((fn) => {
              return Promise.resolve(fn(undefined));
            }),
          },
        ],
      };

      const args = await capturer.extractArgs(mockMsg);
      expect(args).toEqual(['undefined']);
    });

    test('handles function in evaluate fallback', async () => {
      const mockMsg = {
        args: () => [
          {
            jsonValue: async () => {
              throw new Error('Cannot serialize');
            },
            evaluate: jest.fn().mockImplementation((fn) => {
              return Promise.resolve(
                fn(function testFunc() {
                  return 'test';
                })
              );
            }),
          },
        ],
      };

      const args = await capturer.extractArgs(mockMsg);
      expect(args[0]).toContain('function testFunc()');
    });

    test('handles symbol in evaluate fallback', async () => {
      const mockMsg = {
        args: () => [
          {
            jsonValue: async () => {
              throw new Error('Cannot serialize');
            },
            evaluate: jest.fn().mockImplementation((fn) => {
              return Promise.resolve(fn(Symbol('test')));
            }),
          },
        ],
      };

      const args = await capturer.extractArgs(mockMsg);
      expect(args[0]).toContain('Symbol(test)');
    });

    test('uses toString as last resort', async () => {
      const mockMsg = {
        args: () => [
          {
            jsonValue: async () => {
              throw new Error('Cannot serialize');
            },
            evaluate: async () => {
              throw new Error('Evaluate failed');
            },
            toString: () => 'JSHandle@object',
          },
        ],
      };

      const args = await capturer.extractArgs(mockMsg);
      expect(args).toEqual(['JSHandle@object']);
    });

    test('handles empty args', async () => {
      const mockMsg = {
        args: () => [],
      };

      const args = await capturer.extractArgs(mockMsg);
      expect(args).toEqual([]);
    });
  });

  describe('stop', () => {
    test('removes all event listeners', () => {
      capturer.start(callback);
      capturer.stop();

      expect(mockPage.removeAllListeners).toHaveBeenCalledWith('console');
      expect(mockPage.removeAllListeners).toHaveBeenCalledWith('pageerror');
      expect(mockPage.removeAllListeners).toHaveBeenCalledWith('requestfailed');
    });

    test('clears callback', () => {
      capturer.start(callback);
      capturer.stop();

      expect(capturer.callback).toBeNull();
    });
  });
});
