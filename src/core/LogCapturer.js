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

    // Use CDP (Chrome DevTools Protocol) to capture ALL console types
    const client = await this.page.target().createCDPSession();
    await client.send('Runtime.enable');

    // Listen for Runtime.consoleAPICalled (captures ALL console methods)
    client.on('Runtime.consoleAPICalled', async (event) => {
      await this.handleCDPConsoleMessage(event);
    });

    this.cdpClient = client;

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
   * Handle CDP console API called event
   * @param {Object} event - CDP Runtime.consoleAPICalled event
   */
  async handleCDPConsoleMessage(event) {
    const type = event.type;

    // Filter by log level if specified
    if (!this.levels.includes(type)) {
      return;
    }

    try {
      // Extract arguments from CDP format
      const args = await this.extractCDPArgs(event.args);

      // Create log data object
      const logData = {
        type,
        args,
        source: this.url,
        timestamp: event.timestamp || Date.now(),
        location: event.stackTrace && event.stackTrace.callFrames[0] ? {
          url: event.stackTrace.callFrames[0].url,
          lineNumber: event.stackTrace.callFrames[0].lineNumber,
          columnNumber: event.stackTrace.callFrames[0].columnNumber,
        } : {},
      };

      // Call callback
      if (this.callback) {
        this.callback(logData);
      }
    } catch (error) {
      console.error('Error processing CDP console message:', error.message);
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
   * Extract arguments from CDP Remote objects
   * @param {Array} remoteObjects - CDP RemoteObject array
   * @returns {Promise<Array>} Serialized arguments
   */
  async extractCDPArgs(remoteObjects) {
    const args = [];

    for (const obj of remoteObjects) {
      try {
        // Handle different types of RemoteObjects
        if (obj.type === 'undefined') {
          args.push(undefined);
        } else if (obj.type === 'null') {
          args.push(null);
        } else if (obj.type === 'string' || obj.type === 'number' || obj.type === 'boolean') {
          args.push(obj.value);
        } else if (obj.type === 'object') {
          // Try to get object properties via CDP
          if (obj.objectId && this.cdpClient) {
            try {
              const properties = await this.cdpClient.send('Runtime.getProperties', {
                objectId: obj.objectId,
                ownProperties: true,
              });

              // Build object from properties
              const result = {};
              for (const prop of properties.result) {
                if (prop.enumerable && prop.value) {
                  result[prop.name] = await this.serializeCDPValue(prop.value);
                }
              }
              args.push(result);
            } catch {
              args.push(obj.description || '[Object]');
            }
          } else {
            args.push(obj.description || '[Object]');
          }
        } else if (obj.type === 'function') {
          args.push(obj.description || '[Function]');
        } else {
          args.push(obj.description || String(obj.value));
        }
      } catch (error) {
        args.push('[Error serializing]');
      }
    }

    return args;
  }

  /**
   * Serialize a CDP RemoteObject value
   * @param {Object} obj - CDP RemoteObject
   * @returns {Promise<any>} Serialized value
   */
  async serializeCDPValue(obj) {
    if (obj.type === 'undefined') return undefined;
    if (obj.type === 'null') return null;
    if (obj.type === 'string' || obj.type === 'number' || obj.type === 'boolean') {
      return obj.value;
    }
    if (obj.type === 'object' && obj.objectId && this.cdpClient) {
      try {
        const properties = await this.cdpClient.send('Runtime.getProperties', {
          objectId: obj.objectId,
          ownProperties: true,
        });
        const result = {};
        for (const prop of properties.result) {
          if (prop.enumerable && prop.value) {
            result[prop.name] = await this.serializeCDPValue(prop.value);
          }
        }
        return result;
      } catch {
        return obj.description || '[Object]';
      }
    }
    return obj.description || String(obj.value);
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
