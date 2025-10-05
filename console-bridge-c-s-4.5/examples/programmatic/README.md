# Programmatic API Examples

These examples demonstrate using Console Bridge as a Node.js library.

## Setup

Install Console Bridge in your project:

```bash
npm install console-bridge
```

Or link from the project root for development:

```bash
cd /path/to/console-bridge
npm link

cd /path/to/your/project
npm link console-bridge
```

## Examples

### 1. basic-usage.js

Basic usage of the BridgeManager API.

```bash
node basic-usage.js
```

**Features:**
- Start monitoring multiple URLs
- Graceful shutdown on Ctrl+C
- Check active URLs

### 2. custom-output.js

Custom output handler with file logging and error tracking.

```bash
node custom-output.js
```

**Features:**
- Write logs to multiple files
- Track error count
- Automatic shutdown on too many errors
- Simulated alerting for critical errors

Creates two files:
- `all-logs.txt` - All captured logs
- `errors-only.txt` - Only error logs

### 3. dynamic-urls.js

Dynamic URL management - add and remove URLs at runtime.

```bash
node dynamic-urls.js
```

**Features:**
- Add URLs dynamically
- Remove URLs after monitoring
- Status updates every 5 seconds
- Demonstrates runtime URL management

**Timeline:**
- 0s: Start with `localhost:3000`
- 5s: Add `localhost:8080`
- 10s: Add `localhost:5000`
- 15s: Remove `localhost:3000`

## Common Patterns

### Pattern 1: Error-Only Monitoring

```javascript
const { BridgeManager } = require('console-bridge');

const bridge = new BridgeManager({
  levels: ['error'],
  output: (log) => {
    // Only errors reach here
    sendToErrorTrackingService(log);
  },
});

await bridge.start('localhost:3000');
```

### Pattern 2: Multiple Output Destinations

```javascript
const bridge = new BridgeManager({
  output: (log) => {
    console.log(log);           // Terminal
    fileStream.write(log);      // File
    websocket.send(log);        // WebSocket
    database.insert(log);       // Database
  },
});
```

### Pattern 3: Conditional URL Management

```javascript
const bridge = new BridgeManager();

// Add URLs based on environment
if (process.env.MONITOR_FRONTEND) {
  await bridge.addUrl('localhost:3000');
}

if (process.env.MONITOR_BACKEND) {
  await bridge.addUrl('localhost:8080');
}

// Remove URL if no longer needed
if (!bridge.isActive('localhost:3000')) {
  await bridge.addUrl('localhost:3000');
}
```

### Pattern 4: Integration with Express

```javascript
const express = require('express');
const { BridgeManager } = require('console-bridge');

const app = express();
const bridge = new BridgeManager();

app.post('/monitoring/start', async (req, res) => {
  try {
    await bridge.addUrl(req.body.url);
    res.json({ success: true, active: bridge.getActiveUrls() });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/monitoring/stop', async (req, res) => {
  await bridge.removeUrl(req.body.url);
  res.json({ success: true, active: bridge.getActiveUrls() });
});

app.get('/monitoring/status', (req, res) => {
  res.json({ active: bridge.getActiveUrls() });
});

app.listen(4000);
```

## Running the Examples

Make sure you have dev servers running on the ports referenced in the examples:

```bash
# Terminal 1: Start a dev server
cd /path/to/your/app
npm run dev  # Usually runs on localhost:3000

# Terminal 2: Run example
node basic-usage.js
```

Or use a simple test server:

```bash
# Install http-server globally
npm install -g http-server

# Start test servers
http-server -p 3000 &
http-server -p 8080 &

# Run example
node basic-usage.js
```

## Tips

1. **Always handle shutdown gracefully** - Call `bridge.stop()` on `SIGINT`/`SIGTERM`
2. **Check if URL is active** - Use `bridge.isActive(url)` before adding
3. **Handle errors** - Use try-catch for `addUrl()` and `start()`
4. **Resource limits** - Set `maxInstances` to prevent resource exhaustion
5. **Custom formatting** - Use `formatterOptions` or create custom LogFormatter

## Further Reading

- [API Documentation](../../docs/API.md) - Full API reference
- [User Guide](../../docs/USAGE.md) - CLI usage examples
- [README](../../README.md) - Project overview
