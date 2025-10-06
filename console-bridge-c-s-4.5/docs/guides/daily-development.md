# Daily Development Guide

Recommended workflows for using Console Bridge in your daily development, with full step-by-step instructions for each method.

---

## Table of Contents
- [Quick Start (Recommended)](#quick-start-recommended)
- [Setup Instructions](#setup-instructions)
- [Recommended Workflows](#recommended-workflows)
  - [Method 1: Single Terminal (Headless)](#method-1-single-terminal-headless)
  - [Method 2: Single Terminal (Headful for Debugging)](#method-2-single-terminal-headful-for-debugging)
  - [Method 3: Two Terminals (Headless)](#method-3-two-terminals-headless)
  - [Method 4: Two Terminals (Headful for Debugging)](#method-4-two-terminals-headful-for-debugging)
- [Package.json Integration](#packagejson-integration)
- [Troubleshooting](#troubleshooting)
- [Test Results](#test-results)

---

## Quick Start (Recommended)

**For daily development:**
```bash
cd your-project && npx concurrently "npm run dev" "sleep 12 && console-bridge start localhost:YOUR_PORT --merge-output"
```

**For debugging with visible browser:**
```bash
cd your-project && npx concurrently "npm run dev" "sleep 12 && console-bridge start localhost:YOUR_PORT --merge-output --no-headless"
```

Replace `YOUR_PORT` with your dev server port (e.g., 3000, 3847, 5173).

---

## Setup Instructions

### Prerequisites

1. **Install Console Bridge** (if not already installed):
   ```bash
   npm install -g console-bridge
   ```

2. **Install concurrently** in your project:
   ```bash
   cd your-project
   npm install --save-dev concurrently
   ```

3. **Know your dev server port** (check your `package.json` or framework defaults):
   - Next.js: Usually `3000`
   - Vite: Usually `5173`
   - Create React App: Usually `3000`
   - Custom: Check your dev server configuration

---

## Recommended Workflows

### Method 1: Single Terminal (Headless)

**Best for:** Daily development, clean workflow, minimal resource usage

**Full Command:**
```bash
cd your-project && npx concurrently "npm run dev" "sleep 12 && console-bridge start localhost:YOUR_PORT --merge-output"
```

#### Step-by-Step Instructions

1. **Open a terminal** in your project directory

2. **Run the command:**
   ```bash
   npx concurrently "npm run dev" "sleep 12 && console-bridge start localhost:YOUR_PORT --merge-output"
   ```

3. **What happens:**
   - `concurrently` starts both processes in a single terminal
   - **Process [0]:** Your dev server starts (e.g., Next.js, Vite)
   - **12-second delay:** Waits for dev server to be ready
   - **Process [1]:** Console Bridge starts and attaches to dev server process
   - Both outputs appear in the same terminal with `[0]` and `[1]` labels

4. **Expected output:**
   ```
   [0] ▲ Next.js 15.5.4
   [0] - Local: http://localhost:3000
   [0] ✓ Ready in 1.5s
   [1] 🌉 Console Bridge v1.0.0
   [1] ✓ Successfully attached to process 12345 on port 3000
   [1] ✓ http://localhost:3000/
   [1] Monitoring 1 URL. Press Ctrl+C to stop.
   [1] [14:32:15] [localhost:3000] log: App initialized
   ```

5. **To stop:** Press `Ctrl+C` (stops both processes)

#### Example: Next.js Project

```bash
cd my-next-app && npx concurrently "npm run dev" "sleep 12 && console-bridge start localhost:3000 --merge-output"
```

#### Example: Vite Project

```bash
cd my-vite-app && npx concurrently "npm run dev" "sleep 12 && console-bridge start localhost:5173 --merge-output"
```

#### Example: Create React App

```bash
cd my-react-app && npx concurrently "npm start" "sleep 12 && console-bridge start localhost:3000 --merge-output"
```

---

### Method 2: Single Terminal (Headful for Debugging)

**Best for:** Debugging, visual verification, manual interaction with browser

**Full Command:**
```bash
cd your-project && npx concurrently "npm run dev" "sleep 12 && console-bridge start localhost:YOUR_PORT --merge-output --no-headless"
```

#### Step-by-Step Instructions

1. **Open a terminal** in your project directory

2. **Run the command:**
   ```bash
   npx concurrently "npm run dev" "sleep 12 && console-bridge start localhost:YOUR_PORT --merge-output --no-headless"
   ```

3. **What happens:**
   - Same as Method 1, but with `--no-headless` flag
   - **A browser window opens** showing your application
   - You can interact with the browser (click buttons, fill forms, etc.)
   - Console logs from browser appear in terminal

4. **Expected output:**
   ```
   [0] ▲ Next.js 15.5.4
   [0] - Local: http://localhost:3000
   [0] ✓ Ready in 1.5s
   [1] 🌉 Console Bridge v1.0.0
   [1] ✓ Successfully attached to process 12345 on port 3000
   [1] ✓ http://localhost:3000/
   [1] Monitoring 1 URL. Press Ctrl+C to stop.
   ```
   **Plus:** Browser window opens displaying your app

5. **To stop:** Press `Ctrl+C` (closes browser and stops both processes)

#### Use Cases

- **Visual Debugging:** See exactly what Puppeteer sees
- **Manual Testing:** Click buttons and interact with UI
- **Layout Issues:** Verify CSS/layout problems
- **DevTools Access:** Open browser DevTools to inspect elements

---

### Method 3: Two Terminals (Headless)

**Best for:** Manual control, restarting Console Bridge independently, no `concurrently` dependency

**Full Commands:**

#### Terminal 1 (Dev Server):
```bash
cd your-project
npm run dev
```

#### Terminal 2 (Console Bridge):
```bash
console-bridge start localhost:YOUR_PORT --merge-output
```

#### Step-by-Step Instructions

1. **Open Terminal 1** in your project directory

2. **Start dev server:**
   ```bash
   npm run dev
   ```

3. **Wait for dev server to be ready** (look for "Ready" message):
   ```
   ▲ Next.js 15.5.4
   - Local: http://localhost:3000
   ✓ Ready in 1.5s
   ```

4. **Open Terminal 2** (new terminal window/tab)

5. **Start Console Bridge:**
   ```bash
   console-bridge start localhost:YOUR_PORT --merge-output
   ```

6. **What happens:**
   - **Terminal 1:** Shows only dev server logs
   - **Terminal 2:** Shows merged output (dev server logs + browser console)
   - Console Bridge "taps" Terminal 1's process output

7. **Expected output in Terminal 2:**
   ```
   🌉 Console Bridge v1.0.0
   ✓ Successfully attached to process 12345 on port 3000
   ✓ http://localhost:3000/
   Monitoring 1 URL. Press Ctrl+C to stop.
   [14:32:15] [localhost:3000] log: App initialized
   ```

8. **To stop:**
   - Terminal 2: Press `Ctrl+C` (stops Console Bridge)
   - Terminal 1: Press `Ctrl+C` (stops dev server)

#### Advantages

- ✅ No `concurrently` dependency needed
- ✅ Manual control over each process
- ✅ Can restart Console Bridge without restarting dev server
- ✅ No timing/delay issues

---

### Method 4: Two Terminals (Headful for Debugging)

**Best for:** Debugging with separate terminals, manual browser interaction

**Full Commands:**

#### Terminal 1 (Dev Server):
```bash
cd your-project
npm run dev
```

#### Terminal 2 (Console Bridge with Headful Mode):
```bash
console-bridge start localhost:YOUR_PORT --merge-output --no-headless
```

#### Step-by-Step Instructions

1. **Follow steps 1-4 from Method 3** (start dev server in Terminal 1)

2. **In Terminal 2, start Console Bridge with `--no-headless`:**
   ```bash
   console-bridge start localhost:YOUR_PORT --merge-output --no-headless
   ```

3. **What happens:**
   - **Terminal 1:** Shows only dev server logs
   - **Terminal 2:** Shows merged output
   - **Browser window opens** showing your app
   - You can interact with the browser manually

4. **To stop:**
   - Terminal 2: Press `Ctrl+C` (stops Console Bridge and closes browser)
   - Terminal 1: Press `Ctrl+C` (stops dev server)

---

## Package.json Integration

Add these scripts to your `package.json` for easy access:

```json
{
  "scripts": {
    "dev": "next dev",
    "dev:debug": "concurrently \"npm run dev\" \"sleep 12 && console-bridge start localhost:3000 --merge-output\"",
    "dev:debug:headful": "concurrently \"npm run dev\" \"sleep 12 && console-bridge start localhost:3000 --merge-output --no-headless\""
  },
  "devDependencies": {
    "concurrently": "^8.0.0"
  }
}
```

**Then run:**
```bash
npm run dev:debug          # Method 1: Headless, unified output
npm run dev:debug:headful  # Method 2: Headful, unified output
```

### Framework-Specific Examples

#### Next.js with Turbopack
```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "dev:debug": "concurrently \"npm run dev\" \"sleep 12 && console-bridge start localhost:3000 --merge-output\""
  }
}
```

#### Vite
```json
{
  "scripts": {
    "dev": "vite",
    "dev:debug": "concurrently \"npm run dev\" \"sleep 12 && console-bridge start localhost:5173 --merge-output\""
  }
}
```

#### Create React App
```json
{
  "scripts": {
    "start": "react-scripts start",
    "dev:debug": "concurrently \"npm start\" \"sleep 12 && console-bridge start localhost:3000 --merge-output\""
  }
}
```

#### Express Server
```json
{
  "scripts": {
    "dev": "nodemon server.js",
    "dev:debug": "concurrently \"npm run dev\" \"sleep 12 && console-bridge start localhost:8080 --merge-output\""
  }
}
```

---

## Troubleshooting

### Issue: "No process found listening on port"

**Symptoms:**
```
ℹ️  No process found listening on port 3000. Using separate terminal.
```

**Cause:** Dev server hasn't started yet, or `sleep` delay is too short

**Solutions:**
1. **Increase delay:** Change `sleep 12` to `sleep 15` or `sleep 20`
2. **Use two-terminal method:** Manual control ensures dev server is ready

### Issue: "Permission denied to access process"

**Symptoms:**
```
ℹ️  Permission denied to access process 12345. Using separate terminal.
```

**Cause:** Process owned by different user, or permission restrictions

**Solutions:**
1. Run with same user account
2. Use separate terminal (Console Bridge falls back gracefully)
3. On Windows: Run terminal as Administrator

### Issue: Port already in use

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Cause:** Another process is using the port

**Solutions:**
1. **Find and kill the process:**
   - Windows: `netstat -ano | grep 3000` then `taskkill //F //PID <PID>`
   - Unix: `lsof -i :3000` then `kill -9 <PID>`
2. **Change port:** Use a different port in your dev server config

### Issue: Browser logs not appearing

**Symptoms:** Dev server logs appear, but no browser console logs

**Cause:** Page not loaded, or JavaScript errors preventing app from running

**Solutions:**
1. **Check browser (headful mode):** Run with `--no-headless` to see browser
2. **Check dev server logs:** Look for compilation errors
3. **Check Console Bridge status:** Should say "Monitoring 1 URL"
4. **Navigate manually:** Open `http://localhost:YOUR_PORT` in your browser to verify app works

### Issue: Console Bridge exits immediately

**Symptoms:**
```
Failed to start monitoring localhost:3000: net::ERR_CONNECTION_REFUSED
```

**Cause:** Dev server not ready yet

**Solutions:**
1. **Wait longer:** Increase `sleep` delay
2. **Check dev server:** Ensure it's running and accessible at the port
3. **Test manually:** Visit `http://localhost:YOUR_PORT` in your browser first

---

## Command Reference

### Basic Flags

| Flag | Description | Example |
|------|-------------|---------|
| `--merge-output` | Merge browser logs with dev server output | `console-bridge start localhost:3000 --merge-output` |
| `--no-headless` | Show browser window (headful mode) | `console-bridge start localhost:3000 --no-headless` |
| `--levels <levels>` | Filter log levels | `console-bridge start localhost:3000 -l error,warning` |
| `--output <file>` | Save logs to file | `console-bridge start localhost:3000 -o logs.txt` |
| `--location` | Show file locations for each log | `console-bridge start localhost:3000 --location` |

### Combining Flags

**Headful + Merge + File Output:**
```bash
console-bridge start localhost:3000 --merge-output --no-headless -o debug.log
```

**Headless + Merge + Only Errors:**
```bash
console-bridge start localhost:3000 --merge-output -l error
```

**Headful + File Locations:**
```bash
console-bridge start localhost:3000 --no-headless --location
```

---

## Performance Tips

1. **Use headless mode** (default) for daily development - less resource intensive
2. **Only use headful mode** when actively debugging - browser rendering uses more memory
3. **Filter log levels** (`-l error,warning`) to reduce noise in high-traffic apps
4. **Restart periodically** for long-running sessions (hours) to clear memory
5. **Use file output** (`-o logs.txt`) for very high-volume logging (1000+ logs/second)

---

## Advanced Workflows

### Multiple URLs

Monitor multiple applications simultaneously:
```bash
console-bridge start localhost:3000 localhost:8080 localhost:4000 --merge-output
```

Each URL gets a unique color for easy identification.

### Long-Running Sessions

For sessions lasting hours/days:
```bash
console-bridge start localhost:3000 --merge-output -o "logs-$(date +%Y%m%d).txt"
```

### CI/CD Integration

GitHub Actions example:
```yaml
- name: Start dev server
  run: npm run dev &

- name: Monitor console
  run: console-bridge start localhost:3000 -o test-logs.txt &

- name: Run tests
  run: npm test

- name: Upload logs
  uses: actions/upload-artifact@v3
  with:
    name: console-logs
    path: test-logs.txt
```

---

## Comparison: Which Method Should I Use?

| Scenario | Recommended Method | Why |
|----------|-------------------|-----|
| Daily development | Method 1 (Single Terminal, Headless) | Clean, efficient, single window |
| Debugging layout issues | Method 2 (Single Terminal, Headful) | See browser, interact manually |
| Need manual control | Method 3 (Two Terminals, Headless) | Restart processes independently |
| Debugging + manual control | Method 4 (Two Terminals, Headful) | Separate terminals + visible browser |
| No `concurrently` available | Method 3 or 4 | No dependencies needed |
| Team onboarding | Method 1 | Simplest workflow |
| Production monitoring | Method 1 with file output | Headless + save logs |

---

## Test Results

All methods tested and verified working on **October 6, 2025** with Console Bridge v1.0.0.

**Verified functionality:**
- ✅ All 18 console methods (log, info, warning, error, debug, table, dir, trace, group, groupCollapsed, groupEnd, count, assert, profile, profileEnd, dirxml, clear, timeEnd)
- ✅ Process discovery and attachment
- ✅ Puppeteer auto-click interactions
- ✅ Periodic logging streams
- ✅ Complex data types (objects, arrays, tables)
- ✅ Cross-platform support (Windows verified, macOS/Linux documented)

**Full test results:** [docs/testing/results/2025-10-06-0136-unified-output-testing.md](../testing/results/2025-10-06-0136-unified-output-testing.md)

---

## Related Documentation

- [Getting Started Guide](./getting-started.md)
- [Advanced Usage Guide](./advanced-usage.md)
- [Troubleshooting Guide](./troubleshooting.md)
- [System Architecture](../architecture/system-overview.md)
- [Testing Results](../testing/results/2025-10-06-0136-unified-output-testing.md)

---

**Questions?** Check the [Troubleshooting Guide](./troubleshooting.md) or open an issue on GitHub.
