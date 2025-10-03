/**
 * Log Capturer
 * Captures console events from browser pages
 */

class LogCapturer {
  constructor(page, url, options = {}) {
    this.page = page;
    this.url = url;
    this.levels = options.levels || ['log', 'info', 'warning', 'error', 'debug'];
    this.callback = null;
  }

  /**
   * Start capturing console logs
   * @param {Function} callback - Callback function for each log
   */
  start(callback) {
    this.callback = callback;

    // Listen for console events
    this.page.on('console', async (msg) => {
      await this.handleConsoleMessage(msg);
    });

    // Listen for page errors (uncaught exceptions)
    this.page.on('pageerror', (error) => {
      this.handlePageError(error);
    });

    // Listen for request failures
    this.page.on('requestfailed', (request) => {
      this.handleRequestFailed(request);
    });
  }

  /**
   * Handle a console message
   * @param {ConsoleMessage} msg - Puppeteer console message
   */
  async handleConsoleMessage(msg) {
    const type = msg.type();

    // Filter by log level if specified
    if (!this.levels.includes(type)) {
      return;
    }

    try {
      // Extract arguments
      const args = await this.extractArgs(msg);

      // Create log data object
      const logData = {
        type,
        args,
        source: this.url,
        timestamp: Date.now(),
        location: msg.location(),
      };

      // Call callback
      if (this.callback) {
        this.callback(logData);
      }
    } catch (error) {
      console.error('Error processing console message:', error.message);
    }
  }

  /**
   * Handle page errors (uncaught exceptions)
   * @param {Error} error - The error object
   */
  handlePageError(error) {
    if (!this.levels.includes('error')) {
      return;
    }

    const logData = {
      type: 'error',
      args: [`Uncaught Exception: ${error.message}`],
      source: this.url,
      timestamp: Date.now(),
      location: {},
    };

    if (this.callback) {
      this.callback(logData);
    }
  }

  /**
   * Handle failed requests
   * @param {HTTPRequest} request - The failed request
   */
  handleRequestFailed(request) {
    if (!this.levels.includes('error')) {
      return;
    }

    const failure = request.failure();
    const logData = {
      type: 'error',
      args: [`Request failed: ${request.url()} - ${failure.errorText}`],
      source: this.url,
      timestamp: Date.now(),
      location: {},
    };

    if (this.callback) {
      this.callback(logData);
    }
  }

  /**
   * Extract and serialize console message arguments
   * @param {ConsoleMessage} msg - Console message
   * @returns {Promise<Array>} Serialized arguments
   */
  async extractArgs(msg) {
    const args = [];
    const jsHandles = msg.args();

    for (const handle of jsHandles) {
      try {
        // Try to serialize the argument
        const json = await handle.jsonValue();
        args.push(json);
      } catch (error) {
        // If serialization fails, try to get string representation
        try {
          const text = await handle.evaluate((obj) => {
            if (obj === null) return 'null';
            if (obj === undefined) return 'undefined';
            if (typeof obj === 'function') return obj.toString();
            if (typeof obj === 'symbol') return obj.toString();
            return String(obj);
          });
          args.push(text);
        } catch {
          // Last resort: use toString from Puppeteer
          args.push(handle.toString());
        }
      }
    }

    return args;
  }

  /**
   * Stop capturing console logs
   */
  stop() {
    // Remove all listeners
    this.page.removeAllListeners('console');
    this.page.removeAllListeners('pageerror');
    this.page.removeAllListeners('requestfailed');
    this.callback = null;
  }
}

module.exports = LogCapturer;
