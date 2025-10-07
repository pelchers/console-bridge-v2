# Technical Requirements Document (TRD)
## Browser Console to Terminal Bridge

### Architecture Overview

```
┌─────────────────┐     WebSocket      ┌──────────────────┐
│  Browser Tab 1  │ ◄─────────────────► │                  │
│  localhost:3000 │                     │                  │
└─────────────────┘                     │                  │
                                        │   Terminal       │
┌─────────────────┐     WebSocket      │   Server         │ ──► Terminal Output
│  Browser Tab 2  │ ◄─────────────────► │   (Node.js)      │     with Colors
│  localhost:8080 │                     │                  │
└─────────────────┘                     │                  │
                                        │                  │
┌─────────────────┐     WebSocket      │                  │
│  Browser Tab N  │ ◄─────────────────► │                  │
│  localhost:XXXX │                     └──────────────────┘
└─────────────────┘
```

### Technology Stack

#### Server-Side (Terminal)
- **Runtime**: Node.js 14.x+
- **WebSocket**: `ws` library (v8.x)
- **CLI Framework**: `commander` (v11.x)
- **Terminal Styling**: `chalk` (v5.x)
- **Process Management**: Native Node.js `child_process`
- **HTTP Server**: Native Node.js `http` module

#### Client-Side (Browser)
- **WebSocket**: Native browser WebSocket API
- **Console Override**: JavaScript prototype manipulation
- **Compatibility**: ES6+ with fallbacks

### Component Design

#### 1. Terminal Server Component

```javascript
class ConsoleBridgeServer {
  constructor(options = {}) {
    this.port = options.port || 9999;
    this.connections = new Map(); // URL -> WebSocket
    this.httpServer = null;
    this.wsServer = null;
  }
  
  start() // Initialize HTTP and WebSocket servers
  stop() // Graceful shutdown
  handleConnection(ws, request) // New connection handler
  handleMessage(message, clientUrl) // Process incoming logs
  formatOutput(logData) // Format for terminal display
  broadcast(message) // Send to all connected clients
}
```

#### 2. Client Injection Script

```javascript
(function() {
  const wsUrl = 'ws://localhost:9999';
  let ws = null;
  let reconnectTimer = null;
  const messageQueue = [];
  
  // Store original console methods
  const originalConsole = {
    log: console.log.bind(console),
    error: console.error.bind(console),
    warn: console.warn.bind(console),
    info: console.info.bind(console),
    debug: console.debug.bind(console)
  };
  
  // Override console methods
  ['log', 'error', 'warn', 'info', 'debug'].forEach(method => {
    console[method] = function(...args) {
      // Call original method
      originalConsole[method](...args);
      
      // Send to terminal
      sendToTerminal({
        type: method,
        args: serializeArgs(args),
        timestamp: Date.now(),
        url: window.location.href
      });
    };
  });
})();
```

### Data Flow

#### 1. Message Protocol

```typescript
interface LogMessage {
  type: 'log' | 'error' | 'warn' | 'info' | 'debug';
  args: any[];
  timestamp: number;
  url: string;
  metadata?: {
    lineNumber?: number;
    fileName?: string;
    stackTrace?: string;
  };
}

interface ServerMessage {
  type: 'connected' | 'error' | 'config';
  data: any;
}
```

#### 2. Serialization Strategy

- **Primitives**: Direct JSON serialization
- **Objects**: JSON.stringify with circular reference handling
- **Functions**: Convert to string representation
- **Errors**: Extract message, stack, and properties
- **DOM Elements**: Convert to selector string
- **Large Objects**: Truncate to prevent memory issues

```javascript
function serializeArgs(args) {
  return args.map(arg => {
    try {
      if (arg instanceof Error) {
        return {
          __type: 'Error',
          message: arg.message,
          stack: arg.stack,
          ...arg
        };
      }
      if (arg instanceof Element) {
        return {
          __type: 'Element',
          tagName: arg.tagName,
          id: arg.id,
          className: arg.className
        };
      }
      if (typeof arg === 'function') {
        return {
          __type: 'Function',
          toString: arg.toString()
        };
      }
      // Circular reference handling
      return JSON.parse(JSON.stringify(arg));
    } catch (e) {
      return {
        __type: 'SerializationError',
        toString: String(arg)
      };
    }
  });
}
```

### Terminal Output Format

```
[2024-01-20 15:23:45] [localhost:3000] INFO: Application started
[2024-01-20 15:23:46] [localhost:8080] ERROR: Failed to fetch user data
  Stack trace...
[2024-01-20 15:23:47] [localhost:3000] LOG: { user: "john", action: "login" }
```

Color Mapping:
- `console.log` - Default terminal color
- `console.error` - Red
- `console.warn` - Yellow  
- `console.info` - Blue
- `console.debug` - Gray
- Source URL - Cyan
- Timestamp - Dim

### CLI Interface

```bash
# Global installation
npm install -g console-bridge

# Commands
console-bridge start [options]
  -p, --port <port>      WebSocket server port (default: 9999)
  -v, --verbose          Enable verbose logging
  -c, --config <file>    Config file path

console-bridge stop
console-bridge status
console-bridge list          # List active connections
```

### Configuration

#### Default Configuration
```json
{
  "port": 9999,
  "host": "localhost",
  "maxConnections": 100,
  "reconnectInterval": 5000,
  "messageQueueSize": 1000,
  "formatting": {
    "timestamp": true,
    "colors": true,
    "source": true
  },
  "security": {
    "corsOrigin": "localhost",
    "requireToken": false
  }
}
```

#### Configuration Loading Order
1. Default configuration
2. Global config file (`~/.console-bridge/config.json`)
3. Local config file (`./console-bridge.json`)
4. Environment variables (`CONSOLE_BRIDGE_*`)
5. CLI arguments

### Security Considerations

#### 1. CORS and Origin Validation
```javascript
function isAllowedOrigin(origin) {
  const url = new URL(origin);
  return url.hostname === 'localhost' || 
         url.hostname === '127.0.0.1' ||
         url.hostname === '[::1]';
}
```

#### 2. Message Validation
- Sanitize all incoming messages
- Limit message size (default 1MB)
- Rate limiting per connection

#### 3. No Code Execution
- Never use `eval()` or `Function()` constructor
- Treat all data as untrusted

### Performance Optimizations

#### 1. Message Batching
```javascript
class MessageBatcher {
  constructor(flushInterval = 100) {
    this.queue = [];
    this.timer = null;
    this.flushInterval = flushInterval;
  }
  
  add(message) {
    this.queue.push(message);
    this.scheduleFlush();
  }
  
  scheduleFlush() {
    if (!this.timer) {
      this.timer = setTimeout(() => this.flush(), this.flushInterval);
    }
  }
}
```

#### 2. Connection Pooling
- Reuse WebSocket connections
- Implement connection timeout
- Clean up stale connections

#### 3. Memory Management
- Limit message queue size
- Implement circular buffer for history
- Clear references to prevent leaks

### Error Handling

#### 1. Connection Errors
- Automatic reconnection with exponential backoff
- Queue messages during disconnection
- Clear error reporting

#### 2. Serialization Errors
- Fallback to string representation
- Log serialization failures
- Continue operation

#### 3. Terminal Errors
- Handle terminal resize
- Recover from color support changes
- Graceful degradation

### Testing Strategy

#### Unit Tests
- Console method overrides
- Message serialization
- WebSocket communication
- CLI command parsing

#### Integration Tests
- Multi-client connections
- Browser compatibility
- Performance under load
- Error recovery

#### E2E Tests
- Full installation flow
- Real browser testing
- Various localhost scenarios

### Browser Support Matrix

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| WebSocket | ✓ | ✓ | ✓ | ✓ |
| Console Override | ✓ | ✓ | ✓ | ✓ |
| Object Serialization | ✓ | ✓ | ✓ | ✓ |
| Auto-reconnect | ✓ | ✓ | ✓ | ✓ |

### Development Tools Integration

#### 1. Source Maps
- Preserve original file locations
- Map to source files when available

#### 2. Browser DevTools
- Don't interfere with native console
- Preserve original functionality

### Monitoring and Analytics

#### Internal Metrics
- Connection count
- Message throughput
- Error rates
- Performance metrics

#### Opt-in Analytics
- Anonymous usage statistics
- Feature adoption tracking
- Error reporting

### Package Structure

```
console-bridge/
├── package.json
├── README.md
├── LICENSE
├── .gitignore
├── bin/
│   └── console-bridge.js    # CLI entry point
├── src/
│   ├── server/
│   │   ├── index.js         # Main server class
│   │   ├── websocket.js    # WebSocket handler
│   │   ├── http.js         # HTTP server for client script
│   │   └── formatter.js    # Output formatting
│   ├── client/
│   │   └── bridge.js       # Browser injection script
│   └── utils/
│       ├── config.js       # Configuration management
│       ├── logger.js       # Internal logging
│       └── serializer.js   # Message serialization
├── test/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── examples/
    ├── basic/
    ├── multi-app/
    └── react-app/
```
