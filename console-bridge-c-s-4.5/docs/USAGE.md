# Console Bridge - User Guide

**Version:** 1.0.0-rc

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [CLI Options Reference](#cli-options-reference)
- [Common Use Cases](#common-use-cases)
- [File Export](#file-export)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)

---

## Installation

### Global Installation (Recommended)

Install Console Bridge globally to use it anywhere on your system:

```bash
npm install -g console-bridge
```

After installation, verify it works:

```bash
console-bridge --version
```

### Local Installation

Install as a development dependency in your project:

```bash
npm install --save-dev console-bridge
```

Then run it using npx:

```bash
npx console-bridge start localhost:3000
```

Or add it to your package.json scripts:

```json
{
  "scripts": {
    "monitor": "console-bridge start localhost:3000"
  }
}
```

---

## Quick Start

### Monitor a Single Application

```bash
console-bridge start localhost:3000
```

This will:
1. Launch a headless Chrome browser
2. Navigate to http://localhost:3000
3. Stream all console logs to your terminal in real-time
4. Display logs with timestamps, colors, and source labels

### Monitor Multiple Applications

```bash
console-bridge start localhost:3000 localhost:8080 localhost:5000
```

Each URL gets its own browser instance and color-coded output.

### Stop Monitoring

Press `Ctrl+C` to gracefully shut down all browser instances.

---

## CLI Options Reference

### Basic Command Structure

```bash
console-bridge start <urls...> [options]
```

### Required Arguments

- `<urls...>` - One or more localhost URLs to monitor
  - Examples: `localhost:3000`, `http://localhost:8080`, `127.0.0.1:5000`
  - Only localhost/127.0.0.1 URLs are accepted for security

### Optional Flags

#### Log Filtering

**`-l, --levels <levels>`**
Filter which log levels to capture (comma-separated).

Default: `log,info,warn,error,debug`

```bash
# Only show errors and warnings
console-bridge start localhost:3000 --levels error,warn

# Only show errors
console-bridge start localhost:3000 --levels error
```

#### Browser Options

**`--no-headless`**
Show browser windows instead of running headless.

Useful for debugging or seeing what the browser is doing.

```bash
console-bridge start localhost:3000 --no-headless
```

**`-m, --max-instances <number>`**
Maximum concurrent browser instances (default: 10).

```bash
# Limit to 3 browser instances
console-bridge start localhost:3000 localhost:8080 --max-instances 3
```

#### Output Formatting

**`--no-timestamp`**
Hide timestamps from output.

```bash
console-bridge start localhost:3000 --no-timestamp
```

**`--timestamp-format <format>`**
Choose timestamp format: `time` or `iso` (default: `time`).

```bash
# Use ISO 8601 format
console-bridge start localhost:3000 --timestamp-format iso

# Output: [2025-10-02T14:30:45.123Z] [localhost:3000] log: Hello
```

**`--no-source`**
Hide source URLs from output.

```bash
console-bridge start localhost:3000 --no-source
```

**`--location`**
Show file location (filename:line:column) for each log.

```bash
console-bridge start localhost:3000 --location

# Output: [12:34:56] [localhost:3000] log: Hello (app.js:42:10)
```

#### File Export

**`-o, --output <file>`**
Save logs to a file (appends if file exists).

ANSI color codes are automatically stripped from file output.

```bash
# Save all logs to file
console-bridge start localhost:3000 --output logs.txt

# Save from multiple sources
console-bridge start localhost:3000 localhost:8080 --output combined.log
```

---

## Common Use Cases

### 1. Debugging a Single Dev Server

```bash
console-bridge start localhost:3000
```

See all console output from your React, Vue, or Angular app in the terminal.

### 2. Monitoring Microservices

```bash
console-bridge start \
  localhost:3000 \
  localhost:8080 \
  localhost:5000 \
  localhost:4000
```

Monitor multiple backend services and frontends simultaneously.

### 3. Error-Only Monitoring

```bash
console-bridge start localhost:3000 --levels error
```

Focus on errors while ignoring info/debug logs.

### 4. Saving Logs for Later Review

```bash
console-bridge start localhost:3000 --output debug-session.log
```

Logs appear in terminal AND are saved to file (without colors).

### 5. Debugging with Visible Browser

```bash
console-bridge start localhost:3000 --no-headless
```

See the browser window to understand what's happening visually.

### 6. Minimal Output for CI/CD

```bash
console-bridge start localhost:3000 --no-timestamp --no-source --levels error
```

Clean, minimal output showing only errors.

### 7. Detailed Debugging with File Locations

```bash
console-bridge start localhost:3000 --location
```

See exactly which file and line number generated each log.

### 8. Long-Running Session with Log Archival

```bash
console-bridge start localhost:3000 --output "session-$(date +%Y%m%d-%H%M%S).log"
```

Create timestamped log files for each monitoring session.

---

## File Export

### Basic Usage

```bash
console-bridge start localhost:3000 --output logs.txt
```

### File Format

Logs are saved as plain text with ANSI color codes stripped:

```
[12:34:56] [localhost:3000] log: Application started
[12:34:57] [localhost:3000] info: User logged in
[12:34:58] [localhost:3000] error: Connection failed
```

### Append Mode

If the file already exists, new logs are **appended** (not overwritten):

```bash
# First run
console-bridge start localhost:3000 --output logs.txt

# Ctrl+C to stop

# Second run - logs are added to end of file
console-bridge start localhost:3000 --output logs.txt
```

### Combining with Other Options

```bash
# Save only errors, with ISO timestamps
console-bridge start localhost:3000 \
  --levels error \
  --timestamp-format iso \
  --output errors.log
```

### File Permissions

Console Bridge needs write permissions for the output file. If you get an error:

```bash
# Make sure directory exists
mkdir -p logs
console-bridge start localhost:3000 --output logs/debug.txt

# Or use absolute path
console-bridge start localhost:3000 --output /tmp/console-bridge.log
```

---

## Troubleshooting

### Error: "Invalid URL"

**Problem:** URL doesn't match expected format.

**Solution:** Use `localhost:PORT` or `http://localhost:PORT` or `127.0.0.1:PORT`

```bash
# ❌ Wrong
console-bridge start example.com

# ✅ Correct
console-bridge start localhost:3000
```

### Error: "must be localhost or 127.0.0.1"

**Problem:** Trying to monitor a non-local URL.

**Solution:** Console Bridge only works with localhost for security. Use a proxy or tunnel if you need to monitor remote servers.

### Error: "Failed to navigate"

**Problem:** The URL isn't responding or the server isn't running.

**Solution:**
1. Make sure your dev server is running
2. Verify the port number is correct
3. Check if the server is actually on localhost

```bash
# Test if server is running
curl http://localhost:3000
```

### No Logs Appearing

**Problem:** Browser connects but no logs show up.

**Possible causes:**
1. Application hasn't logged anything yet
2. Wrong log levels filtered
3. Application logs to a different console method

**Solutions:**

```bash
# Try capturing all log levels
console-bridge start localhost:3000 --levels log,info,warn,error,debug

# Enable location to see where logs come from
console-bridge start localhost:3000 --location
```

### Browser Crashes or Hangs

**Problem:** Puppeteer browser instance becomes unresponsive.

**Solutions:**
1. Reduce max instances: `--max-instances 5`
2. Check available system memory
3. Kill orphaned Chrome processes: `pkill chrome` (Linux/Mac) or Task Manager (Windows)

### "Too Many Instances" Error

**Problem:** Trying to monitor more URLs than max-instances allows.

**Solution:**

```bash
# Increase max instances
console-bridge start localhost:3000 localhost:8080 --max-instances 20
```

### File Write Errors

**Problem:** Can't write to output file.

**Solutions:**
1. Check directory exists: `mkdir -p logs`
2. Check permissions: `chmod 755 logs/`
3. Use absolute path: `console-bridge start localhost:3000 --output /tmp/logs.txt`
4. Close file if it's open in another program

---

## FAQ

### Q: Does this work with remote servers?

**A:** No, Console Bridge only works with localhost/127.0.0.1 for security reasons. This prevents accidental monitoring of production or third-party websites.

### Q: Can I use this in production?

**A:** Console Bridge is designed for **development only**. It launches browser instances which consume resources. For production log monitoring, use proper logging infrastructure (Datadog, Splunk, ELK stack, etc.).

### Q: How much memory does it use?

**A:** Each browser instance uses ~50-100MB of RAM. Monitoring 5 URLs = ~250-500MB. Use `--max-instances` to limit resource usage.

### Q: Can I customize the output format?

**A:** CLI output format is fixed, but you can:
1. Use formatting options: `--no-timestamp`, `--no-source`, `--location`
2. Use the [Programmatic API](./API.md) for full customization

### Q: Does it capture errors from React/Vue/Angular?

**A:** Yes! Console Bridge captures all `console.log()`, `console.error()`, `console.warn()`, etc. calls, including those from frameworks.

### Q: What about network errors or failed requests?

**A:** Console Bridge only captures console methods. It doesn't capture network logs. Use browser DevTools or a network monitoring tool for that.

### Q: Can I filter logs by content (not just level)?

**A:** Not currently in the CLI. Use the output file with `grep`:

```bash
console-bridge start localhost:3000 --output logs.txt

# In another terminal
tail -f logs.txt | grep "error"
```

Or use the [Programmatic API](./API.md) to implement custom filtering.

### Q: Does it work on Windows?

**A:** Yes! Console Bridge works on Windows, macOS, and Linux.

### Q: Can I monitor https://localhost?

**A:** Yes, both `http://` and `https://` localhost URLs work:

```bash
console-bridge start https://localhost:3000
```

### Q: What browsers does it support?

**A:** Console Bridge uses Puppeteer, which controls Chromium. It doesn't support Firefox or Safari.

### Q: How do I update Console Bridge?

**A:**

```bash
# Global installation
npm update -g console-bridge

# Local installation
npm update console-bridge
```

### Q: Where can I report bugs?

**A:** Open an issue on the GitHub repository (link in package.json).

---

## Next Steps

- **Programmatic Usage:** See [API Documentation](./API.md) for library usage
- **Examples:** Check the `examples/` directory for sample code
- **Advanced Features:** Read the [README](../README.md) for full feature list

---

**Questions or Issues?** Check the [GitHub repository](https://github.com/yourusername/console-bridge) or open an issue.
