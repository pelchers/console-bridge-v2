/**
 * Bridge Manager
 * Central orchestrator for console bridging
 * Manages BrowserPool, LogCapturers, and log formatting
 */

const BrowserPool = require('./BrowserPool');
const LogCapturer = require('./LogCapturer');
const LogFormatter = require('../formatters/LogFormatter');
const TerminalAttacher = require('./TerminalAttacher');
const { normalizeUrl } = require('../utils/url');

class BridgeManager {
  constructor(options = {}) {
    this.browserPool = new BrowserPool({
      maxInstances: options.maxInstances || 10,
      headless: options.headless !== false,
    });

    this.capturers = new Map();
    this.formatter = new LogFormatter(options.formatterOptions);
    this.terminalAttacher = null;
    this.mergeOutput = options.mergeOutput || false;

    this.options = {
      maxInstances: options.maxInstances || 10,
      headless: options.headless !== false,
      levels: options.levels || [
        'log', 'info', 'warning', 'error', 'debug',
        'dir', 'dirxml', 'table', 'trace', 'clear',
        'startGroup', 'startGroupCollapsed', 'endGroup',
        'assert', 'profile', 'profileEnd', 'count', 'timeEnd'
      ],
      output: options.output || console.log,
      mergeOutput: options.mergeOutput || false,
    };
  }

  /**
   * Add a URL to monitor
   * @param {string} url - The URL to monitor
   * @returns {Promise<void>}
   */
  async addUrl(url) {
    // Normalize URL
    const normalizedUrl = normalizeUrl(url);

    // Check if already monitoring
    if (this.capturers.has(normalizedUrl)) {
      return;
    }

    try {
      // Create browser instance
      const { page } = await this.browserPool.create(normalizedUrl);

      // Navigate to URL FIRST (before creating CDP session)
      await page.goto(normalizedUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });

      // Create log capturer
      const capturer = new LogCapturer(page, normalizedUrl, {
        levels: this.options.levels,
      });

      // Start capturing logs (creates CDP session on the loaded page)
      await capturer.start((logData) => this.handleLog(logData));

      // Store capturer
      this.capturers.set(normalizedUrl, capturer);
    } catch (error) {
      // Clean up on failure
      await this.removeUrl(normalizedUrl);
      throw new Error(`Failed to add URL ${normalizedUrl}: ${error.message}`);
    }
  }

  /**
   * Remove a URL from monitoring
   * @param {string} url - The URL to stop monitoring
   * @returns {Promise<void>}
   */
  async removeUrl(url) {
    const normalizedUrl = normalizeUrl(url);

    // Stop capturer
    const capturer = this.capturers.get(normalizedUrl);
    if (capturer) {
      capturer.stop();
      this.capturers.delete(normalizedUrl);
    }

    // Destroy browser instance
    await this.browserPool.destroy(normalizedUrl);
  }

  /**
   * Start monitoring multiple URLs
   * @param {string|string[]} urls - URLs to monitor
   * @returns {Promise<void>}
   */
  async start(urls) {
    const urlArray = Array.isArray(urls) ? urls : [urls];

    // Attempt terminal attachment if merge-output is enabled
    if (this.mergeOutput && urlArray.length > 0) {
      await this.attemptTerminalAttachment(urlArray[0]);
    }

    // Add all URLs in parallel
    const addPromises = urlArray.map((url) =>
      this.addUrl(url).catch((error) => {
        console.error(`Failed to start monitoring ${url}:`, error.message);
      })
    );

    await Promise.allSettled(addPromises);
  }

  /**
   * Attempt to attach to dev server terminal for unified output
   * @param {string} url - First URL being monitored
   * @returns {Promise<void>}
   * @private
   */
  async attemptTerminalAttachment(url) {
    try {
      // Extract port from URL
      const normalizedUrl = normalizeUrl(url);
      const match = normalizedUrl.match(/:(\d+)/);
      
      if (!match) {
        console.log('⚠️  --merge-output: Could not extract port from URL. Using standard output.');
        return;
      }

      const port = parseInt(match[1], 10);

      // Create TerminalAttacher and attempt to attach
      this.terminalAttacher = new TerminalAttacher({ port });
      const result = await this.terminalAttacher.attach(port, this.options.output);

      if (result.success) {
        // Use the unified output function
        this.options.output = result.outputFn;
        console.log(`✓ ${result.message}`);
      } else {
        // Graceful fallback - use original output
        console.log(`ℹ️  ${result.message}`);
      }
    } catch (error) {
      console.log(`⚠️  --merge-output: ${error.message}. Using standard output.`);
    }
  }

  /**
   * Stop all monitoring
   * @returns {Promise<void>}
   */
  async stop() {
    // Detach from terminal if attached
    if (this.terminalAttacher) {
      this.terminalAttacher.detach();
    }

    // Stop all capturers
    for (const capturer of this.capturers.values()) {
      capturer.stop();
    }
    this.capturers.clear();

    // Destroy all browser instances
    await this.browserPool.destroyAll();
  }

  /**
   * Get list of active URLs
   * @returns {string[]}
   */
  getActiveUrls() {
    return Array.from(this.capturers.keys());
  }

  /**
   * Check if a URL is being monitored
   * @param {string} url - The URL to check
   * @returns {boolean}
   */
  isActive(url) {
    try {
      const normalizedUrl = normalizeUrl(url);
      return this.capturers.has(normalizedUrl);
    } catch {
      return false;
    }
  }

  /**
   * Handle a log entry
   * @param {Object} logData - Log data from LogCapturer
   * @private
   */
  handleLog(logData) {
    try {
      // Format the log
      const formatted = this.formatter.format(logData);

      // Output to terminal (skip if null - e.g., console.time() has no output)
      if (formatted !== null) {
        this.options.output(formatted);
      }
    } catch (error) {
      console.error('Error formatting log:', error.message);
    }
  }
}

module.exports = BridgeManager;
