# Console Bridge - Programmatic API

**Version:** 1.0.0-rc

Use Console Bridge as a library in your Node.js applications for custom console log monitoring and processing.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
  - [BridgeManager](#bridgemanager)
  - [LogFormatter](#logformatter)
  - [BrowserPool](#browserpool)
  - [LogCapturer](#logcapturer)
  - [Utilities](#utilities)
- [Configuration Options](#configuration-options)
- [Examples](#examples)
- [Events and Callbacks](#events-and-callbacks)
- [Error Handling](#error-handling)

---

## Installation

Install as a dependency in your project:

```bash
npm install console-bridge
```

Or as a dev dependency:

```bash
npm install --save-dev console-bridge
```

---

## Quick Start

### Basic Usage

```javascript
const { BridgeManager } = require('console-bridge');

// Create bridge manager
const bridge = new BridgeManager({
  headless: true,
  levels: ['error', 'warn'],
});

// Start monitoring
async function main() {
  await bridge.start(['localhost:3000', 'localhost:8080']);

  console.log('Monitoring started. Press Ctrl+C to stop.');

  // Keep process alive
  process.on('SIGINT', async () => {
    await bridge.stop();
    process.exit(0);
  });
}

main().catch(console.error);
```

### Custom Output Handler

```javascript
const { BridgeManager } = require('console-bridge');
const fs = require('fs');

const logStream = fs.createWriteStream('custom-logs.txt', { flags: 'a' });

const bridge = new BridgeManager({
  output: (formattedLog) => {
    // Custom processing
    console.log(formattedLog);
    logStream.write(formattedLog + '\n');

    // Send to external service
    if (formattedLog.includes('error')) {
      sendToSlack(formattedLog);
    }
  },
});

await bridge.start('localhost:3000');
```

---

## API Reference

### BridgeManager

The main orchestrator for console bridging. Manages browser instances, log capturing, and formatting.

#### Constructor

```javascript
new BridgeManager(options)
```

**Parameters:**

- `options` (Object, optional)
  - `maxInstances` (number) - Maximum browser instances (default: 10)
  - `headless` (boolean) - Run browsers headlessly (default: true)
  - `levels` (string[]) - Log levels to capture (default: `['log', 'info', 'warn', 'error', 'debug']`)
  - `output` (Function) - Custom output handler (default: `console.log`)
  - `formatterOptions` (Object) - Options for LogFormatter (see below)

**Example:**

```javascript
const bridge = new BridgeManager({
  maxInstances: 5,
  headless: true,
  levels: ['error', 'warn'],
  output: (log) => console.log(log),
  formatterOptions: {
    showTimestamp: true,
    timestampFormat: 'iso',
  },
});
```

#### Methods

##### `start(urls)`

Start monitoring one or more URLs.

```javascript
await bridge.start(urls)
```

**Parameters:**
- `urls` (string | string[]) - URL(s) to monitor

**Returns:** `Promise<void>`

**Example:**

```javascript
// Single URL
await bridge.start('localhost:3000');

// Multiple URLs
await bridge.start(['localhost:3000', 'localhost:8080']);
```

##### `stop()`

Stop all monitoring and close browser instances.

```javascript
await bridge.stop()
```

**Returns:** `Promise<void>`

**Example:**

```javascript
await bridge.stop();
```

##### `addUrl(url)`

Add a single URL to monitor.

```javascript
await bridge.addUrl(url)
```

**Parameters:**
- `url` (string) - URL to monitor

**Returns:** `Promise<void>`

**Throws:** Error if URL cannot be added

**Example:**

```javascript
await bridge.addUrl('localhost:3000');
```

##### `removeUrl(url)`

Stop monitoring a specific URL.

```javascript
await bridge.removeUrl(url)
```

**Parameters:**
- `url` (string) - URL to stop monitoring

**Returns:** `Promise<void>`

**Example:**

```javascript
await bridge.removeUrl('localhost:3000');
```

##### `getActiveUrls()`

Get list of currently monitored URLs.

```javascript
bridge.getActiveUrls()
```

**Returns:** `string[]` - Array of active URLs

**Example:**

```javascript
const urls = bridge.getActiveUrls();
console.log('Monitoring:', urls);
// Output: ['http://localhost:3000', 'http://localhost:8080']
```

##### `isActive(url)`

Check if a URL is being monitored.

```javascript
bridge.isActive(url)
```

**Parameters:**
- `url` (string) - URL to check

**Returns:** `boolean`

**Example:**

```javascript
if (bridge.isActive('localhost:3000')) {
  console.log('Already monitoring');
}
```

---

### LogFormatter

Formats log entries for output with colors, timestamps, and source labels.

#### Constructor

```javascript
new LogFormatter(options)
```

**Parameters:**

- `options` (Object, optional)
  - `showTimestamp` (boolean) - Show timestamps (default: true)
  - `showSource` (boolean) - Show source URL (default: true)
  - `showLocation` (boolean) - Show file location (default: false)
  - `timestampFormat` (string) - Format: 'time' or 'iso' (default: 'time')

**Example:**

```javascript
const { LogFormatter } = require('console-bridge');

const formatter = new LogFormatter({
  showTimestamp: true,
  timestampFormat: 'iso',
  showLocation: true,
});
```

#### Methods

##### `format(logData)`

Format a log entry.

```javascript
formatter.format(logData)
```

**Parameters:**
- `logData` (Object)
  - `type` (string) - Log level ('log', 'info', 'warn', 'error', 'debug')
  - `args` (Array) - Log arguments
  - `source` (string) - Source URL
  - `timestamp` (number) - Unix timestamp
  - `location` (Object, optional) - File location info

**Returns:** `string` - Formatted log string

**Example:**

```javascript
const formatted = formatter.format({
  type: 'error',
  args: ['Connection failed', { code: 500 }],
  source: 'http://localhost:3000',
  timestamp: Date.now(),
  location: { url: 'app.js', lineNumber: 42 },
});

console.log(formatted);
// Output: [12:34:56] [localhost:3000] error: Connection failed { "code": 500 } (app.js:42)
```

---

### BrowserPool

Manages multiple Puppeteer browser instances with resource limits.

#### Constructor

```javascript
new BrowserPool(options)
```

**Parameters:**

- `options` (Object, optional)
  - `maxInstances` (number) - Maximum browser instances (default: 10)
  - `headless` (boolean) - Run headless (default: true)

**Example:**

```javascript
const { BrowserPool } = require('console-bridge');

const pool = new BrowserPool({
  maxInstances: 5,
  headless: true,
});
```

#### Methods

##### `create(url)`

Create a new browser instance for a URL.

```javascript
await pool.create(url)
```

**Parameters:**
- `url` (string) - URL identifier

**Returns:** `Promise<{ browser: Browser, page: Page }>` - Puppeteer instances

**Throws:** Error if max instances reached

**Example:**

```javascript
const { browser, page } = await pool.create('localhost:3000');
await page.goto('http://localhost:3000');
```

##### `destroy(url)`

Destroy a browser instance.

```javascript
await pool.destroy(url)
```

**Parameters:**
- `url` (string) - URL identifier

**Returns:** `Promise<void>`

##### `destroyAll()`

Destroy all browser instances.

```javascript
await pool.destroyAll()
```

**Returns:** `Promise<void>`

##### `get(url)`

Get an existing browser instance.

```javascript
pool.get(url)
```

**Parameters:**
- `url` (string) - URL identifier

**Returns:** `{ browser: Browser, page: Page } | undefined`

##### `has(url)`

Check if instance exists.

```javascript
pool.has(url)
```

**Parameters:**
- `url` (string) - URL identifier

**Returns:** `boolean`

##### `count()`

Get number of active instances.

```javascript
pool.count()
```

**Returns:** `number`

##### `getUrls()`

Get all active URLs.

```javascript
pool.getUrls()
```

**Returns:** `string[]`

---

### LogCapturer

Captures console events from browser pages.

#### Constructor

```javascript
new LogCapturer(page, url, options)
```

**Parameters:**

- `page` (Page) - Puppeteer page instance
- `url` (string) - Source URL
- `options` (Object, optional)
  - `levels` (string[]) - Log levels to capture (default: all)

**Example:**

```javascript
const { LogCapturer } = require('console-bridge');

const capturer = new LogCapturer(page, 'localhost:3000', {
  levels: ['error', 'warn'],
});
```

#### Methods

##### `start(callback)`

Start capturing logs with a callback.

```javascript
capturer.start(callback)
```

**Parameters:**
- `callback` (Function) - Called for each log entry
  - Receives: `logData` (Object)

**Example:**

```javascript
capturer.start((logData) => {
  console.log('Captured:', logData);
  // logData: { type, args, source, timestamp, location }
});
```

##### `stop()`

Stop capturing logs.

```javascript
capturer.stop()
```

**Returns:** `void`

---

### Utilities

#### URL Utilities

```javascript
const { utils } = require('console-bridge');

// Validate a URL
const result = utils.url.validateUrl('localhost:3000');
// Returns: { valid: true, normalized: 'http://localhost:3000' }
// Or: { valid: false, error: 'Error message' }

// Normalize a URL
const normalized = utils.url.normalizeUrl('localhost:3000');
// Returns: 'http://localhost:3000'

// Get display name
const display = utils.url.getDisplayName('http://localhost:3000');
// Returns: 'localhost:3000'
```

#### Color Utilities

```javascript
const { utils } = require('console-bridge');

// Get color for a source
const colorFn = utils.colors.getSourceColor('localhost:3000');
const colored = colorFn('text'); // Returns chalk-colored text

// Get color for log level
const levelColor = utils.colors.getLogLevelColor('error');
const colored = levelColor('error:'); // Returns red colored text
```

---

## Configuration Options

### BridgeManager Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxInstances` | number | 10 | Maximum concurrent browser instances |
| `headless` | boolean | true | Run browsers in headless mode |
| `levels` | string[] | `['log', 'info', 'warn', 'error', 'debug']` | Log levels to capture |
| `output` | Function | `console.log` | Custom output handler |
| `formatterOptions` | Object | `{}` | Options passed to LogFormatter |

### LogFormatter Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `showTimestamp` | boolean | true | Display timestamps |
| `showSource` | boolean | true | Display source URL |
| `showLocation` | boolean | false | Display file location |
| `timestampFormat` | string | 'time' | Timestamp format: 'time' or 'iso' |

### BrowserPool Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxInstances` | number | 10 | Maximum browser instances |
| `headless` | boolean | true | Run browsers headlessly |

### LogCapturer Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `levels` | string[] | all | Log levels to capture |

---

## Examples

### Example 1: Custom Log Processing

```javascript
const { BridgeManager } = require('console-bridge');

const errorLogs = [];

const bridge = new BridgeManager({
  levels: ['error'],
  output: (log) => {
    errorLogs.push(log);

    if (errorLogs.length >= 10) {
      console.error('Too many errors detected!');
      process.exit(1);
    }
  },
});

await bridge.start('localhost:3000');
```

### Example 2: Multiple Output Destinations

```javascript
const { BridgeManager } = require('console-bridge');
const fs = require('fs');

const fileStream = fs.createWriteStream('logs.txt', { flags: 'a' });
const errorStream = fs.createWriteStream('errors.txt', { flags: 'a' });

const bridge = new BridgeManager({
  output: (log) => {
    // Console
    console.log(log);

    // All logs to file
    fileStream.write(log + '\n');

    // Errors to separate file
    if (log.includes('error:')) {
      errorStream.write(log + '\n');
    }
  },
});

await bridge.start('localhost:3000');
```

### Example 3: Dynamic URL Management

```javascript
const { BridgeManager } = require('console-bridge');

const bridge = new BridgeManager();

// Start with one URL
await bridge.addUrl('localhost:3000');

// Add more dynamically
setTimeout(async () => {
  await bridge.addUrl('localhost:8080');
  console.log('Now monitoring:', bridge.getActiveUrls());
}, 5000);

// Remove URLs dynamically
setTimeout(async () => {
  await bridge.removeUrl('localhost:3000');
  console.log('Still monitoring:', bridge.getActiveUrls());
}, 10000);
```

### Example 4: Custom Formatter

```javascript
const { BridgeManager, LogFormatter } = require('console-bridge');

class MyFormatter extends LogFormatter {
  format(logData) {
    // Custom format: only show errors with emojis
    if (logData.type === 'error') {
      return `🚨 ERROR: ${logData.args.join(' ')}`;
    }
    return super.format(logData);
  }
}

const bridge = new BridgeManager();
bridge.formatter = new MyFormatter();

await bridge.start('localhost:3000');
```

### Example 5: Direct BrowserPool Usage

```javascript
const { BrowserPool, LogCapturer } = require('console-bridge');

const pool = new BrowserPool({ maxInstances: 3 });

const { page } = await pool.create('localhost:3000');

const capturer = new LogCapturer(page, 'localhost:3000');
capturer.start((logData) => {
  console.log('Raw log:', logData);
});

await page.goto('http://localhost:3000');

// Later...
await pool.destroyAll();
```

### Example 6: Integration with Express

```javascript
const express = require('express');
const { BridgeManager } = require('console-bridge');

const app = express();
const bridge = new BridgeManager();

app.get('/start-monitoring', async (req, res) => {
  const url = req.query.url;

  try {
    await bridge.addUrl(url);
    res.json({ success: true, monitoring: bridge.getActiveUrls() });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/stop-monitoring', async (req, res) => {
  const url = req.query.url;
  await bridge.removeUrl(url);
  res.json({ success: true, monitoring: bridge.getActiveUrls() });
});

app.listen(3000);
```

---

## Events and Callbacks

### Output Callback

The `output` option receives formatted log strings:

```javascript
const bridge = new BridgeManager({
  output: (formattedLog) => {
    // formattedLog is a string with ANSI colors
    // Example: "\x1b[90m[12:34:56]\x1b[39m \x1b[36m[localhost:3000]\x1b[39m ..."
  },
});
```

### LogCapturer Callback

The `start()` method receives raw log data:

```javascript
capturer.start((logData) => {
  // logData structure:
  // {
  //   type: 'error',
  //   args: ['Error message', { code: 500 }],
  //   source: 'http://localhost:3000',
  //   timestamp: 1696345678901,
  //   location: { url: 'app.js', lineNumber: 42, columnNumber: 10 }
  // }
});
```

---

## Error Handling

### Try-Catch for Async Operations

```javascript
const { BridgeManager } = require('console-bridge');

const bridge = new BridgeManager();

try {
  await bridge.start('localhost:3000');
} catch (error) {
  console.error('Failed to start:', error.message);
  // Error types:
  // - 'Failed to add URL ...' - Navigation/connection failed
  // - 'Maximum instances reached' - Too many browsers
  // - 'Invalid URL' - URL validation failed
}
```

### Graceful Shutdown

```javascript
const bridge = new BridgeManager();

process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  try {
    await bridge.stop();
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

await bridge.start('localhost:3000');
```

### Handling Individual URL Failures

```javascript
const bridge = new BridgeManager();

// start() uses Promise.allSettled - some URLs can fail without stopping others
await bridge.start(['localhost:3000', 'localhost:9999', 'localhost:8080']);

// Check which succeeded
const active = bridge.getActiveUrls();
console.log('Successfully monitoring:', active);
// Output might be: ['http://localhost:3000', 'http://localhost:8080']
// (9999 failed but others succeeded)
```

---

## TypeScript Support

While Console Bridge is written in JavaScript, you can use it with TypeScript:

```typescript
import { BridgeManager, LogFormatter } from 'console-bridge';

const bridge: BridgeManager = new BridgeManager({
  headless: true,
  levels: ['error', 'warn'],
});

await bridge.start(['localhost:3000']);
```

Note: Type definitions are not yet included but may be added in a future release.

---

## Performance Considerations

1. **Memory Usage:** Each browser instance uses ~50-100MB RAM
2. **CPU Usage:** Minimal when idle, increases with log volume
3. **Max Instances:** Default limit of 10 prevents resource exhaustion
4. **Headless Mode:** Uses less resources than visible browsers

**Recommendations:**
- Use `maxInstances` to limit resource usage
- Filter log levels to reduce processing overhead
- Monitor system resources when tracking many URLs

---

## Next Steps

- **CLI Usage:** See [User Guide](./USAGE.md) for command-line interface
- **Examples:** Check the `examples/` directory for more samples
- **Contributing:** See the main [README](../README.md) for contribution guidelines

---

**Questions or Issues?** Open an issue on the [GitHub repository](https://github.com/yourusername/console-bridge).

---

## v2.0.0 Extension Mode API (NEW)

### WebSocketServer

The WebSocket server for Extension Mode communication.

#### Constructor

```javascript
new WebSocketServer(options)
```

**Parameters:**

- `options` (Object, optional)
  - `port` (number) - WebSocket server port (default: 9223)
  - `host` (string) - Host to bind to (default: 'localhost' - SECURITY: never change this)
  - `formatter` (LogFormatter) - Formatter instance for log output
  - `output` (Function) - Output handler (default: `console.log`)

**Example:**

```javascript
const { WebSocketServer, LogFormatter } = require('console-bridge');

const formatter = new LogFormatter({
  showTimestamp: true,
  timestampFormat: 'iso',
});

const server = new WebSocketServer({
  port: 9223,
  formatter,
  output: (log) => console.log(log),
});
```

#### Methods

##### `start()`

Start the WebSocket server and listen for connections.

```javascript
server.start()
```

**Returns:** `void`

**Example:**

```javascript
const server = new WebSocketServer();
server.start();

console.log('WebSocket server listening on ws://localhost:9223');
console.log('Waiting for extension connection...');
```

##### `stop()`

Stop the WebSocket server and close all client connections.

```javascript
server.stop()
```

**Returns:** `void`

**Example:**

```javascript
// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down WebSocket server...');
  server.stop();
  process.exit(0);
});
```

##### `getClients()`

Get list of connected WebSocket clients.

```javascript
server.getClients()
```

**Returns:** `Set<WebSocket>` - Set of connected client WebSocket objects

**Example:**

```javascript
const clients = server.getClients();
console.log(`Connected clients: ${clients.size}`);
```

##### `broadcast(message)`

Send a message to all connected clients.

```javascript
server.broadcast(message)
```

**Parameters:**
- `message` (Object) - Message object to broadcast (will be JSON.stringify'd)

**Returns:** `void`

**Example:**

```javascript
// Send ping to all clients
server.broadcast({
  type: 'ping',
  timestamp: Date.now(),
  data: {}
});
```

---

### Extension Mode Usage Example

```javascript
const { WebSocketServer, LogFormatter } = require('console-bridge');
const fs = require('fs');

// Create formatter
const formatter = new LogFormatter({
  showTimestamp: true,
  showLocation: true,
  timestampFormat: 'iso',
});

// Create file stream for logging
const logStream = fs.createWriteStream('extension-logs.txt', { flags: 'a' });

// Create WebSocket server
const server = new WebSocketServer({
  port: 9223,
  formatter,
  output: (formattedLog) => {
    // Output to console
    console.log(formattedLog);

    // Also save to file (strip ANSI codes)
    const strippedLog = formattedLog.replace(/\x1b\[[0-9;]*m/g, '');
    logStream.write(strippedLog + '\n');
  },
});

// Start server
server.start();

console.log('WebSocket server listening on ws://localhost:9223');
console.log('Install Chrome extension and open DevTools to connect.');

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  server.stop();
  logStream.end();
  process.exit(0);
});

// Monitor connection count
setInterval(() => {
  const clients = server.getClients();
  console.log(`[Status] Connected clients: ${clients.size}`);
}, 30000); // Every 30 seconds
```

---

### Extension Mode + Puppeteer Mode Combined

You can run both modes simultaneously for different use cases:

```javascript
const { BridgeManager, WebSocketServer, LogFormatter } = require('console-bridge');

const formatter = new LogFormatter();

// 1. Start Puppeteer mode for automated testing
const puppeteerBridge = new BridgeManager({
  headless: true,
  levels: ['error'],
  formatterOptions: formatter,
});

await puppeteerBridge.start(['localhost:3000']);

// 2. Start Extension mode for interactive development
const extensionServer = new WebSocketServer({
  port: 9223,
  formatter,
});

extensionServer.start();

console.log('Running dual-mode:');
console.log('- Puppeteer Mode: localhost:3000 (error logs only)');
console.log('- Extension Mode: ws://localhost:9223 (all logs)');

// Cleanup
process.on('SIGINT', async () => {
  await puppeteerBridge.stop();
  extensionServer.stop();
  process.exit(0);
});
```

---

### WebSocket Protocol v1.0.0

The extension communicates with the CLI using JSON messages over WebSocket.

**Message Envelope:**

```javascript
{
  "type": "console_event | connection_status | ping | pong | welcome",
  "timestamp": 1696345678901,
  "data": { ... }
}
```

**Example console_event from Extension:**

```javascript
{
  "type": "console_event",
  "timestamp": 1696345678901,
  "data": {
    "method": "log",
    "args": ["Hello from browser", { "user": "Alice" }],
    "location": {
      "url": "http://localhost:3000/app.js",
      "lineNumber": 42,
      "columnNumber": 10
    },
    "source": "http://localhost:3000"
  }
}
```

**Handling Messages Manually:**

```javascript
const WebSocket = require('ws');

const wss = new WebSocket.Server({ host: 'localhost', port: 9223 });

wss.on('connection', (ws) => {
  console.log('Extension connected');

  // Send welcome
  ws.send(JSON.stringify({
    type: 'welcome',
    timestamp: Date.now(),
    data: { server: 'custom-server', protocolVersion: '1.0.0' }
  }));

  // Handle messages
  ws.on('message', (data) => {
    const message = JSON.parse(data);

    if (message.type === 'console_event') {
      console.log(`[${message.data.method}]`, ...message.data.args);
    } else if (message.type === 'ping') {
      ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
    }
  });
});
```

See [WebSocket Protocol Specification](./v2.0.0-spec/websocket-protocol-v1.0.0.md) for complete protocol documentation.

---

**Document Status:** Living Document (Updated for v2.0.0)
**Last Updated:** October 8, 2025
**Version:** 2.0.0-beta
