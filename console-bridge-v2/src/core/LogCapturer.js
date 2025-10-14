/**
 * Log Capturer
 * Captures console events from browser pages
 */

class LogCapturer {
  constructor(page, url, options = {}) {
    this.page = page;
    this.url = url;
    this.levels = options.levels || [
      'log', 'info', 'warning', 'error', 'debug',
      'dir', 'dirxml', 'table', 'trace', 'clear',
      'startGroup', 'startGroupCollapsed', 'endGroup',
      'assert', 'profile', 'profileEnd', 'count', 'timeEnd'
    ];
    this.callback = null;
  }

  /**
   * Start capturing console logs
   * @param {Function} callback - Callback function for each log
   */
  async start(callback) {
    this.callback = callback;

    // Define event handlers
    this.consoleHandler = async (msg) => {
      await this.handleConsoleMessage(msg);
    };

    this.pageErrorHandler = (error) => {
      this.handlePageError(error);
    };

    this.requestFailedHandler = (request) => {
      this.handleRequestFailed(request);
    };

    // Attach event listeners
    this.attachListeners();

    // Re-attach listeners on framenavigated (handles SPA navigation, hot reload, etc.)
    this.page.on('framenavigated', () => {
      // Detach old listeners
      this.page.off('console', this.consoleHandler);
      this.page.off('pageerror', this.pageErrorHandler);
      this.page.off('requestfailed', this.requestFailedHandler);

      // Re-attach listeners
      this.attachListeners();
    });

    // Handle page crashes with recovery (Phase 6 - Subtask 6.2)
    this.page.on('error', async (error) => {
      console.error(`⚠️  Page crashed for ${this.url}: ${error.message}`);
      console.log('Attempting to recover...');

      try {
        // Try to reload the page
        await this.page.reload({ waitUntil: 'networkidle0', timeout: 5000 });
        console.log(`✓ Page recovered: ${this.url}`);

        // Re-attach listeners after recovery
        this.attachListeners();
      } catch (reloadError) {
        console.error(`❌ Recovery failed for ${this.url}: ${reloadError.message}`);
        console.log('Page remains crashed. Manual restart may be required.');
      }
    });
  }

  /**
   * Attach console event listeners
   * @private
   */
  attachListeners() {
    this.page.on('console', this.consoleHandler);
    this.page.on('pageerror', this.pageErrorHandler);
    this.page.on('requestfailed', this.requestFailedHandler);
  }

  /**
   * Handle Puppeteer console message
   * @param {ConsoleMessage} msg - Puppeteer ConsoleMessage object
   */
  async handleConsoleMessage(msg) {
    const type = msg.type();

    // Filter by log level if specified
    if (!this.levels.includes(type)) {
      return;
    }

    try {
      // Extract arguments from JSHandles
      const args = await this.extractPuppeteerArgs(msg.args());

      // Create log data object
      const logData = {
        type,
        args,
        source: this.url,
        timestamp: Date.now(),
        location: msg.location() || {},
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
   * Extract arguments from Puppeteer JSHandles
   * @param {Array} jsHandles - Array of JSHandles
   * @returns {Promise<Array>} Serialized arguments
   */
  async extractPuppeteerArgs(jsHandles) {
    const args = [];

    for (const handle of jsHandles) {
      try {
        // Use jsonValue() to extract the value from JSHandle
        const value = await handle.jsonValue().catch(() => {
          // If jsonValue() fails (functions, symbols, etc.), get string representation
          return handle.toString();
        });
        args.push(value);
      } catch (error) {
        args.push('[Error serializing]');
      }
    }

    return args;
  }

  /**
   * Stop capturing console logs
   */
  stop() {
    // Remove specific listeners
    this.page.off('console', this.consoleHandler);
    this.page.off('pageerror', this.pageErrorHandler);
    this.page.off('requestfailed', this.requestFailedHandler);
    this.page.removeAllListeners('framenavigated');
    this.callback = null;
  }
}

module.exports = LogCapturer;
