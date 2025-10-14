# Port and URL Configuration Guide

**How Console Bridge connects to your applications**

This guide explains how port and URL configuration works across Console Bridge's two modes.

---

## Table of Contents
- [Quick Reference](#quick-reference)
- [Extension Mode (v2.0.0)](#extension-mode-v200)
- [Puppeteer Mode (v1.0.0)](#puppeteer-mode-v100)
- [Localhost vs 127.0.0.1](#localhost-vs-127001)
- [Port Discovery](#port-discovery)
- [Common Questions](#common-questions)

---

## Quick Reference

| Mode | URL/Port Required? | How It Works |
|------|-------------------|--------------|
| **Extension Mode** | ❌ **NO** | Extension captures from whatever page you're viewing |
| **Puppeteer Mode** | ✅ **YES** | You must specify the URL/port to monitor |

**Extension Mode:**
```bash
# NO URL needed - works with any page you browse to
console-bridge start --extension-mode
```

**Puppeteer Mode:**
```bash
# URL REQUIRED - must specify which localhost to monitor
console-bridge start localhost:3000
```

---

## Extension Mode (v2.0.0)

### No URL Configuration Needed

**Key Point:** Extension Mode does NOT require you to specify a URL or port when starting Console Bridge.

```bash
# Start extension mode (no URL)
console-bridge start --extension-mode
```

**Expected output:**
```
🚀 Console Bridge v2.0.0
📡 Extension Mode
🔌 WebSocket server listening on ws://localhost:9090
⏳ Waiting for extension connection...
```

### How It Works

1. **Console Bridge starts a WebSocket server** (port 9090 by default)
2. **You browse to ANY page** in Chrome (localhost:3000, localhost:8080, localhost:3847, etc.)
3. **Extension captures logs from that page**
4. **Logs appear in terminal** with URL label: `[localhost:3000]` or `[localhost:8080]`

### Dynamic Port Detection

The extension **automatically detects** which page you're viewing:

```bash
# Start extension mode once
console-bridge start --extension-mode

# Then browse to ANY of these in Chrome:
# http://localhost:3000  → Shows [localhost:3000] in terminal
# http://localhost:8080  → Shows [localhost:8080] in terminal
# http://localhost:3847  → Shows [localhost:3847] in terminal
```

**The port/URL appears dynamically based on what page you have DevTools open on.**

### Multi-Tab Support

Extension Mode works with **multiple tabs** simultaneously:

1. Open Tab 1: `http://localhost:3000`
2. Open Tab 2: `http://localhost:8080`
3. Open DevTools on Tab 1 → Connect → Logs from port 3000 appear
4. Switch DevTools to Tab 2 → Logs from port 8080 appear

**Only the tab with DevTools open and connected streams logs.**

### Connection Process

**Step 1:** Start CLI (no URL)
```bash
console-bridge start --extension-mode
```

**Step 2:** Browse to your app
```
http://localhost:YOUR_PORT
```
(Replace `YOUR_PORT` with 3000, 3847, 8080, etc.)

**Step 3:** Open DevTools (F12)

**Step 4:** Click "Console Bridge" tab in DevTools

**Step 5:** Click "Connect" button

**Step 6:** Logs from that page stream to terminal

**No URL configuration anywhere - it just captures from the page you're viewing!**

---

## Puppeteer Mode (v1.0.0)

### URL/Port Required

**Key Point:** Puppeteer Mode REQUIRES you to specify the URL and port when starting Console Bridge.

```bash
# URL REQUIRED - must specify localhost and port
console-bridge start localhost:3000
```

### Supported URL Formats

All of these work:

```bash
# Short format (recommended)
console-bridge start localhost:3000

# Full HTTP URL
console-bridge start http://localhost:3000

# With path
console-bridge start localhost:3000/app

# 127.0.0.1 instead of localhost
console-bridge start 127.0.0.1:3000

# HTTPS
console-bridge start https://localhost:3443
```

### Multiple URLs

You can monitor multiple URLs simultaneously:

```bash
# Monitor 3 different apps
console-bridge start localhost:3000 localhost:8080 localhost:5173
```

Each URL gets:
- Its own Puppeteer browser instance
- Its own color in terminal output
- Independent monitoring

**Output example:**
```
[12:34:56] [localhost:3000] log: App 1 message
[12:34:57] [localhost:8080] info: App 2 message
[12:34:58] [localhost:5173] error: App 3 error
```

### Port Must Be Specified

**This will NOT work:**
```bash
# ❌ ERROR - no port specified
console-bridge start localhost
```

**This WILL work:**
```bash
# ✅ Correct - port included
console-bridge start localhost:3000
```

### Security: Localhost Only

Console Bridge **only** works with localhost/127.0.0.1 for security:

```bash
# ✅ Allowed
console-bridge start localhost:3000
console-bridge start 127.0.0.1:3000

# ❌ Blocked - not localhost
console-bridge start example.com
console-bridge start 192.168.1.100:3000
console-bridge start yoursite.com:3000
```

**Why?** Prevents accidental monitoring of production or third-party websites.

---

## Localhost vs 127.0.0.1

### They're Interchangeable

Both `localhost` and `127.0.0.1` work identically:

```bash
# These are equivalent
console-bridge start localhost:3000
console-bridge start 127.0.0.1:3000
```

### When to Use Which

| Use Case | Recommended Format |
|----------|-------------------|
| Normal development | `localhost:PORT` |
| IPv6 disabled | `127.0.0.1:PORT` |
| Docker containers | `127.0.0.1:PORT` |
| DNS issues | `127.0.0.1:PORT` |

### IPv4 vs IPv6

- `localhost` can resolve to IPv4 (127.0.0.1) or IPv6 (::1)
- `127.0.0.1` explicitly uses IPv4
- Most dev servers default to IPv4, so both work fine

---

## Port Discovery

### How Console Bridge Finds Dev Server Process

When using `--merge-output` flag, Console Bridge needs to find which process is running on the specified port:

**Windows:**
```bash
console-bridge start localhost:3000 --merge-output
# Uses: netstat -ano | findstr :3000
# Finds process ID listening on port 3000
```

**Unix/Mac:**
```bash
console-bridge start localhost:3000 --merge-output
# Uses: lsof -i :3000
# Finds process ID listening on port 3000
```

### Graceful Fallback

If process discovery fails, Console Bridge falls back gracefully:

```
ℹ️  No process found listening on port 3000. Using separate terminal.
```

This can happen if:
- Dev server hasn't started yet
- Port not listening
- Permission denied to access process info

**Console Bridge continues working normally** - logs still appear, just not merged with dev server output.

---

## Common Questions

### Q: Do I need to configure ports in Extension Mode?

**A:** No! Extension Mode captures from whatever page you're viewing. Just browse to any `localhost:PORT` and open DevTools.

### Q: Can I change the WebSocket port in Extension Mode?

**A:** Yes, use `--port` flag:
```bash
console-bridge start --extension-mode --port 9091
```

Default is 9090. You rarely need to change this unless port 9090 is already in use.

### Q: What if my dev server uses a random port?

**Puppeteer Mode:**
```bash
# Check what port your dev server chose
# Then start Console Bridge with that port
console-bridge start localhost:ACTUAL_PORT
```

**Extension Mode:**
```bash
# No problem! Extension captures from any port
console-bridge start --extension-mode
# Then browse to whatever port your server chose
```

### Q: Can I monitor non-localhost URLs?

**A:** No. Console Bridge is restricted to localhost/127.0.0.1 for security. This prevents:
- Accidentally monitoring production sites
- Capturing data from third-party websites
- Privacy/security violations

### Q: How do I know which port my dev server is using?

Check your dev server output:

**Next.js:**
```
- Local: http://localhost:3000  ← Port is 3000
```

**Vite:**
```
Local: http://localhost:5173/  ← Port is 5173
```

**Create React App:**
```
Local: http://localhost:3000  ← Port is 3000
```

Or check your `package.json` scripts or framework config.

### Q: Can Extension Mode monitor multiple ports at once?

**A:** Yes! Just open DevTools on each tab/page:

```bash
# Start extension mode once
console-bridge start --extension-mode

# Then open DevTools on:
# Tab 1: localhost:3000 → Connect → Logs appear
# Tab 2: localhost:8080 → Connect → Logs appear
# Both stream to same terminal with different labels
```

### Q: Can Puppeteer Mode monitor the same app as Extension Mode?

**A:** Yes! You can run both modes simultaneously:

```bash
# Terminal 1: Puppeteer Mode
console-bridge start localhost:3000

# Terminal 2: Extension Mode
console-bridge start --extension-mode

# Both monitor the same app at localhost:3000
# Logs appear in separate terminals
```

---

## Examples

### Example 1: Next.js Development (Extension Mode)

```bash
# Terminal 1: Start dev server (any port)
npm run dev
# Output: Local: http://localhost:3000

# Terminal 2: Start extension mode (no port needed)
console-bridge start --extension-mode

# Browser: Navigate to http://localhost:3000
# Browser: Press F12, click "Console Bridge" tab, click "Connect"
# Terminal 2: Logs appear with [localhost:3000] label
```

### Example 2: Multiple Apps (Puppeteer Mode)

```bash
# Terminal 1: Start all dev servers
# Frontend: localhost:3000
# Backend: localhost:8080
# Docs: localhost:5173

# Terminal 2: Monitor all with Puppeteer
console-bridge start localhost:3000 localhost:8080 localhost:5173

# Logs from all 3 apps appear in Terminal 2
```

### Example 3: Unified Terminal (Puppeteer Mode)

```bash
# Single terminal - dev server + console bridge merged
npx concurrently "npm run dev" "sleep 12 && console-bridge start localhost:3000 --merge-output"

# Both outputs appear in same terminal
```

---

## Related Documentation

- [Getting Started Guide](./getting-started.md) - Initial setup
- [Usage Guide](./2-usage-guide.md) - How to use each mode
- [System Architecture](../architecture/system-overview.md) - Technical details
- [Troubleshooting Guide](./troubleshooting.md) - Fix connection issues

---

**Last Updated:** October 14, 2025
**Version:** 2.0.0
