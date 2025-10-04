# Advanced Usage Guide

Master Console Bridge with advanced features, CLI options, and configuration.

## Table of Contents
- [CLI Options](#cli-options)
- [Headless vs Headful Mode](#headless-vs-headful-mode)
- [Output Formats](#output-formats)
- [Log Filtering](#log-filtering)
- [Multiple URLs](#multiple-urls)
- [Integration Examples](#integration-examples)
- [API Usage](#api-usage)

---

## CLI Options

### Full Command Reference

```bash
console-bridge start [options] <urls...>
```

### Available Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--levels <levels>` | `-l` | Comma-separated log levels to capture | All types |
| `--no-headless` | - | Show browser windows | Headless (hidden) |
| `--max-instances <number>` | `-m` | Maximum concurrent browser instances | 10 |
| `--no-timestamp` | - | Hide timestamps in output | Timestamps shown |
| `--no-source` | - | Hide source URLs in output | Source shown |
| `--location` | - | Show file location for each log | Hidden |
| `--timestamp-format <format>` | - | Timestamp format: "time" or "iso" | "time" |
| `--output <file>` | `-o` | Save logs to file (appends) | Terminal output |
| `--help` | `-h` | Display help | - |

---

## Headless vs Headful Mode

### Headless Mode (Default)

**What it is:** Browser runs invisibly in the background

**When to use:**
- Normal development workflow
- Automated testing
- CI/CD pipelines
- You don't need to interact with the browser

**Usage:**
```bash
# Headless is default
console-bridge start localhost:3000

# Or explicitly
console-bridge start localhost:3000 --headless
```

**Pros:**
- ✅ Less resource intensive
- ✅ No visual distractions
- ✅ Works on headless servers
- ✅ Faster startup

**Cons:**
- ❌ Can't manually interact with page
- ❌ Can't visually debug layout issues

---

### Headful Mode

**What it is:** Browser window is visible

**When to use:**
- Debugging Console Bridge behavior
- Understanding what Puppeteer sees
- Manual interaction needed
- Visual verification

**Usage:**
```bash
console-bridge start localhost:3000 --no-headless
```

**Pros:**
- ✅ See exactly what Puppeteer sees
- ✅ Click buttons, interact with UI
- ✅ Debug visual issues
- ✅ Inspect DevTools in the Puppeteer browser

**Cons:**
- ❌ More resource intensive
- ❌ Distracting window on screen
- ❌ Doesn't work on headless servers

---

### Understanding Browser Instances

**Important concept:** Console Bridge runs **its own browser** (Puppeteer), not your personal browser.

```
┌─────────────────────────────────────────┐
│ Your Personal Chrome                    │
│ http://localhost:3000                   │
│                                         │
│ ❌ NOT monitored by Console Bridge      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Puppeteer Chrome (headless)             │
│ http://localhost:3000                   │
│                                         │
│ ✅ Monitored by Console Bridge          │
│ ✅ Logs stream to terminal              │
└─────────────────────────────────────────┘
```

**Practical implication:**
- In headless mode: You can't manually click buttons in Puppeteer browser
- In headful mode: You CAN click buttons in the visible Puppeteer window
- Your personal browser is always separate from Console Bridge

---

## Output Formats

### Default Format

```
[HH:MM:SS] [source] level: message
```

Example:
```
[14:32:15] [localhost:3000] log: Button clicked!
```

---

### Hide Timestamps

```bash
console-bridge start localhost:3000 --no-timestamp
```

Output:
```
[localhost:3000] log: Button clicked!
```

---

### Hide Source URLs

```bash
console-bridge start localhost:3000 --no-source
```

Output:
```
[14:32:15] log: Button clicked!
```

---

### Minimal Output (No Metadata)

```bash
console-bridge start localhost:3000 --no-timestamp --no-source
```

Output:
```
log: Button clicked!
```

---

### Show File Locations

```bash
console-bridge start localhost:3000 --location
```

Output:
```
[14:32:15] [localhost:3000] log: Button clicked! (App.tsx:42:12)
```

Shows exactly where in your code the log came from.

---

### ISO Timestamp Format

```bash
console-bridge start localhost:3000 --timestamp-format iso
```

Output:
```
[2025-10-04T14:32:15.123Z] [localhost:3000] log: Button clicked!
```

Useful for log parsing and analysis.

---

### Save to File

```bash
# Append to file
console-bridge start localhost:3000 -o logs.txt

# File will contain:
[14:32:15] [localhost:3000] log: Button clicked!
[14:32:16] [localhost:3000] error: Something failed
```

**File behavior:**
- Creates file if doesn't exist
- **Appends** to existing file (doesn't overwrite)
- Includes all formatting (colors stripped in file)

---

## Log Filtering

### Filter by Log Level

**Default:** Captures all 18 console types
```javascript
[
  'log', 'info', 'warning', 'error', 'debug',
  'dir', 'dirxml', 'table', 'trace', 'clear',
  'startGroup', 'startGroupCollapsed', 'endGroup',
  'assert', 'profile', 'profileEnd', 'count', 'timeEnd'
]
```

**Custom filtering:**
```bash
# Only errors and warnings
console-bridge start localhost:3000 -l error,warning

# Only errors
console-bridge start localhost:3000 -l error

# Basic logs only
console-bridge start localhost:3000 -l log,info,error

# Advanced types
console-bridge start localhost:3000 -l table,trace,count
```

---

### Examples by Use Case

**Production Monitoring:**
```bash
# Only capture errors
console-bridge start localhost:3000 -l error
```

**Debug Session:**
```bash
# Everything including debug logs
console-bridge start localhost:3000 -l log,debug,trace,error
```

**Performance Analysis:**
```bash
# Timing and counting
console-bridge start localhost:3000 -l count,timeEnd
```

**Clean Output:**
```bash
# Just warnings and errors
console-bridge start localhost:3000 -l warning,error
```

---

## Multiple URLs

### Monitor Multiple Apps

```bash
console-bridge start localhost:3000 localhost:8080 localhost:4000
```

**Output:**
```
🌉 Console Bridge v1.0.0

Starting monitors...
✓ http://localhost:3000/
✓ http://localhost:8080/
✓ http://localhost:4000/

Monitoring 3 URLs. Press Ctrl+C to stop.

[14:32:15] [localhost:3000] log: App 1 ready
[14:32:16] [localhost:8080] log: App 2 ready
[14:32:17] [localhost:4000] error: App 3 error
```

---

### Color-Coded Sources

Each URL gets a unique color for easy visual identification:

```
[localhost:3000] - Cyan
[localhost:3001] - Magenta
[localhost:3002] - Yellow
[localhost:3003] - Blue
...
```

---

### Max Instances Limit

**Default:** Maximum 10 concurrent browser instances

**Override:**
```bash
# Allow up to 20 browsers
console-bridge start localhost:3000 localhost:3001 ... -m 20
```

**Why limit?**
- Each browser consumes ~50-100MB RAM
- Too many instances can slow system
- Prevents accidental resource exhaustion

---

## Integration Examples

### React Development

**package.json:**
```json
{
  "scripts": {
    "dev": "react-scripts start",
    "dev:bridge": "console-bridge start localhost:3000",
    "dev:all": "concurrently \"npm run dev\" \"npm run dev:bridge\""
  }
}
```

**Usage:**
```bash
npm run dev:all
```

---

### Next.js with Turbopack

**package.json:**
```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "bridge": "console-bridge start localhost:3000 --location",
    "dev:debug": "concurrently \"npm run dev\" \"npm run bridge\""
  }
}
```

**Usage:**
```bash
npm run dev:debug
```

---

### Vite Projects

**package.json:**
```json
{
  "scripts": {
    "dev": "vite",
    "dev:monitored": "concurrently \"vite\" \"console-bridge start localhost:5173 -o vite.log\""
  }
}
```

---

### Docker Compose

**docker-compose.yml:**
```yaml
version: '3'
services:
  app:
    build: .
    ports:
      - "3000:3000"

  console-bridge:
    image: node:18
    command: npx @yourorg/console-bridge start app:3000
    depends_on:
      - app
```

---

### CI/CD (GitHub Actions)

**.github/workflows/test.yml:**
```yaml
- name: Start app
  run: npm run dev &

- name: Monitor console
  run: |
    console-bridge start localhost:3000 -o test-logs.txt &
    sleep 5

- name: Run tests
  run: npm test

- name: Upload console logs
  uses: actions/upload-artifact@v3
  with:
    name: console-logs
    path: test-logs.txt
```

---

## API Usage (Programmatic)

If you need to use Console Bridge programmatically in Node.js:

```javascript
const BridgeManager = require('@yourorg/console-bridge/src/core/BridgeManager');

const bridge = new BridgeManager({
  headless: true,
  levels: ['log', 'error', 'warning'],
  output: (formattedLog) => {
    // Custom output handler
    console.log(formattedLog);
    // Or: logToDatabase(formattedLog);
    // Or: sendToSlack(formattedLog);
  }
});

// Start monitoring
await bridge.start(['localhost:3000', 'localhost:8080']);

// Check active URLs
console.log(bridge.getActiveUrls());

// Stop monitoring
await bridge.stop();
```

---

### Custom Output Handler

```javascript
const fs = require('fs');

const bridge = new BridgeManager({
  output: (log) => {
    // Parse log
    const match = log.match(/\[(.*?)\] \[(.*?)\] (.*?): (.*)/);
    if (match) {
      const [, timestamp, source, level, message] = match;

      // Custom logic
      if (level === 'error') {
        fs.appendFileSync('errors.log', `${timestamp}: ${message}\n`);
        sendSlackAlert(message);
      }
    }
  }
});
```

---

### Event-Based Monitoring

```javascript
const EventEmitter = require('events');

class LogMonitor extends EventEmitter {
  constructor() {
    super();
    this.bridge = new BridgeManager({
      output: (log) => this.emit('log', log)
    });
  }

  async start(urls) {
    this.on('log', (log) => {
      if (log.includes('error')) {
        this.emit('error', log);
      }
    });

    await this.bridge.start(urls);
  }
}

const monitor = new LogMonitor();
monitor.on('error', (log) => {
  console.error('ERROR DETECTED:', log);
});

await monitor.start(['localhost:3000']);
```

---

## Advanced Scenarios

### Long-Running Sessions

For sessions lasting hours/days:

```bash
# Save to rotating log files
console-bridge start localhost:3000 -o "logs-$(date +%Y%m%d).txt"

# Or use a log rotation tool
console-bridge start localhost:3000 | rotatelogs logs/console-%Y%m%d.log 86400
```

---

### High-Traffic Applications

For apps with thousands of logs per second:

```bash
# Filter to reduce noise
console-bridge start localhost:3000 -l error,warning

# Or save to file instead of terminal (faster)
console-bridge start localhost:3000 -o fast.log
```

---

### Cross-Browser Testing

```bash
# Monitor same app in multiple environments
console-bridge start localhost:3000 localhost:3000?env=staging localhost:3000?env=prod
```

---

## Performance Tips

1. **Use headless mode** (default) for best performance
2. **Filter log levels** (`-l error,warning`) to reduce processing
3. **Limit concurrent browsers** (`-m 5`) to save RAM
4. **Save to file** (`-o logs.txt`) instead of terminal for high-volume logs
5. **Restart periodically** for long-running sessions to clear memory

---

## Quick Reference

### Common Combinations

**Debug Everything:**
```bash
console-bridge start localhost:3000 --no-headless --location
```

**Production Monitoring:**
```bash
console-bridge start localhost:3000 -l error -o errors.log
```

**Clean Terminal Output:**
```bash
console-bridge start localhost:3000 --no-timestamp -l log,error
```

**Multiple Apps, File Output:**
```bash
console-bridge start localhost:3000 localhost:8080 -o apps.log
```

---

**Next Steps:**
- 📖 [Getting Started Guide](./getting-started.md)
- 🐛 [Troubleshooting Guide](./troubleshooting.md)
- 🧪 [Testing Guide](../../portfolio-test/TESTING_GUIDE.md)
