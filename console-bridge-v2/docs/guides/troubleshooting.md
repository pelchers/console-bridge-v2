# Troubleshooting Guide

This guide helps you diagnose and fix common issues with Console Bridge.

## Table of Contents
- [Critical Limitation (v1.0.0)](#critical-limitation-v100)
- [Common Issues](#common-issues)
- [Merge Output Issues](#merge-output-issues)
- [Error Messages](#error-messages)
- [Performance Issues](#performance-issues)
- [Advanced Debugging](#advanced-debugging)

---

## ✅ v2.0.0 Extension Mode (SOLVED)

**This limitation is SOLVED in v2.0.0 Extension Mode!**

Use Extension Mode to monitor your personal Chrome/Firefox/Safari browser:
```bash
console-bridge start --extension-mode
```

See [v2.0.0-spec/clarifications.md](../v2.0.0-spec/clarifications.md) for complete documentation.

---

## v1.0.0 Puppeteer Mode Limitation (For Reference)

**⚠️ Console Bridge v1.0.0 ONLY monitors the Puppeteer-controlled Chromium browser.**

This is the most common source of confusion and "bug reports" that are actually expected behavior.

### The Limitation Explained

**What DOESN'T work:**
```
1. User starts Console Bridge in headless mode
2. User opens THEIR Chrome browser and visits localhost:3000
3. User clicks buttons in THEIR Chrome browser
4. User expects console logs to appear in terminal

Result: ❌ No logs appear (this is NOT a bug)
Reason: Console Bridge only monitors Puppeteer browser, not personal Chrome
```

**What DOES work:**
```
1. User starts Console Bridge in headful mode (--no-headless)
2. Puppeteer opens its own Chromium window showing localhost:3000
3. User clicks buttons in PUPPETEER Chromium window
4. Console logs appear in terminal

Result: ✅ Logs appear correctly
Reason: User is interacting with the Puppeteer browser being monitored
```

### Common Misconceptions

**Misconception #1:** "Headless means the site's frontend is hidden"
- **Reality:** "Headless" means the browser window is hidden, not your site

**Misconception #2:** "I can use my Chrome browser with Console Bridge headless mode"
- **Reality:** You must interact with the Puppeteer browser (use `--no-headless` to see it)

**Misconception #3:** "This is a bug - Console Bridge should monitor all browsers"
- **Reality:** This is a v1.0.0 architectural limitation. v2.0.0 will support personal browsers via browser extension.

### When to Use Console Bridge v1.0.0

**✅ Ideal for:**
- CI/CD pipelines and automated testing
- AI-assisted development workflows
- Debugging with Puppeteer headful mode
- Scenarios where browser extensions aren't needed

**❌ NOT ideal for:**
- Testing with personal Chrome/Firefox/Safari browsers
- Using browser extensions (React DevTools, Vue DevTools)
- Cross-browser compatibility testing

### For More Information

- [REQUIREMENTS.md](../REQUIREMENTS.md) - Complete v1.0.0 requirements and limitations
- [Headless Implications](../explainer/headless-implications.md) - In-depth explanation

**v2.0.0 (planned Q1 2026) will solve this with browser extension support.**

---

## Common Issues

### 1. "No console output appearing"

**Symptoms:**
- Console Bridge starts successfully
- No logs appear in terminal
- Your app is running and generating console logs

**Possible Causes & Solutions:**

#### A. Wrong URL or Port
```bash
# ❌ Wrong port
console-bridge start localhost:3000  # But app is on :3001

# ✅ Correct
console-bridge start localhost:3001  # Match your dev server port
```

**How to verify:**
1. Check your dev server output for the port number
2. Open your browser and confirm the URL works
3. Use the exact same URL with Console Bridge

---

#### B. Protocol Mismatch
```bash
# ❌ Don't use http:// or https://
console-bridge start http://localhost:3000

# ✅ Just use the hostname and port
console-bridge start localhost:3000
```

Console Bridge automatically adds `http://` prefix.

---

#### C. Console Logs Before Page Load
If your console logs fire before the page fully loads, Console Bridge might miss them.

**Solution:** Add a small delay to your initial logs:
```javascript
// ❌ May be missed
console.log('App starting...');

// ✅ Better
setTimeout(() => {
  console.log('App started!');
}, 100);
```

---

#### D. Using Production Build
Console logs are often stripped in production builds.

**Solution:** Use development mode:
```bash
# React/Vite
npm run dev

# Next.js
next dev

# Then start Console Bridge
console-bridge start localhost:3000
```

---

### 2. "Button clicks not captured"

**Symptoms:**
- Initial logs work
- Periodic logs work
- Button click logs don't appear

**Cause:** You're clicking buttons in your personal Chrome browser, not the Puppeteer browser.

**Solution:** See [Critical Limitation (v1.0.0)](#critical-limitation-v100) above for complete explanation.

**Quick fix:**
```bash
# Use headful mode to see and interact with Puppeteer browser
console-bridge start localhost:3000 --no-headless
```

Then click buttons in the **Puppeteer Chromium window** (not your Chrome browser).

---

### 3. "Logs appear but are cut off or incomplete"

**Symptoms:**
- Complex objects show as `[Object]`
- Arrays show as `JSHandle@array`
- Stack traces are missing

**Solution:** This is a known limitation with certain console types. We're working on improved serialization.

**Workaround:** Use `JSON.stringify()` for complex objects:
```javascript
// ❌ May not serialize properly
console.log(complexObject);

// ✅ Better
console.log(JSON.stringify(complexObject, null, 2));
```

---

### 4. "Console Bridge crashes on start"

**Symptoms:**
```
Error: Failed to launch browser
```

**Possible Causes:**

#### A. Puppeteer Installation Issues
```bash
# Reinstall Puppeteer
npm uninstall puppeteer
npm install puppeteer

# Or globally
npm uninstall -g @yourorg/console-bridge
npm install -g @yourorg/console-bridge
```

---

#### B. Missing Dependencies (Linux)
On Linux, Puppeteer requires additional system libraries:

```bash
# Debian/Ubuntu
sudo apt-get install -y \
  ca-certificates \
  fonts-liberation \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libc6 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgbm1 \
  libgcc1 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libstdc++6 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  lsb-release \
  wget \
  xdg-utils
```

---

#### C. Port Already in Use
If another Puppeteer instance is running:

```bash
# Kill existing Puppeteer processes
pkill -f chrome
pkill -f puppeteer

# Then restart Console Bridge
console-bridge start localhost:3000
```

---

### 5. "Logs out of sync after page refresh"

**Symptoms:**
- Initial logs work
- After hot reload, timestamps don't match
- Duplicate logs appear

**Cause:** React Fast Refresh or SPA navigation changed the page context.

**Solution:** This is automatically handled by the `framenavigated` listener. If you still see issues:

1. Stop Console Bridge (`Ctrl+C`)
2. Refresh your app manually
3. Restart Console Bridge
4. Verify logs are in sync

---

### 6. "Too many logs flooding terminal"

**Symptoms:**
- Overwhelming amount of logs
- Terminal becomes unresponsive

**Solutions:**

#### A. Filter by Log Level
```bash
# Only show errors and warnings
console-bridge start localhost:3000 -l error,warning

# Only show errors
console-bridge start localhost:3000 -l error
```

---

#### B. Save to File Instead
```bash
# Stream to file, check later
console-bridge start localhost:3000 -o logs.txt

# Then view filtered
grep "error" logs.txt
```

---

#### C. Reduce Logging in Code
```javascript
// ❌ Too many logs
setInterval(() => {
  console.log('Still alive...'); // Every second!
}, 1000);

// ✅ Better
setInterval(() => {
  console.log('Health check');
}, 30000); // Every 30 seconds
```

---

## Merge Output Issues

Issues specific to the `--merge-output` flag for unified terminal output.

### 1. "No process found listening on port"

**Symptom:**
```
ℹ️  No process found listening on port 3000. Using separate terminal.
```

**Causes & Solutions:**

#### A. Dev Server Not Running Yet
The most common cause - Console Bridge starts before the dev server.

**Solution:** Use `concurrently` to start both at the same time:
```json
{
  "scripts": {
    "dev": "next dev",
    "dev:debug": "concurrently \"npm run dev\" \"console-bridge start localhost:3000 --merge-output\""
  }
}
```

`concurrently` handles timing automatically.

---

#### B. Wrong Port Number
Console Bridge is looking at the wrong port.

**Solution:** Verify the dev server port:
```bash
# Check what port your dev server is using
npm run dev
# Output: "ready - started server on 0.0.0.0:3000, url: http://localhost:3000"

# Use the exact port with Console Bridge
console-bridge start localhost:3000 --merge-output
```

---

#### C. Platform-Specific Commands Failed
Process discovery uses platform-specific commands (`netstat` on Windows, `lsof` on Unix).

**Solution (Windows):** Ensure `netstat` and `tasklist` are available:
```bash
netstat -ano | findstr :3000  # Should show process
tasklist | findstr PID        # Should show node.exe
```

**Solution (macOS/Linux):** Ensure `lsof` is installed:
```bash
# macOS
brew install lsof

# Ubuntu/Debian
sudo apt-get install lsof

# Test it
lsof -t -i :3000  # Should return PID
```

---

### 2. "Permission denied to access process"

**Symptom:**
```
ℹ️  Permission denied to access process 12345. Using separate terminal.
```

**Cause:** Process is owned by a different user.

**Solutions:**

#### A. Run as Same User
Ensure both dev server and Console Bridge run as the same user:
```bash
# Check current user
whoami

# Run dev server as same user
npm run dev

# Run Console Bridge as same user
console-bridge start localhost:3000 --merge-output
```

---

#### B. Use Sudo (Not Recommended)
```bash
sudo console-bridge start localhost:3000 --merge-output
```

**Warning:** This gives Console Bridge elevated permissions. Only use if necessary.

---

#### C. Accept the Fallback
The "Using separate terminal" fallback works fine - you'll still see all logs, just in a separate output stream.

```bash
# This works without attachment
console-bridge start localhost:3000 --merge-output
# Logs appear normally, just not merged with dev server
```

---

### 3. "Not seeing merged output"

**Symptoms:**
- `--merge-output` flag is used
- No error messages
- Logs appear in separate terminal

**Causes & Solutions:**

#### A. Running in Separate Terminals
Unified terminal only works when both processes share the same terminal.

**Wrong:**
```bash
# Terminal 1
npm run dev

# Terminal 2
console-bridge start localhost:3000 --merge-output
```

**Right:**
```bash
# Single terminal with concurrently
npm run dev:debug
```

Where `dev:debug` is:
```json
"dev:debug": "concurrently \"npm run dev\" \"console-bridge start localhost:3000 --merge-output\""
```

---

#### B. Multiple URLs
Only the first URL gets terminal attachment.

```bash
console-bridge start localhost:3000 localhost:8080 --merge-output
# Only localhost:3000 is attached
# localhost:8080 uses separate output
```

**Solution:** This is intentional. To merge multiple dev servers, run separate Console Bridge instances.

---

### 4. "lsof not found" (Unix only)

**Symptom:**
```
ℹ️  Failed to attach: lsof not found. Using separate terminal.
```

**Cause:** `lsof` command is not installed (required for Unix process discovery).

**Solutions:**

**macOS:**
```bash
# Install with Homebrew
brew install lsof

# Verify
lsof -v
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install lsof

# Verify
lsof -v
```

**Linux (Fedora/RHEL):**
```bash
sudo yum install lsof

# Verify
lsof -v
```

---

### 5. "Attachment succeeded but logs still separate"

**Symptom:**
```
✓ Successfully attached to process 12345 (node.exe) on port 3000
```
But logs still appear in separate output.

**Causes:**

#### A. Technical Limitation
Current implementation writes to `process.stdout`, not the target process's stdout. This works when both processes share the same terminal (Scenario 2 with `concurrently`), but not across different terminals.

**Expected Behavior:**
- ✅ Works: `concurrently` running both processes
- ❌ Doesn't work: Two separate terminal windows

**Solution:** Use `concurrently` as documented in [Getting Started](./getting-started.md#unified-terminal-workflow-recommended).

---

#### B. Dev Server Using Different Output Stream
Some dev servers write to stderr instead of stdout.

**Solution:** This is automatically handled. If you still see issues, the graceful fallback ensures logs still appear.

---

### 6. Debugging Process Discovery

To manually test process discovery:

**Windows:**
```bash
# Find process on port 3000
netstat -ano | findstr :3000

# Example output:
#   TCP    0.0.0.0:3000    0.0.0.0:0    LISTENING    12345

# Verify process exists
tasklist | findstr 12345

# Example output:
#   node.exe    12345 Console    1    50,000 K
```

**macOS/Linux:**
```bash
# Find process on port 3000
lsof -t -i :3000

# Example output:
#   12345

# Verify process exists
ps -p 12345

# Example output:
#   PID   TTY      TIME CMD
#   12345 ttys001  0:05.23 node
```

If these commands fail, Console Bridge will also fail to attach (but gracefully falls back).

---

### Quick Checklist for --merge-output

Before reporting issues with `--merge-output`:

- [ ] Using `concurrently` to run both dev server and Console Bridge
- [ ] Dev server is running BEFORE Console Bridge attempts attachment
- [ ] Using correct port number (check dev server output)
- [ ] `lsof` is installed (macOS/Linux only): `which lsof`
- [ ] Running as same user for both processes
- [ ] Not running in separate terminal windows
- [ ] Checked for "Successfully attached" success message
- [ ] Checked for "Using separate terminal" fallback message
- [ ] Reviewed graceful fallback behavior in logs

**Remember:** The graceful fallback ensures Console Bridge works even if attachment fails. You'll still see all logs, just in separate output.

---

## Error Messages

### `Error: Navigation failed`

**Full error:**
```
Error: Failed to add URL http://localhost:3000: Navigation failed
```

**Causes:**
1. Dev server not running
2. Wrong port number
3. App crashed during load

**Solution:**
```bash
# 1. Verify dev server is running
curl http://localhost:3000  # Should return HTML

# 2. Check dev server logs for errors

# 3. Try manual browser test
# Open http://localhost:3000 in Chrome - does it load?

# 4. Restart both dev server and Console Bridge
```

---

### `Error: Target closed`

**Full error:**
```
Error: Protocol error: Target closed
```

**Cause:** Browser tab/page closed unexpectedly

**Solution:**
1. Stop Console Bridge
2. Clear Puppeteer cache:
```bash
rm -rf ~/.cache/puppeteer  # Linux/Mac
del /s /q %USERPROFILE%\.cache\puppeteer  # Windows
```
3. Restart Console Bridge

---

### `ECONNREFUSED`

**Full error:**
```
Error: connect ECONNREFUSED 127.0.0.1:3000
```

**Cause:** Development server is not running on that port

**Solution:**
```bash
# 1. Start your dev server FIRST
npm run dev

# Wait for "ready" message showing port

# 2. Then start Console Bridge with correct port
console-bridge start localhost:3000
```

---

## Performance Issues

### Console Bridge is slow to start

**Symptom:** Takes 10+ seconds to start monitoring

**Causes & Solutions:**

1. **Slow page load:** Your app takes time to load
   ```bash
   # Increase timeout (default 30s)
   # Note: This is not exposed as CLI option yet, but used internally
   ```

2. **Heavy dependencies:** Large app bundles
   - Use development build (faster)
   - Enable code splitting
   - Optimize bundle size

---

### High memory usage

**Symptom:** Console Bridge consuming lots of RAM

**Causes:**
- Monitoring too many URLs
- Long-running sessions with thousands of logs

**Solutions:**
```bash
# Monitor fewer URLs
console-bridge start localhost:3000  # Not 10 URLs at once

# Restart Console Bridge periodically
# (Ctrl+C and restart every few hours)

# Save logs to file instead of terminal
console-bridge start localhost:3000 -o logs.txt
```

---

## Advanced Debugging

### Enable Verbose Logging

Set environment variable for debug output:

```bash
# Bash/Zsh
DEBUG=console-bridge:* console-bridge start localhost:3000

# Windows CMD
set DEBUG=console-bridge:* && console-bridge start localhost:3000

# PowerShell
$env:DEBUG="console-bridge:*"; console-bridge start localhost:3000
```

---

### Inspect Puppeteer Browser

Run in headful mode to see what Puppeteer sees:

```bash
console-bridge start localhost:3000 --no-headless
```

This opens a visible Chrome window showing the exact page Puppeteer is monitoring.

---

### Check Console Bridge Version

```bash
console-bridge --version
```

Ensure you're on the latest version:
```bash
npm update -g @yourorg/console-bridge
```

---

### Report Issues

If you've tried everything and still have issues:

1. **Gather information:**
   - Console Bridge version (`console-bridge --version`)
   - Node.js version (`node --version`)
   - Operating system
   - Error messages (full text)
   - Steps to reproduce

2. **Open an issue:**
   - [GitHub Issues](https://github.com/yourorg/console-bridge/issues)
   - Include all information from step 1
   - Provide minimal reproduction example if possible

---

## Quick Diagnostic Checklist

Before reporting an issue, verify:

- [ ] Dev server is running (`curl localhost:PORT` returns HTML)
- [ ] Using correct port number
- [ ] Not using `http://` prefix in URL
- [ ] Console Bridge version is latest (`npm update -g @yourorg/console-bridge`)
- [ ] Puppeteer installed correctly (`npm list puppeteer`)
- [ ] No conflicting Puppeteer processes (`pkill chrome`)
- [ ] Tried headful mode (`--no-headless`) to see browser
- [ ] Checked error logs in terminal
- [ ] Restarted both dev server and Console Bridge

---

**Still stuck?** Check [Advanced Usage Guide](./advanced-usage.md) or [ask for help](https://github.com/yourorg/console-bridge/discussions).
