# Troubleshooting Guide

This guide helps you diagnose and fix common issues with Console Bridge.

## Table of Contents
- [Common Issues](#common-issues)
- [Error Messages](#error-messages)
- [Performance Issues](#performance-issues)
- [Advanced Debugging](#advanced-debugging)

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

**Common Misunderstanding:**
Console Bridge runs its **own browser** (Puppeteer). It doesn't capture logs from your personal Chrome browser.

**Solutions:**

#### A. Understand the Architecture
```
Your Chrome Browser (localhost:3000)
  ❌ NOT monitored by Console Bridge

Puppeteer Browser (localhost:3000)
  ✅ Monitored by Console Bridge
```

Console Bridge launches a Puppeteer browser in the background. Logs from that browser appear in your terminal.

---

#### B. Using Headful Mode for Manual Testing
If you need to manually click buttons in the Puppeteer browser:

```bash
# Show the Puppeteer browser window
console-bridge start localhost:3000 --no-headless
```

Now you can:
1. See the Puppeteer browser window
2. Click buttons in that window
3. See logs in your terminal

**Important:** Headful mode is only for debugging. Normal usage doesn't require it.

---

#### C. Automated Testing Solution
For real development, trigger logs programmatically:

```javascript
// Auto-click for testing
useEffect(() => {
  setTimeout(() => {
    document.querySelector('#my-button')?.click();
  }, 2000);
}, []);
```

This ensures Console Bridge captures the clicks without manual interaction.

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
