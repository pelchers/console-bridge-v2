/**
 * Bridge Manager
 * Central orchestrator for console bridging
 * Manages BrowserPool, LogCapturers, and log formatting
 */

const BrowserPool = require('./BrowserPool');
const LogCapturer = require('./LogCapturer');
const LogFormatter = require('../formatters/LogFormatter');
const { normalizeUrl } = require('../utils/url');

class BridgeManager {
  constructor(options = {}) {
    this.browserPool = new BrowserPool({
      maxInstances: options.maxInstances || 10,
      headless: options.headless !== false,
    });

    this.capturers = new Map();
    this.formatter = new LogFormatter(options.formatterOptions);

    this.options = {
      maxInstances: options.maxInstances || 10,
      headless: options.headless !== false,
      levels: options.levels || ['log', 'info', 'warning', 'error', 'debug'],
      output: options.output || console.log,
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

      // Create log capturer
      const capturer = new LogCapturer(page, normalizedUrl, {
        levels: this.options.levels,
      });

      // Start capturing logs
      capturer.start((logData) => this.handleLog(logData));

      // Store capturer
      this.capturers.set(normalizedUrl, capturer);

      // Navigate to URL
      await page.goto(normalizedUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });
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

    // Add all URLs in parallel
    const addPromises = urlArray.map((url) =>
      this.addUrl(url).catch((error) => {
        console.error(`Failed to start monitoring ${url}:`, error.message);
      })
    );

    await Promise.allSettled(addPromises);
  }

  /**
   * Stop all monitoring
   * @returns {Promise<void>}
   */
  async stop() {
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

      // Output to terminal
      this.options.output(formatted);
    } catch (error) {
      console.error('Error formatting log:', error.message);
    }
  }
}

module.exports = BridgeManager;
