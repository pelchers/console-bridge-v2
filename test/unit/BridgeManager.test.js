/**
 * Tests for BridgeManager
 */

const BridgeManager = require('../../src/core/BridgeManager');
const BrowserPool = require('../../src/core/BrowserPool');
const LogCapturer = require('../../src/core/LogCapturer');

// Mock BrowserPool and LogCapturer
jest.mock('../../src/core/BrowserPool');
jest.mock('../../src/core/LogCapturer');

describe('BridgeManager', () => {
  let manager;
  let mockPage;
  let mockBrowser;
  let mockOutput;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock page
    mockPage = {
      goto: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
      on: jest.fn(),
      removeAllListeners: jest.fn(),
      setDefaultTimeout: jest.fn(),
    };

    // Create mock browser
    mockBrowser = {
      newPage: jest.fn().mockResolvedValue(mockPage),
      close: jest.fn().mockResolvedValue(undefined),
    };

    // Mock BrowserPool methods
    BrowserPool.mockImplementation(() => ({
      create: jest.fn().mockResolvedValue({
        browser: mockBrowser,
        page: mockPage,
        url: 'http://localhost:5555/',
      }),
      destroy: jest.fn().mockResolvedValue(undefined),
      destroyAll: jest.fn().mockResolvedValue(undefined),
      get: jest.fn(),
      has: jest.fn(),
      count: jest.fn(),
      getUrls: jest.fn(),
    }));

    // Mock LogCapturer methods
    LogCapturer.mockImplementation(() => ({
      start: jest.fn(),
      stop: jest.fn(),
    }));

    // Mock output function
    mockOutput = jest.fn();

    // Create manager
    manager = new BridgeManager({
      output: mockOutput,
    });
  });

  describe('constructor', () => {
    test('creates manager with default options', () => {
      const defaultManager = new BridgeManager();

      expect(defaultManager.options.maxInstances).toBe(10);
      expect(defaultManager.options.headless).toBe(true);
      expect(defaultManager.options.levels).toEqual([
        'log', 'info', 'warning', 'error', 'debug',
        'dir', 'dirxml', 'table', 'trace', 'clear',
        'startGroup', 'startGroupCollapsed', 'endGroup',
        'assert', 'profile', 'profileEnd', 'count', 'timeEnd'
      ]);
    });

    test('creates manager with custom options', () => {
      const customManager = new BridgeManager({
        maxInstances: 5,
        headless: false,
        levels: ['log', 'error'],
      });

      expect(customManager.options.maxInstances).toBe(5);
      expect(customManager.options.headless).toBe(false);
      expect(customManager.options.levels).toEqual(['log', 'error']);
    });

    test('creates BrowserPool with correct options', () => {
      const customManager = new BridgeManager({
        maxInstances: 7,
        headless: false,
      });

      expect(BrowserPool).toHaveBeenCalledWith({
        maxInstances: 7,
        headless: false,
      });
    });
  });

  describe('addUrl', () => {
    test('adds and monitors a new URL', async () => {
      await manager.addUrl('localhost:5555');

      expect(manager.browserPool.create).toHaveBeenCalledWith(
        'http://localhost:5555/'
      );
      expect(LogCapturer).toHaveBeenCalled();
      expect(mockPage.goto).toHaveBeenCalledWith(
        'http://localhost:5555/',
        expect.any(Object)
      );
    });

    test('normalizes URL before adding', async () => {
      await manager.addUrl('localhost:5555');

      expect(manager.browserPool.create).toHaveBeenCalledWith(
        'http://localhost:5555/'
      );
    });

    test('does not add duplicate URL', async () => {
      await manager.addUrl('localhost:5555');
      await manager.addUrl('localhost:5555');

      // Should only create once
      expect(manager.browserPool.create).toHaveBeenCalledTimes(1);
    });

    test('creates LogCapturer with correct options', async () => {
      const customManager = new BridgeManager({
        levels: ['log', 'error'],
        output: mockOutput,
      });

      await customManager.addUrl('localhost:5555');

      expect(LogCapturer).toHaveBeenCalledWith(
        mockPage,
        'http://localhost:5555/',
        {
          levels: ['log', 'error'],
        }
      );
    });

    test('starts log capturer with callback', async () => {
      await manager.addUrl('localhost:5555');

      const capturerInstance = LogCapturer.mock.results[0].value;
      expect(capturerInstance.start).toHaveBeenCalledWith(expect.any(Function));
    });

    test('throws error for invalid URL', async () => {
      await expect(manager.addUrl('invalid-url')).rejects.toThrow();
    });

    test('throws error for non-localhost URL', async () => {
      await expect(manager.addUrl('http://google.com')).rejects.toThrow(
        'Only localhost URLs are supported'
      );
    });

    test('cleans up on failure', async () => {
      manager.browserPool.create.mockRejectedValueOnce(
        new Error('Browser launch failed')
      );

      await expect(manager.addUrl('localhost:5555')).rejects.toThrow();

      expect(manager.browserPool.destroy).toHaveBeenCalled();
    });
  });

  describe('removeUrl', () => {
    test('removes a monitored URL', async () => {
      await manager.addUrl('localhost:5555');
      await manager.removeUrl('localhost:5555');

      const capturerInstance = LogCapturer.mock.results[0].value;
      expect(capturerInstance.stop).toHaveBeenCalled();
      expect(manager.browserPool.destroy).toHaveBeenCalledWith(
        'http://localhost:5555/'
      );
    });

    test('handles removing non-existent URL gracefully', async () => {
      await expect(
        manager.removeUrl('localhost:9999')
      ).resolves.not.toThrow();
    });

    test('normalizes URL before removing', async () => {
      await manager.addUrl('localhost:5555');
      await manager.removeUrl('localhost:5555');

      expect(manager.browserPool.destroy).toHaveBeenCalledWith(
        'http://localhost:5555/'
      );
    });
  });

  describe('start', () => {
    test('starts monitoring single URL', async () => {
      await manager.start('localhost:5555');

      expect(manager.browserPool.create).toHaveBeenCalledWith(
        'http://localhost:5555/'
      );
    });

    test('starts monitoring multiple URLs', async () => {
      await manager.start(['localhost:5555', 'localhost:6666']);

      expect(manager.browserPool.create).toHaveBeenCalledWith(
        'http://localhost:5555/'
      );
      expect(manager.browserPool.create).toHaveBeenCalledWith(
        'http://localhost:6666/'
      );
    });

    test('continues on individual URL failure', async () => {
      manager.browserPool.create
        .mockResolvedValueOnce({
          browser: mockBrowser,
          page: mockPage,
          url: 'http://localhost:5555/',
        })
        .mockRejectedValueOnce(new Error('Failed'))
        .mockResolvedValueOnce({
          browser: mockBrowser,
          page: mockPage,
          url: 'http://localhost:7777/',
        });

      await manager.start([
        'localhost:5555',
        'localhost:6666',
        'localhost:7777',
      ]);

      // Should have attempted all three
      expect(manager.browserPool.create).toHaveBeenCalledTimes(3);
    });
  });

  describe('stop', () => {
    test('stops all monitoring', async () => {
      await manager.addUrl('localhost:5555');
      await manager.addUrl('localhost:6666');
      await manager.stop();

      expect(manager.browserPool.destroyAll).toHaveBeenCalled();
    });

    test('stops all capturers', async () => {
      await manager.addUrl('localhost:5555');
      await manager.addUrl('localhost:6666');

      const capturer1 = LogCapturer.mock.results[0].value;
      const capturer2 = LogCapturer.mock.results[1].value;

      await manager.stop();

      expect(capturer1.stop).toHaveBeenCalled();
      expect(capturer2.stop).toHaveBeenCalled();
    });

    test('clears capturers map', async () => {
      await manager.addUrl('localhost:5555');
      await manager.stop();

      expect(manager.capturers.size).toBe(0);
    });
  });

  describe('getActiveUrls', () => {
    test('returns empty array when no URLs active', () => {
      expect(manager.getActiveUrls()).toEqual([]);
    });

    test('returns list of active URLs', async () => {
      await manager.addUrl('localhost:5555');
      await manager.addUrl('localhost:6666');

      const urls = manager.getActiveUrls();

      expect(urls).toContain('http://localhost:5555/');
      expect(urls).toContain('http://localhost:6666/');
      expect(urls).toHaveLength(2);
    });

    test('updates after removing URL', async () => {
      await manager.addUrl('localhost:5555');
      await manager.addUrl('localhost:6666');
      await manager.removeUrl('localhost:5555');

      const urls = manager.getActiveUrls();

      expect(urls).not.toContain('http://localhost:5555/');
      expect(urls).toContain('http://localhost:6666/');
      expect(urls).toHaveLength(1);
    });
  });

  describe('isActive', () => {
    test('returns false for inactive URL', () => {
      expect(manager.isActive('localhost:5555')).toBe(false);
    });

    test('returns true for active URL', async () => {
      await manager.addUrl('localhost:5555');

      expect(manager.isActive('localhost:5555')).toBe(true);
    });

    test('returns false after removing URL', async () => {
      await manager.addUrl('localhost:5555');
      await manager.removeUrl('localhost:5555');

      expect(manager.isActive('localhost:5555')).toBe(false);
    });

    test('normalizes URL before checking', async () => {
      await manager.addUrl('localhost:5555');

      expect(manager.isActive('http://localhost:5555/')).toBe(true);
    });

    test('returns false for invalid URL', () => {
      expect(manager.isActive('invalid-url')).toBe(false);
    });
  });

  describe('handleLog', () => {
    test('formats and outputs log', async () => {
      await manager.addUrl('localhost:5555');

      // Get the callback passed to capturer.start()
      const capturerInstance = LogCapturer.mock.results[0].value;
      const callback = capturerInstance.start.mock.calls[0][0];

      // Simulate a log entry
      const logData = {
        type: 'log',
        args: ['Test message'],
        source: 'http://localhost:5555/',
        timestamp: Date.now(),
        location: {},
      };

      callback(logData);

      expect(mockOutput).toHaveBeenCalled();
      const output = mockOutput.mock.calls[0][0];
      expect(output).toContain('log:');
      expect(output).toContain('Test message');
    });

    test('handles formatter errors gracefully', async () => {
      await manager.addUrl('localhost:5555');

      // Spy on console.error
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      // Get the callback
      const capturerInstance = LogCapturer.mock.results[0].value;
      const callback = capturerInstance.start.mock.calls[0][0];

      // Mock formatter.format to throw error
      manager.formatter.format = jest.fn().mockImplementation(() => {
        throw new Error('Format error');
      });

      // Simulate log entry
      const logData = {
        type: 'log',
        args: ['Test'],
        source: 'http://localhost:5555/',
        timestamp: Date.now(),
        location: {},
      };

      callback(logData);

      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('integration', () => {
    test('complete lifecycle: add, log, remove', async () => {
      // Add URL
      await manager.addUrl('localhost:5555');
      expect(manager.isActive('localhost:5555')).toBe(true);

      // Simulate log
      const capturerInstance = LogCapturer.mock.results[0].value;
      const callback = capturerInstance.start.mock.calls[0][0];

      callback({
        type: 'log',
        args: ['Hello'],
        source: 'http://localhost:5555/',
        timestamp: Date.now(),
        location: {},
      });

      expect(mockOutput).toHaveBeenCalled();

      // Remove URL
      await manager.removeUrl('localhost:5555');
      expect(manager.isActive('localhost:5555')).toBe(false);
    });

    test('manages multiple URLs simultaneously', async () => {
      // Add multiple URLs
      await manager.start(['localhost:5555', 'localhost:6666', 'localhost:7777']);

      expect(manager.getActiveUrls()).toHaveLength(3);

      // Remove one
      await manager.removeUrl('localhost:6666');
      expect(manager.getActiveUrls()).toHaveLength(2);

      // Stop all
      await manager.stop();
      expect(manager.getActiveUrls()).toHaveLength(0);
    });
  });
});
