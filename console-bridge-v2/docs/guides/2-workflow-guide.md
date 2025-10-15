# Workflow Guide - Console Bridge

**Learn the 5 ways to run Console Bridge and when to use each**

This guide shows you exactly how to use Console Bridge in different scenarios across both Puppeteer Mode and Extension Mode.

---

## The 5 Methods

| Method | Mode | Terminals | Use Case | Complexity |
|--------|------|-----------|----------|------------|
| **Method 1: Basic Puppeteer** | Puppeteer | 2 separate | Quick testing, learning | ⭐ Easy |
| **Method 2: Manual Merge** | Puppeteer | 2 separate | When concurrently unavailable | ⭐⭐ Medium |
| **Method 3: Unified** | Puppeteer | 1 unified | Recommended for automation | ⭐ Easy |
| **Method 4: Headful Debug** | Puppeteer | 1 or 2 | Debugging Console Bridge | ⭐⭐⭐ Advanced |
| **Method 5: Extension Mode** | Extension | 1 terminal | **Recommended for daily development** | ⭐ Easy |

**Note:** Methods 1-4 use Puppeteer Mode (automated browser). Method 5 uses Extension Mode (YOUR browser).

---

## Method 1: Basic Usage (Separate Terminals)

**What it is:** Run your dev server and Console Bridge in separate terminals.

**When to use:**
- First time trying Console Bridge
- Quick testing
- Don't want to set up concurrently

### Step-by-Step

**Terminal 1 - Start your dev server:**
```bash
cd path/to/your-project
npm run dev
```

Wait for:
```
✓ Ready on localhost:3000
```

**Terminal 2 - Start Console Bridge:**
```bash
console-bridge start localhost:3000
```

You'll see:
```
🌉 Console Bridge v1.0.0

Starting monitors...
✓ http://localhost:3000/

Monitoring 1 URL. Press Ctrl+C to stop.
```

### Testing It

1. Open browser to `http://localhost:3000`
2. Open DevTools (F12)
3. Type in console:
   ```javascript
   console.log('Hello from browser!');
   ```
4. **Look at Terminal 2** - you'll see:
   ```
   [HH:MM:SS] [localhost:3000] log: Hello from browser!
   ```

### What You'll See

**Terminal 1 (Dev Server):**
```
✓ Ready on localhost:3000
○ Compiling /page ...
✓ Compiled /page in 123ms
```

**Terminal 2 (Console Bridge):**
```
[14:32:15] [localhost:3000] log: Page loaded
[14:32:16] [localhost:3000] info: Component mounted
[14:32:17] [localhost:3000] error: API error
```

### To Stop

- Terminal 1: `Ctrl+C` (stops dev server)
- Terminal 2: `Ctrl+C` (stops Console Bridge)

---

## Method 2: Manual Merge (2 Terminals with --merge-output)

**What it is:** Use `--merge-output` flag manually in separate terminals.

**When to use:**
- Can't install concurrently
- Want to see how --merge-output works
- Advanced testing

### Step-by-Step

**Terminal 1 - Start your dev server:**
```bash
cd path/to/your-project
npm run dev
```

Wait for:
```
✓ Ready on localhost:3000
```

**Terminal 2 - Start Console Bridge with --merge-output:**
```bash
console-bridge start localhost:3000 --merge-output
```

You'll see:
```
🌉 Console Bridge v1.0.0

✓ Successfully attached to process 12345 (node.exe) on port 3000
✓ http://localhost:3000/

Monitoring 1 URL. Press Ctrl+C to stop.
```

### What Happens

Console Bridge tries to attach to the dev server process. If successful:
- Browser logs appear in **Terminal 1** (merged with dev server logs)
- Terminal 2 shows status only

**Note:** This requires both processes to share the same parent terminal session, which is tricky to set up manually. That's why Method 3 (concurrently) is recommended.

---

## Method 3: Unified Terminal (Recommended)

**What it is:** Use `concurrently` to run both processes in one terminal with merged output.

**When to use:**
- **Daily development (recommended)**
- Want everything in one terminal
- Clean, seamless workflow

### Prerequisites

Make sure you completed the [Setup Guide](./1-setup-guide.md) steps 1-3.

### Step-by-Step

**One terminal - that's it!**
```bash
cd path/to/your-project
npm run dev:debug
```

### What You'll See

```
[0]
[0] > your-project@1.0.0 dev
[0] > next dev -p 3000
[0]
[1]
[1] 🌉 Console Bridge v1.0.0
[1]
✓ Successfully attached to process 12345 (node.exe) on port 3000
[1] ✓ http://localhost:3000/
[1]
[0]   ▲ Next.js 15.5.4
[0]   - Local:        http://localhost:3000
[0]
[1] Monitoring 1 URL. Press Ctrl+C to stop.
[0] ○ Compiling / ...
[1] [14:32:15] [localhost:3000] log: Page loaded
[0] ✓ Compiled / in 234ms
[1] [14:32:16] [localhost:3000] info: User action
```

**See?** Dev server logs (`[0]`) and browser console logs (`[1]`) all in one terminal! 🎉

### Testing It

1. Open browser to `http://localhost:3000`
2. Open DevTools (F12)
3. Type in console:
   ```javascript
   console.log('Testing unified terminal!');
   console.error('This is an error');
   console.table([{id: 1, name: 'Test'}]);
   ```
4. **Look at your terminal** - you'll see all the logs mixed with dev server output!

### To Stop

Just press `Ctrl+C` once - stops both processes.

---

## Method 4: Headful Debug Mode

**What it is:** See the Puppeteer browser window (instead of headless/invisible).

**When to use:**
- Debugging why logs aren't captured
- Seeing what Puppeteer sees
- Manual interaction with the monitored browser
- Understanding how Console Bridge works

### Option A: With Separate Terminal (Basic)

**Terminal 1 - Dev server:**
```bash
npm run dev
```

**Terminal 2 - Console Bridge (headful):**
```bash
console-bridge start localhost:3000 --no-headless
```

**You'll see:**
- A Chrome browser window opens
- The browser navigates to your app
- Console logs appear in Terminal 2
- You can click around in the browser window

### Option B: With Unified Terminal (Advanced)

Add this to package.json:
```json
"dev:debug:visual": "concurrently \"npm run dev\" \"console-bridge start localhost:3000 --no-headless --merge-output\""
```

Run:
```bash
npm run dev:debug:visual
```

**You'll see:**
- Browser window opens
- All logs in one terminal
- Can interact with browser

### What's the Browser Window?

**Important:** The browser window shows **your app**, not a Console Bridge UI.

It's literally Chrome running your `http://localhost:3000` - the same app you'd see in your personal browser, but this is the instance that Console Bridge is monitoring.

### When to Use Headful Mode

✅ **Use when:**
- Logs aren't appearing (debug why)
- Need to click buttons to trigger logs
- Want to see what Puppeteer sees
- Learning how Console Bridge works

❌ **Don't use for:**
- Normal daily development (use headless)
- Production/CI (use headless)
- When you want minimal resource usage

### To Stop

Press `Ctrl+C` - browser closes automatically.

---

## Method 5: Extension Mode (v2.0.0 - Recommended for Daily Development)

**What it is:** Use YOUR Chrome browser with the Console Bridge extension to capture logs from whatever page you're viewing.

**When to use:**
- **Daily interactive development (HIGHLY RECOMMENDED)**
- Using browser extensions (React DevTools, Vue DevTools, etc.)
- Testing with YOUR Chrome setup
- Clicking around and interacting with your app manually

### Prerequisites

1. **Install the Chrome extension** (one-time setup):
   - Open Chrome → `chrome://extensions`
   - Enable "Developer mode" (top right toggle)
   - Click "Load unpacked"
   - Select folder: `C:/Claude/console-bridge-v2/chrome-extension-poc`
   - See "Console Bridge" extension card (enabled ✓)

2. **Install Console Bridge CLI** (if not already):
   ```bash
   npm install -g console-bridge
   ```

### Step-by-Step

**Terminal 1 - Start Extension Mode (NO URL NEEDED):**
```bash
console-bridge start --extension-mode
```

You'll see:
```
🚀 Console Bridge v2.0.0
📡 Extension Mode
🔌 WebSocket server listening on ws://localhost:9090
⏳ Waiting for extension connection...
```

**Notice:** NO URL or port specified! Extension captures from whatever page you browse to.

**Browser - Connect the Extension:**
1. **Start your dev server** (in another terminal or background):
   ```bash
   npm run dev
   # Output: Local: http://localhost:3000
   ```

2. **Browse to your app** (ANY localhost port):
   ```
   http://localhost:3000
   ```
   (Or localhost:8080, localhost:3847, etc.)

3. **Open DevTools** (F12)

4. **Click "Console Bridge" tab** (top tabs in DevTools):
   ```
   Elements | Console | Sources | ... | Console Bridge  ← Click this
   ```

5. **Click "Connect" button** in the panel
   - Button turns green: "Connected ✓"
   - Terminal shows: "Extension connected"

### Testing It

1. In Chrome DevTools **Console tab** (not Console Bridge tab), type:
   ```javascript
   console.log('Hello from Extension Mode!');
   ```

2. **Look at your terminal** - you'll see:
   ```
   [timestamp] [localhost:3000] log: Hello from Extension Mode!
   ```

3. Click buttons on your site, navigate pages - all logs appear in terminal!

### What You'll See

**Terminal (Console Bridge):**
```
✓ Extension connected from chrome-extension://abcdefg...
[14:32:15] [localhost:3000] log: Page loaded
[14:32:16] [localhost:3000] info: Button clicked
[14:32:17] [localhost:3000] error: API call failed
```

**Chrome DevTools "Console Bridge" Panel:**
```
Connected ✓

Logs are streaming to your terminal.
```

### Key Differences from Puppeteer Mode

**Extension Mode:**
- ❌ **NO URL/port needed** when starting Console Bridge
- ✅ **YOUR Chrome browser** (not Puppeteer Chromium)
- ✅ **Works with any port** (3000, 8080, 3847 - just browse to it)
- ✅ **Works with browser extensions** (React DevTools, Vue DevTools, etc.)
- ✅ **Manual interactions** (click around your app yourself)

**Puppeteer Mode (Methods 1-4):**
- ✅ **URL required:** `console-bridge start localhost:3000`
- ✅ **Automated browser** (Puppeteer controls it)
- ❌ **Can't use browser extensions**
- ❌ **Limited manual interaction** (headful mode only)

### Multi-Tab Support

Extension Mode works with **multiple tabs** simultaneously:

```bash
# Terminal: Start extension mode once
console-bridge start --extension-mode

# Browser: Open multiple tabs
Tab 1: localhost:3000 → Open DevTools → Connect → Logs stream
Tab 2: localhost:8080 → Open DevTools → Connect → Logs stream
Tab 3: localhost:5173 → Open DevTools → Connect → Logs stream

# All logs appear in same terminal with different labels:
# [localhost:3000] log: ...
# [localhost:8080] info: ...
# [localhost:5173] error: ...
```

### When to Use Extension Mode

✅ **Perfect for:**
- Daily development with React DevTools
- Testing user interactions manually
- Debugging with Vue DevTools, Redux DevTools, etc.
- Using YOUR Chrome with your extensions
- Cross-browser testing (Chrome, Edge, Brave, Opera)

❌ **NOT ideal for:**
- CI/CD pipelines (use Puppeteer Mode)
- Automated testing (use Puppeteer Mode)
- Monitoring without manual interaction (use Puppeteer Mode)

### To Stop

Press `Ctrl+C` in terminal - extension detects disconnection.

**See:** [Port and URL Configuration Guide](./port-and-url-configuration.md) for complete Extension Mode details.

---

## Quick Comparison

### Puppeteer Mode vs Extension Mode

| Feature | Puppeteer Mode (Methods 1-4) | Extension Mode (Method 5) |
|---------|------------------------------|---------------------------|
| **URL Required?** | ✅ YES - Must specify port | ❌ NO - Browse to any port |
| **Browser** | Puppeteer Chromium (automated) | YOUR Chrome (manual) |
| **Browser Extensions** | ❌ Not available | ✅ React DevTools, Vue DevTools, etc. |
| **Manual Interaction** | ⚠️ Limited (headful mode only) | ✅ Full manual control |
| **Use Case** | CI/CD, automation, testing | **Daily development** |
| **Setup Complexity** | ⭐ Easy | ⭐ Easy (one-time extension load) |

**Recommendation:** Use **Extension Mode (Method 5)** for daily development, **Puppeteer Mode (Methods 1-3)** for automation/CI/CD.

### Method 1 vs Method 3 vs Method 5

**Method 1 (Basic Puppeteer - Separate terminals):**
```
Terminal 1: Next.js logs
Terminal 2: Browser console logs (Puppeteer)
```
👉 Switch between terminals, automated browser

**Method 3 (Unified Puppeteer):**
```
Terminal 1: Next.js logs + Browser console logs (together!)
```
👉 See everything in one place, automated browser

**Method 5 (Extension Mode - RECOMMENDED):**
```
Terminal 1: Browser console logs (YOUR Chrome)
```
👉 Use YOUR browser with React DevTools, click around manually

### Method 1 vs Method 3

**Method 1 (Separate terminals):**
```
Terminal 1: Next.js logs
Terminal 2: Browser console logs
```
👉 Switch between terminals to see everything

**Method 3 (Unified):**
```
Terminal 1: Next.js logs + Browser console logs (together!)
```
👉 See everything in one place

### Headless vs Headful

**Headless (default):**
- ❌ No browser window
- ✅ Lightweight
- ✅ Normal workflow

**Headful (--no-headless):**
- ✅ Browser window visible
- ✅ Can click buttons
- ❌ More resource intensive

---

## Common Workflows

### Workflow 1: Daily Development (Recommended)

```bash
# One command, one terminal
npm run dev:debug
```

Benefits:
- Everything in one terminal
- Clean, seamless
- Fast to start/stop

---

### Workflow 2: Quick Testing

**Terminal 1:**
```bash
npm run dev
```

**Terminal 2:**
```bash
console-bridge start localhost:3000
```

Benefits:
- No setup needed
- Easy to understand
- Good for learning

---

### Workflow 3: Multiple Projects

```bash
# Project 1 (port 3000)
console-bridge start localhost:3000

# Project 2 (port 8080)
console-bridge start localhost:8080

# Project 3 (port 5173)
console-bridge start localhost:5173
```

Benefits:
- Monitor multiple apps
- Each gets its own color
- All logs in one terminal

---

## CLI Options Reference

### Basic Options

```bash
# Default (headless, all log levels)
console-bridge start localhost:3000

# Only errors and warnings
console-bridge start localhost:3000 -l error,warning

# Show browser window
console-bridge start localhost:3000 --no-headless

# Unified terminal output
console-bridge start localhost:3000 --merge-output

# Save logs to file
console-bridge start localhost:3000 -o logs.txt
```

### Combined Options

```bash
# Headful + unified + only errors
console-bridge start localhost:3000 --no-headless --merge-output -l error

# Multiple URLs + log filtering
console-bridge start localhost:3000 localhost:8080 -l error,warning

# Everything to file + timestamps
console-bridge start localhost:3000 -o debug.log --timestamp-format iso
```

---

## Testing Checklist

After starting Console Bridge, verify it works:

- [ ] Open your app in a browser
- [ ] Open DevTools (F12)
- [ ] Type `console.log('test')` in browser console
- [ ] See the log in your terminal
- [ ] Try `console.error('error test')`
- [ ] Try `console.table([{a:1,b:2}])`
- [ ] Refresh the page - logs should continue
- [ ] All console types are captured

✅ **Working!** You're all set.

❌ **Not seeing logs?** Check [Troubleshooting Guide](./troubleshooting.md)

---

## Tips & Tricks

### Tip 1: Create Multiple Debug Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "dev:debug": "concurrently \"npm run dev\" \"console-bridge start localhost:3000 --merge-output\"",
    "dev:errors": "concurrently \"npm run dev\" \"console-bridge start localhost:3000 --merge-output -l error,warning\"",
    "dev:visual": "concurrently \"npm run dev\" \"console-bridge start localhost:3000 --no-headless\""
  }
}
```

### Tip 2: Use Aliases (Bash/Zsh)

```bash
# Add to ~/.bashrc or ~/.zshrc
alias cb='console-bridge start'
alias cbm='console-bridge start localhost:3000 --merge-output'
```

Then just:
```bash
cbm  # Runs Console Bridge with merge-output
```

### Tip 3: Color-Coded URLs

When monitoring multiple URLs, each gets a unique color:
```
[localhost:3000] - Cyan
[localhost:3001] - Magenta
[localhost:3002] - Yellow
```

Makes it easy to distinguish logs!

---

## Next Steps

✅ **You're ready!** Pick your method and start developing.

**For more:**
- [Advanced Usage Guide](./advanced-usage.md) - Deep dive into all features
- [Troubleshooting Guide](./troubleshooting.md) - Fix common issues
- [Architecture Overview](../architecture/system-overview.md) - How it works

---

## Quick Reference Card

```bash
# Install (once)
npm install -g console-bridge

# Method 1: Basic (2 terminals)
# Terminal 1: npm run dev
# Terminal 2: console-bridge start localhost:3000

# Method 3: Unified (1 terminal, recommended)
npm run dev:debug

# Method 4: Debug with visible browser
console-bridge start localhost:3000 --no-headless

# Stop
Ctrl+C
```

**Happy developing!** 🚀
