/**
 * Browser Pool
 * Manages multiple Puppeteer browser instances
 */

const puppeteer = require('puppeteer');

class BrowserPool {
  constructor(options = {}) {
    this.instances = new Map();
    this.maxInstances = options.maxInstances || 10;
    this.headless = options.headless !== false; // Default to true
    this.browserConfig = {
      headless: this.headless ? 'new' : false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security', // Allow localhost cross-origin
      ],
      defaultViewport: {
        width: 1920,
        height: 1080,
      },
    };
  }

  /**
   * Create a new browser instance for a URL
   * @param {string} url - The URL to monitor
   * @returns {Promise<{browser: Browser, page: Page}>}
   */
  async create(url) {
    if (this.instances.size >= this.maxInstances) {
      throw new Error(`Maximum instances reached (${this.maxInstances})`);
    }

    if (this.instances.has(url)) {
      return this.instances.get(url);
    }

    try {
      // Launch browser
      const browser = await puppeteer.launch(this.browserConfig);

      // Create new page
      const page = await browser.newPage();

      // Set a reasonable timeout
      page.setDefaultTimeout(30000);

      // Handle page crashes
      page.on('error', (error) => {
        console.error(`❌ Page error for ${url}:`, error.message);
      });

      page.on('pageerror', (error) => {
        // These are errors from the page itself, not Puppeteer
        // We'll let them through to console capture
      });

      const instance = { browser, page, url };
      this.instances.set(url, instance);

      return instance;
    } catch (error) {
      throw new Error(`Failed to launch browser: ${error.message}`);
    }
  }

  /**
   * Get an existing instance
   * @param {string} url - The URL
   * @returns {{browser: Browser, page: Page}|undefined}
   */
  get(url) {
    return this.instances.get(url);
  }

  /**
   * Check if an instance exists
   * @param {string} url - The URL
   * @returns {boolean}
   */
  has(url) {
    return this.instances.has(url);
  }

  /**
   * Destroy a specific browser instance
   * @param {string} url - The URL
   */
  async destroy(url) {
    const instance = this.instances.get(url);
    if (!instance) {
      return;
    }

    try {
      await instance.page.close();
      await instance.browser.close();
    } catch (error) {
      // Ignore errors during cleanup
      console.error(`Warning: Error closing browser for ${url}:`, error.message);
    } finally {
      this.instances.delete(url);
    }
  }

  /**
   * Destroy all browser instances
   */
  async destroyAll() {
    const urls = Array.from(this.instances.keys());
    const closePromises = urls.map((url) => this.destroy(url));

    await Promise.allSettled(closePromises);
    this.instances.clear();
  }

  /**
   * Get count of active instances
   * @returns {number}
   */
  count() {
    return this.instances.size;
  }

  /**
   * Get all active URLs
   * @returns {string[]}
   */
  getUrls() {
    return Array.from(this.instances.keys());
  }
}

module.exports = BrowserPool;
