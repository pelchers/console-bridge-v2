# Getting Started with Console Bridge

Welcome to Console Bridge! This guide will help you install and start using Console Bridge to stream browser console logs to your terminal.

## Table of Contents
- [What is Console Bridge?](#what-is-console-bridge)
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Quick Example](#quick-example)
- [Next Steps](#next-steps)

---

## What is Console Bridge?

Console Bridge is a CLI tool that captures browser console logs from your localhost development server and streams them directly to your terminal. It's like having Chrome DevTools console output piped straight to your command line.

**Key Features:**
- 🚀 Real-time console log streaming
- 🎨 Color-coded log levels (log, info, warn, error, debug)
- 📊 Advanced console types (table, group, count, time, trace, etc.)
- 🔄 Auto-reconnection on page refresh/hot reload
- 🌐 Monitor multiple URLs simultaneously
- ⚙️ Configurable output formats

**How it works:**
1. Console Bridge launches a headless Puppeteer browser
2. It navigates to your localhost URL
3. All console output from that page streams to your terminal
4. Listeners automatically re-attach on page navigation/refresh

---

## Installation

### Prerequisites
- Node.js 16 or higher
- npm or yarn

### Global Installation (Recommended)
```bash
npm install -g @yourorg/console-bridge
```

### Local Project Installation
```bash
npm install --save-dev @yourorg/console-bridge
```

### Verify Installation
```bash
console-bridge --version
```

You should see:
```
1.0.0
```

---

## Basic Usage

### Start Monitoring a URL

```bash
console-bridge start localhost:3000
```

This will:
1. Launch a headless browser
2. Navigate to `http://localhost:3000`
3. Start streaming console logs to your terminal

### Monitor Multiple URLs

```bash
console-bridge start localhost:3000 localhost:3001 localhost:4000
```

### Stop Monitoring

Press `Ctrl+C` in the terminal where Console Bridge is running.

---

## Quick Example

### Step 1: Start Your Development Server

```bash
# In terminal 1
cd my-app
npm run dev
```

Your app is now running at `http://localhost:3000`

### Step 2: Start Console Bridge

```bash
# In terminal 2
console-bridge start localhost:3000
```

You'll see:
```
🌉 Console Bridge v1.0.0

Starting monitors...
✓ http://localhost:3000/

Monitoring 1 URL. Press Ctrl+C to stop.
```

### Step 3: Trigger Console Logs

In your app code:
```javascript
console.log('Hello from the browser!');
console.error('This is an error');
console.table([{ name: 'Alice', age: 25 }]);
```

### Step 4: See Output in Terminal

```
[14:32:15] [localhost:3000] log: Hello from the browser!
[14:32:15] [localhost:3000] error: This is an error
[14:32:15] [localhost:3000] table:
┌───────┬─────┐
│ name  │ age │
├───────┼─────┤
│ Alice │ 25  │
└───────┴─────┘
```

---

## Understanding the Output Format

Each log line follows this format:

```
[TIMESTAMP] [SOURCE] LEVEL: MESSAGE
```

**Example:**
```
[14:32:15] [localhost:3000] log: Button clicked!
```

- `[14:32:15]` - Timestamp when the log occurred
- `[localhost:3000]` - Source URL (color-coded per URL)
- `log:` - Log level (log, info, warning, error, debug)
- `Button clicked!` - The actual message

**Color Coding:**
- 🔵 **info** - Blue
- ⚪ **log** - White
- 🟡 **warning** - Yellow
- 🔴 **error** - Red
- ⚫ **debug** - Gray

---

## Common Workflows

### Unified Terminal Workflow (Recommended)

For the best developer experience, use `concurrently` to run both your dev server and Console Bridge in a **single terminal**:

**Setup:**
```bash
npm install --save-dev concurrently
```

**package.json:**
```json
{
  "scripts": {
    "dev": "next dev",
    "dev:all": "concurrently \"npm run dev\" \"console-bridge start localhost:3000\""
  }
}
```

**Usage:**
```bash
npm run dev:all
```

**Output (single terminal):**
```
[0] ▲ Next.js 14.0.0
[0] - Local: http://localhost:3000
[1] 🌉 Console Bridge v1.0.0
[1] Monitoring 1 URL...
[0] ○ Compiling /...
[1] [14:32:15] [localhost:3000] log: App loaded!
```

**Benefits:**
- ✅ Single terminal to monitor everything
- ✅ No context switching between terminals
- ✅ Logs from dev server and browser appear together
- ✅ Cleaner workspace

---

### Traditional Two-Terminal Workflow

Alternatively, run in separate terminals:

**React Development:**
```bash
# Terminal 1
npm run dev

# Terminal 2
console-bridge start localhost:3000
```

**Next.js Projects:**
```bash
# Terminal 1
next dev

# Terminal 2
console-bridge start localhost:3000
```

**Vite Projects:**
```bash
# Terminal 1
npm run dev

# Terminal 2
console-bridge start localhost:5173
```

### Multiple Projects
```bash
console-bridge start localhost:3000 localhost:8080 localhost:4000
```

---

## Next Steps

- 📖 [Advanced Usage](./advanced-usage.md) - Learn about CLI options, headless mode, output formats
- 🐛 [Troubleshooting](./troubleshooting.md) - Fix common issues and errors
- 🎯 [Examples](../examples/) - See real-world usage examples

---

## Quick Reference

### Start Monitoring
```bash
console-bridge start <url>
```

### Common Options
```bash
# Hide timestamps
console-bridge start localhost:3000 --no-timestamp

# Show browser window (for debugging)
console-bridge start localhost:3000 --no-headless

# Save logs to file
console-bridge start localhost:3000 -o logs.txt

# Filter log levels
console-bridge start localhost:3000 -l log,error,warning
```

### Get Help
```bash
console-bridge --help
console-bridge start --help
```

---

**Need help?** Check the [Troubleshooting Guide](./troubleshooting.md) or [open an issue](https://github.com/yourorg/console-bridge/issues).
