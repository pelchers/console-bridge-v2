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

    // Message queuing
    this.messageQueue = [];
    this.maxQueueSize = 1000;

    // Ping/Pong keep-alive
    this.pingInterval = null;
    this.pongTimeout = null;
    this.pingIntervalMs = 30000;  // 30 seconds
    this.pongTimeoutMs = 5000;    // 5 seconds

    // Statistics
    this.stats = {
      eventsCaptured: 0,
      messagesSent: 0,
      errors: 0,
      queueSize: 0
    };

    // Tab info
    this.tabId = chrome.devtools.inspectedWindow.tabId;
    this.tabUrl = null;

    // UI elements
    this.ui = {
      statusIndicator: document.getElementById('statusIndicator'),
      statusText: document.getElementById('statusText'),
      serverAddress: document.getElementById('serverAddress'),
      tabUrl: document.getElementById('tabUrl'),
      eventCount: document.getElementById('eventCount'),
      messageCount: document.getElementById('messageCount'),
      queueSize: document.getElementById('queueSize'),
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

        // Send connection_status message (protocol v1.0.0)
        const connectionEnvelope = this.createEnvelope('connection_status', {
          status: 'connected',
          clientInfo: {
            extensionVersion: '2.0.0',
            browser: 'Chrome',
            browserVersion: navigator.userAgent
          }
        });
        this.sendMessage(connectionEnvelope);

        // Flush queued messages
        this.flushQueue();

        // Start ping/pong keep-alive
        this.startPingPong();
      };

      this.ws.onclose = () => {
        console.log('[Console Bridge POC] WebSocket disconnected');
        this.updateConnectionStatus(false);
        this.stopPingPong();
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

          // Handle pong messages
          if (message.type === 'pong') {
            this.handlePong();
          }

          // Handle welcome messages (for backwards compatibility)
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
          this.showError(`Failed to inject console capture script: ${JSON.stringify(isException)}`);
          this.stats.errors++;
          this.updateStats();

          // Try alternative monitoring method
          console.log('[Console Bridge POC] Trying alternative monitoring method...');
          this.monitorConsoleAPI();
          this.listenForConsoleEvents(); // Start polling for events
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
                method: method,
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

        // Global error handler for uncaught exceptions
        window.addEventListener('error', function(event) {
          try {
            if (!window.__consoleBridgeQueue) {
              window.__consoleBridgeQueue = [];
            }

            window.__consoleBridgeQueue.push({
              method: 'error',
              args: [event.message],
              timestamp: Date.now(),
              location: {
                url: window.location.href,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
              },
              stackTrace: event.error ? event.error.stack : null
            });
          } catch (error) {
            console.error('[Console Bridge] Error handler failed:', error);
          }
        }, true); // useCapture = true to catch all errors

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', function(event) {
          try {
            if (!window.__consoleBridgeQueue) {
              window.__consoleBridgeQueue = [];
            }

            const reason = event.reason;
            const message = reason instanceof Error
              ? reason.message
              : String(reason);

            window.__consoleBridgeQueue.push({
              method: 'error',
              args: [`Unhandled Promise Rejection: ${message}`],
              timestamp: Date.now(),
              location: {
                url: window.location.href
              },
              stackTrace: reason instanceof Error ? reason.stack : null
            });
          } catch (error) {
            console.error('[Console Bridge] Promise rejection handler failed:', error);
          }
        });

        // Intercept Fetch API for network error capture
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
          const url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url) || 'unknown';
          const method = args[1] && args[1].method ? args[1].method.toUpperCase() : 'GET';

          return originalFetch.apply(this, args)
            .then(response => {
              // Capture HTTP error status codes (4xx, 5xx)
              if (!response.ok) {
                try {
                  if (!window.__consoleBridgeQueue) {
                    window.__consoleBridgeQueue = [];
                  }

                  window.__consoleBridgeQueue.push({
                    method: 'error',
                    args: [`${method} ${url} ${response.status} (${response.statusText})`],
                    timestamp: Date.now(),
                    location: {
                      url: window.location.href
                    }
                  });
                } catch (error) {
                  console.error('[Console Bridge] Fetch error handler failed:', error);
                }
              }
              return response;
            })
            .catch(error => {
              // Capture network failures (CORS, connection refused, etc.)
              try {
                if (!window.__consoleBridgeQueue) {
                  window.__consoleBridgeQueue = [];
                }

                window.__consoleBridgeQueue.push({
                  method: 'error',
                  args: [`Fetch failed loading: ${method} "${url}".`],
                  timestamp: Date.now(),
                  location: {
                    url: window.location.href
                  },
                  stackTrace: error.stack || null
                });
              } catch (handlerError) {
                console.error('[Console Bridge] Fetch catch handler failed:', handlerError);
              }
              throw error; // Re-throw to preserve original behavior
            });
        };

        // Intercept XMLHttpRequest API for XHR error capture
        const originalXHROpen = XMLHttpRequest.prototype.open;
        const originalXHRSend = XMLHttpRequest.prototype.send;

        XMLHttpRequest.prototype.open = function(method, url, ...args) {
          this.__consoleBridge_url = url;
          this.__consoleBridge_method = method;
          return originalXHROpen.apply(this, [method, url, ...args]);
        };

        XMLHttpRequest.prototype.send = function(...args) {
          this.addEventListener('load', function() {
            // Capture HTTP error status codes (4xx, 5xx)
            if (this.status >= 400) {
              try {
                if (!window.__consoleBridgeQueue) {
                  window.__consoleBridgeQueue = [];
                }

                window.__consoleBridgeQueue.push({
                  method: 'error',
                  args: [`${this.__consoleBridge_method} ${this.__consoleBridge_url} ${this.status} (${this.statusText})`],
                  timestamp: Date.now(),
                  location: {
                    url: window.location.href
                  }
                });
              } catch (error) {
                console.error('[Console Bridge] XHR load handler failed:', error);
              }
            }
          });

          this.addEventListener('error', function() {
            // Capture network failures
            try {
              if (!window.__consoleBridgeQueue) {
                window.__consoleBridgeQueue = [];
              }

              window.__consoleBridgeQueue.push({
                method: 'error',
                args: [`Network error: ${this.__consoleBridge_method} ${this.__consoleBridge_url}`],
                timestamp: Date.now(),
                location: {
                  url: window.location.href
                }
              });
            } catch (error) {
              console.error('[Console Bridge] XHR error handler failed:', error);
            }
          });

          return originalXHRSend.apply(this, args);
        };

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

    // Convert args to protocol v1.0.0 format (type + value)
    const formattedArgs = (event.args || []).map(arg => {
      if (arg === null) {
        return { type: 'null', value: null };
      }
      if (arg === undefined) {
        return { type: 'undefined', value: undefined };
      }

      const argType = typeof arg;

      if (argType === 'string') {
        return { type: 'string', value: arg };
      }
      if (argType === 'number') {
        return { type: 'number', value: arg };
      }
      if (argType === 'boolean') {
        return { type: 'boolean', value: arg };
      }

      // Handle special object types
      if (arg && arg.__type === 'DOMElement') {
        return { type: 'dom', value: arg };
      }
      if (arg && arg.__type === 'Function') {
        return { type: 'function', value: arg };
      }
      if (arg && arg.__type === 'Object') {
        return { type: 'object', value: arg };
      }

      // Default: object
      return { type: 'object', value: arg };
    });

    // Create console_event envelope (protocol v1.0.0)
    const consoleEnvelope = this.createEnvelope('console_event', {
      method: event.method,
      args: formattedArgs,
      location: {
        url: event.location?.url || this.tabUrl || 'unknown',
        line: event.location?.line,
        column: event.location?.column
      }
    });

    this.sendMessage(consoleEnvelope);
  }

  /**
   * Send message via WebSocket (with queuing support)
   */
  sendMessage(envelope) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[Console Bridge POC] WebSocket not connected, queuing message');
      this.queueMessage(envelope);
      return;
    }

    try {
      this.ws.send(JSON.stringify(envelope));
      this.stats.messagesSent++;
      this.updateStats();
    } catch (error) {
      console.error('[Console Bridge POC] Failed to send message:', error);
      this.stats.errors++;
      this.updateStats();
    }
  }

  /**
   * Create protocol v1.0.0 message envelope
   */
  createEnvelope(type, payload) {
    return {
      version: '1.0.0',
      type: type,
      timestamp: this.formatISOTimestamp(new Date()),
      source: {
        tabId: this.tabId,
        url: this.tabUrl || 'unknown',
        title: document.title || 'Console Bridge DevTools'
      },
      payload: payload
    };
  }

  /**
   * Format timestamp as ISO 8601 string
   */
  formatISOTimestamp(date) {
    return date.toISOString();
  }

  /**
   * Queue message during disconnection
   */
  queueMessage(envelope) {
    // Drop oldest message if queue is full
    if (this.messageQueue.length >= this.maxQueueSize) {
      this.messageQueue.shift();
      console.warn('[Console Bridge POC] Queue full, dropping oldest message');
    }

    this.messageQueue.push(envelope);
    this.stats.queueSize = this.messageQueue.length;
    this.updateStats();
  }

  /**
   * Flush queued messages on reconnection
   */
  flushQueue() {
    if (this.messageQueue.length === 0) {
      return;
    }

    console.log(`[Console Bridge POC] Flushing ${this.messageQueue.length} queued messages...`);

    while (this.messageQueue.length > 0) {
      const envelope = this.messageQueue.shift();

      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        try {
          this.ws.send(JSON.stringify(envelope));
          this.stats.messagesSent++;
        } catch (error) {
          console.error('[Console Bridge POC] Failed to flush message:', error);
          // Put it back if send failed
          this.messageQueue.unshift(envelope);
          break;
        }
      } else {
        // Connection lost during flush, put it back
        this.messageQueue.unshift(envelope);
        break;
      }
    }

    this.stats.queueSize = this.messageQueue.length;
    this.updateStats();
  }

  /**
   * Start ping/pong keep-alive
   */
  startPingPong() {
    this.stopPingPong(); // Clear any existing timers

    this.pingInterval = setInterval(() => {
      this.sendPing();
    }, this.pingIntervalMs);
  }

  /**
   * Stop ping/pong keep-alive
   */
  stopPingPong() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    if (this.pongTimeout) {
      clearTimeout(this.pongTimeout);
      this.pongTimeout = null;
    }
  }

  /**
   * Send ping message
   */
  sendPing() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const pingEnvelope = this.createEnvelope('ping', {});

    try {
      this.ws.send(JSON.stringify(pingEnvelope));

      // Set pong timeout
      this.pongTimeout = setTimeout(() => {
        console.warn('[Console Bridge POC] Pong timeout, reconnecting...');
        this.ws.close();
        this.scheduleReconnect();
      }, this.pongTimeoutMs);

    } catch (error) {
      console.error('[Console Bridge POC] Failed to send ping:', error);
    }
  }

  /**
   * Handle pong message
   */
  handlePong() {
    if (this.pongTimeout) {
      clearTimeout(this.pongTimeout);
      this.pongTimeout = null;
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
    this.ui.queueSize.textContent = this.stats.queueSize;
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
