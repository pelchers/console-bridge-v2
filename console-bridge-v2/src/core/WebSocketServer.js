/**
 * WebSocket Server for Extension Mode
 *
 * Listens on ws://localhost:9223 for Chrome extension connections.
 * Receives protocol v1.0.0 messages and displays console events in terminal.
 */

const WebSocket = require('ws');
const LogFormatter = require('../formatters/LogFormatter');

class WebSocketServer {
  constructor(options = {}) {
    this.port = options.port || 9223;
    this.output = options.output || console.log;
    this.formatterOptions = options.formatterOptions || {};

    this.server = null;
    this.clients = new Set();
    this.logFormatter = new LogFormatter(this.formatterOptions);

    // Track connected clients metadata
    this.clientMetadata = new Map(); // ws -> { tabId, url, title }
  }

  /**
   * Start WebSocket server
   */
  async start() {
    return new Promise((resolve, reject) => {
      try {
        this.server = new WebSocket.Server({ port: this.port });

        this.server.on('connection', (ws) => {
          this.handleConnection(ws);
        });

        this.server.on('error', (error) => {
          if (error.code === 'EADDRINUSE') {
            reject(new Error(`Port ${this.port} already in use. Is another console-bridge instance running?`));
          } else {
            reject(error);
          }
        });

        this.server.on('listening', () => {
          resolve();
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Stop WebSocket server
   */
  async stop() {
    return new Promise((resolve) => {
      // Close all client connections
      for (const ws of this.clients) {
        ws.close();
      }
      this.clients.clear();
      this.clientMetadata.clear();

      // Close server
      if (this.server) {
        this.server.close(() => {
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Handle new WebSocket connection
   */
  handleConnection(ws) {
    this.clients.add(ws);

    ws.on('message', (data) => {
      this.handleMessage(ws, data);
    });

    ws.on('close', () => {
      const metadata = this.clientMetadata.get(ws);
      if (metadata) {
        this.output(`❌ Extension disconnected (Tab ${metadata.tabId}: ${metadata.url})`);
        this.clientMetadata.delete(ws);
      }
      this.clients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket client error:', error);
    });
  }

  /**
   * Handle incoming message from extension
   */
  handleMessage(ws, data) {
    try {
      const message = JSON.parse(data);

      // Validate protocol version
      if (message.version !== '1.0.0') {
        console.warn(`Warning: Unexpected protocol version: ${message.version}`);
        return;
      }

      // Route by message type
      switch (message.type) {
        case 'connection_status':
          this.handleConnectionStatus(ws, message);
          break;
        case 'console_event':
          this.handleConsoleEvent(message);
          break;
        case 'ping':
          this.handlePing(ws, message);
          break;
        default:
          console.warn(`Warning: Unknown message type: ${message.type}`);
      }

    } catch (error) {
      console.error('Failed to parse message:', error);
      console.error('Raw data:', data.toString());
    }
  }

  /**
   * Handle connection_status message
   */
  handleConnectionStatus(ws, message) {
    if (message.payload && message.payload.status === 'connected') {
      // Store client metadata
      this.clientMetadata.set(ws, {
        tabId: message.source?.tabId,
        url: message.source?.url,
        title: message.source?.title
      });

      // Log connection
      const metadata = this.clientMetadata.get(ws);
      this.output(`✓ Extension connected (Tab ${metadata.tabId}: ${metadata.url})`);

      // Send welcome message
      this.sendWelcome(ws);
    }
  }

  /**
   * Handle console_event message
   */
  handleConsoleEvent(message) {
    // Convert protocol v1.0.0 console_event to LogFormatter format
    const logData = this.convertToLogFormatterFormat(message);

    // Format with LogFormatter
    const formattedLog = this.logFormatter.format(logData);

    // Output to terminal
    this.output(formattedLog);
  }

  /**
   * Handle ping message
   */
  handlePing(ws, message) {
    this.sendPong(ws);
  }

  /**
   * Send pong response
   */
  sendPong(ws) {
    const pong = {
      version: '1.0.0',
      type: 'pong',
      timestamp: new Date().toISOString(),
      payload: {}
    };

    try {
      ws.send(JSON.stringify(pong));
    } catch (error) {
      console.error('Failed to send pong:', error);
    }
  }

  /**
   * Send welcome message
   */
  sendWelcome(ws) {
    const welcome = {
      version: '1.0.0',
      type: 'welcome',
      timestamp: new Date().toISOString(),
      payload: {
        message: 'Console Bridge CLI ready',
        serverVersion: '1.0.0'
      }
    };

    try {
      ws.send(JSON.stringify(welcome));
    } catch (error) {
      console.error('Failed to send welcome:', error);
    }
  }

  /**
   * Convert protocol v1.0.0 console_event to LogFormatter format
   */
  convertToLogFormatterFormat(message) {
    return {
      type: message.payload.method,
      args: message.payload.args.map(arg => arg.value),
      source: message.source.url,
      timestamp: new Date(message.timestamp).getTime(),
      location: message.payload.location
    };
  }

  /**
   * Get number of connected clients
   */
  getClientCount() {
    return this.clients.size;
  }

  /**
   * Get server port
   */
  getPort() {
    return this.port;
  }
}

module.exports = WebSocketServer;
