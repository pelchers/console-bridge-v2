/**
 * Console Bridge Panel Logic
 *
 * Handles:
 * - Console event capture via chrome.devtools.inspectedWindow.eval()
 * - Object serialization (circular refs, DOM elements, functions)
 * - WebSocket connection to CLI
 * - UI status updates
 */

class ConsoleBridgePOC {
  constructor() {
    // WebSocket connection
    this.ws = null;
    this.serverUrl = 'ws://localhost:9223';
    this.reconnectDelay = 1000;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;

    // Statistics
    this.stats = {
      eventsCaptured: 0,
      messagesSent: 0,
      errors: 0
    };

    // Tab info
    this.tabId = `chrome-tab-${Date.now()}`;
    this.tabUrl = chrome.devtools.inspectedWindow.tabId;

    // UI elements
    this.ui = {
      statusIndicator: document.getElementById('statusIndicator'),
      statusText: document.getElementById('statusText'),
      serverAddress: document.getElementById('serverAddress'),
      tabUrl: document.getElementById('tabUrl'),
      eventCount: document.getElementById('eventCount'),
      messageCount: document.getElementById('messageCount'),
      errorCount: document.getElementById('errorCount'),
      errorMessage: document.getElementById('errorMessage')
    };

    // Initialize
    this.init();
  }

  /**
   * Initialize the POC
   */
  async init() {
    console.log('[Console Bridge POC] Initializing...');

    // Update tab URL
    this.updateTabUrl();

    // Connect to WebSocket server
    this.connectWebSocket();

    // Start console capture
    this.startConsoleCapture();

    // Listen for tab navigation
    chrome.devtools.network.onNavigated.addListener(() => {
      console.log('[Console Bridge POC] Page navigated');
      this.updateTabUrl();
      this.startConsoleCapture(); // Re-inject capture script
    });
  }

  /**
   * Update tab URL in UI
   */
  updateTabUrl() {
    chrome.devtools.inspectedWindow.eval(
      'window.location.href',
      (result, isException) => {
        if (!isException && result) {
          this.ui.tabUrl.textContent = result;
        }
      }
    );
  }

  /**
   * Connect to WebSocket server
   */
  connectWebSocket() {
    try {
      console.log(`[Console Bridge POC] Connecting to ${this.serverUrl}...`);

      this.ws = new WebSocket(this.serverUrl);

      this.ws.onopen = () => {
        console.log('[Console Bridge POC] WebSocket connected');
        this.reconnectAttempts = 0;
        this.updateConnectionStatus(true);

        // Send connection handshake
        this.sendMessage({
          type: 'connect',
          browser: 'chrome',
          browserVersion: navigator.userAgent,
          extensionVersion: '2.0.0-poc',
          tabId: this.tabId,
          tabUrl: this.ui.tabUrl.textContent,
          timestamp: Date.now()
        });
      };

      this.ws.onclose = () => {
        console.log('[Console Bridge POC] WebSocket disconnected');
        this.updateConnectionStatus(false);
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('[Console Bridge POC] WebSocket error:', error);
        this.showError('WebSocket connection failed. Is the CLI running with --extension-mode?');
        this.stats.errors++;
        this.updateStats();
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('[Console Bridge POC] Received:', message);

          if (message.type === 'welcome') {
            console.log('[Console Bridge POC] Server welcome:', message.message);
          }
        } catch (error) {
          console.error('[Console Bridge POC] Failed to parse message:', error);
        }
      };

    } catch (error) {
      console.error('[Console Bridge POC] Failed to create WebSocket:', error);
      this.showError(`Failed to connect: ${error.message}`);
      this.scheduleReconnect();
    }
  }

  /**
   * Schedule WebSocket reconnection
   */
  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[Console Bridge POC] Max reconnect attempts reached');
      this.showError('Max reconnection attempts reached. Please restart the CLI.');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`[Console Bridge POC] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})...`);

    setTimeout(() => {
      this.connectWebSocket();
    }, delay);
  }

  /**
   * Start console capture
   */
  startConsoleCapture() {
    console.log('[Console Bridge POC] Starting console capture...');

    // Inject console capture script into inspected page
    const captureScript = `
      (function() {
        // Check if already injected
        if (window.__consoleBridgePOC) {
          return;
        }
        window.__consoleBridgePOC = true;

        // Store original console methods
        const originalConsole = {
          log: console.log.bind(console),
          info: console.info.bind(console),
          warn: console.warn.bind(console),
          error: console.error.bind(console),
          debug: console.debug.bind(console)
        };

        // Override console methods
        ['log', 'info', 'warn', 'error', 'debug'].forEach(method => {
          console[method] = function(...args) {
            // Call original console method
            originalConsole[method](...args);

            // Notify extension
            window.postMessage({
              type: 'console-bridge-event',
              method: method,
              args: args,
              timestamp: Date.now()
            }, '*');
          };
        });

        console.log('[Console Bridge POC] Console capture active');
      })();
    `;

    chrome.devtools.inspectedWindow.eval(
      captureScript,
      (result, isException) => {
        if (isException) {
          console.error('[Console Bridge POC] Failed to inject capture script:', isException);
          this.showError('Failed to inject console capture script');
          this.stats.errors++;
          this.updateStats();
        } else {
          console.log('[Console Bridge POC] Console capture injected successfully');
          this.listenForConsoleEvents();
        }
      }
    );
  }

  /**
   * Listen for console events from inspected page
   */
  listenForConsoleEvents() {
    // Poll for console events using eval
    const pollScript = `
      (function() {
        // This is a simplified POC approach
        // In production, we'd use chrome.devtools.inspectedWindow.onResourceContentCommitted
        // or a more sophisticated message passing system

        // For POC, we'll use a global queue
        if (!window.__consoleBridgeQueue) {
          window.__consoleBridgeQueue = [];
        }

        // Return and clear queue
        const events = window.__consoleBridgeQueue.splice(0);
        return events;
      })();
    `;

    // Poll every 100ms
    setInterval(() => {
      chrome.devtools.inspectedWindow.eval(
        pollScript,
        (events, isException) => {
          if (!isException && events && events.length > 0) {
            events.forEach(event => {
              this.handleConsoleEvent(event);
            });
          }
        }
      );
    }, 100);

    // Alternative approach: Listen for console API calls
    // This uses chrome.devtools.inspectedWindow.eval to detect console calls
    this.monitorConsoleAPI();
  }

  /**
   * Monitor console API using DevTools protocol
   */
  monitorConsoleAPI() {
    // Use chrome.devtools.inspectedWindow.eval with a more direct approach
    const monitorScript = `
      (function() {
        const originalConsole = {};
        const methods = ['log', 'info', 'warn', 'error', 'debug', 'dir', 'table', 'trace'];

        methods.forEach(method => {
          originalConsole[method] = console[method];

          console[method] = function(...args) {
            // Call original
            originalConsole[method].apply(console, args);

            // Serialize and store event
            try {
              const serializedArgs = args.map(arg => {
                if (arg === null) return null;
                if (arg === undefined) return undefined;
                if (typeof arg !== 'object') return arg;

                // Handle DOM elements
                if (arg instanceof Element) {
                  return {
                    __type: 'DOMElement',
                    tagName: arg.tagName,
                    id: arg.id,
                    className: arg.className
                  };
                }

                // Handle functions
                if (typeof arg === 'function') {
                  return {
                    __type: 'Function',
                    name: arg.name || '(anonymous)'
                  };
                }

                // Handle objects (with circular reference protection)
                try {
                  return JSON.parse(JSON.stringify(arg));
                } catch (e) {
                  return { __type: 'Object', __error: 'Circular reference' };
                }
              });

              // Store in global queue
              if (!window.__consoleBridgeQueue) {
                window.__consoleBridgeQueue = [];
              }

              window.__consoleBridgeQueue.push({
                method: '${method}',
                args: serializedArgs,
                timestamp: Date.now(),
                location: {
                  url: window.location.href
                }
              });

            } catch (error) {
              console.error('[Console Bridge] Serialization error:', error);
            }
          };
        });

        return 'Console monitoring active';
      })();
    `;

    chrome.devtools.inspectedWindow.eval(
      monitorScript,
      (result, isException) => {
        if (isException) {
          console.error('[Console Bridge POC] Failed to setup monitoring:', isException);
        } else {
          console.log('[Console Bridge POC] Console monitoring result:', result);
        }
      }
    );
  }

  /**
   * Handle console event
   */
  handleConsoleEvent(event) {
    console.log('[Console Bridge POC] Console event:', event);

    this.stats.eventsCaptured++;
    this.updateStats();

    // Send to WebSocket server
    this.sendMessage({
      version: '2.0',
      type: 'console',
      method: event.method,
      args: event.args,
      timestamp: event.timestamp,
      location: event.location || { url: this.ui.tabUrl.textContent },
      tabId: this.tabId,
      browser: 'chrome',
      extensionVersion: '2.0.0-poc'
    });
  }

  /**
   * Send message via WebSocket
   */
  sendMessage(message) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[Console Bridge POC] WebSocket not connected, message not sent');
      return;
    }

    try {
      this.ws.send(JSON.stringify(message));
      this.stats.messagesSent++;
      this.updateStats();
    } catch (error) {
      console.error('[Console Bridge POC] Failed to send message:', error);
      this.stats.errors++;
      this.updateStats();
    }
  }

  /**
   * Update connection status UI
   */
  updateConnectionStatus(connected) {
    if (connected) {
      this.ui.statusIndicator.classList.remove('disconnected');
      this.ui.statusIndicator.classList.add('connected');
      this.ui.statusText.textContent = 'Connected';
      this.hideError();
    } else {
      this.ui.statusIndicator.classList.remove('connected');
      this.ui.statusIndicator.classList.add('disconnected');
      this.ui.statusText.textContent = 'Disconnected';
    }
  }

  /**
   * Update statistics UI
   */
  updateStats() {
    this.ui.eventCount.textContent = this.stats.eventsCaptured;
    this.ui.messageCount.textContent = this.stats.messagesSent;
    this.ui.errorCount.textContent = this.stats.errors;
  }

  /**
   * Show error message
   */
  showError(message) {
    this.ui.errorMessage.textContent = message;
    this.ui.errorMessage.classList.add('visible');
  }

  /**
   * Hide error message
   */
  hideError() {
    this.ui.errorMessage.classList.remove('visible');
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('[Console Bridge POC] DOM ready, initializing...');
  window.consoleBridge = new ConsoleBridgePOC();
});
