# Migration Guide: v1.0.0 → v2.0.0

**Version:** 2.0.0
**Last Updated:** October 8, 2025
**Audience:** Users upgrading from Console Bridge v1.0.0

---

## Quick Summary

**Good News:** v2.0.0 is **100% backward compatible** with v1.0.0!

✅ All v1 commands work identically in v2
✅ No breaking changes
✅ No code changes required
✅ Optional: Use new Extension Mode for personal Chrome monitoring

**Migration Time:** 0 minutes (backward compatible) + 5 minutes (optional extension setup)

---

## What's New in v2.0.0?

v2.0.0 adds **Extension Mode** - a new way to monitor console logs from your **personal Chrome browser**.

### v1.0.0 (Puppeteer Mode Only)

```bash
console-bridge start localhost:3000
```

- ✅ Launches Puppeteer browser
- ✅ Monitors console logs
- ❌ Can't use YOUR Chrome
- ❌ Can't use browser extensions (React DevTools, etc.)

### v2.0.0 (Dual-Mode: Puppeteer + Extension)

**Puppeteer Mode (100% v1 compatible):**
```bash
console-bridge start localhost:3000
# Works exactly like v1.0.0
```

**Extension Mode (NEW in v2.0.0):**
```bash
console-bridge start --extension-mode
# Monitors YOUR Chrome browser!
```

- ✅ Use YOUR daily Chrome browser
- ✅ Use browser extensions (React DevTools, Redux DevTools, etc.)
- ✅ Monitor multiple tabs
- ✅ Connection status UI
- ✅ Advanced object serialization

---

## Migration Steps

### Step 1: Upgrade Package

```bash
npm install -g console-bridge@2.0.0
```

or for local install:

```bash
npm install console-bridge@2.0.0
```

### Step 2: Verify Compatibility

All v1 commands work in v2:

```bash
# v1.0.0 command (still works!)
console-bridge start localhost:3000 --output logs.txt --levels error,warn

# v2.0.0 - same command, same behavior
console-bridge start localhost:3000 --output logs.txt --levels error,warn
```

**No changes required!** ✅

### Step 3: (Optional) Try Extension Mode

If you want to monitor your personal Chrome:

1. **Install Chrome extension:**
   - Visit Chrome Web Store: [Console Bridge Extension](https://chrome.google.com/webstore) (coming soon)
   - Or load unpacked for development (see [Extension Installation Guide](#extension-installation-development))

2. **Start CLI in extension mode:**
   ```bash
   console-bridge start --extension-mode
   ```

3. **Use YOUR Chrome:**
   - Open http://localhost:3000 in YOUR Chrome
   - Open DevTools (F12)
   - Click "Console Bridge" tab
   - Console logs stream to terminal!

---

## Breaking Changes

**None!** v2.0.0 has zero breaking changes.

### Restored in v2.0.0

- **`--merge-output` flag** - Merge Console Bridge output into dev server terminal
  - Works with both Puppeteer and Extension modes
  - Cross-platform support (Windows, macOS, Linux)
  - Graceful fallback when process not found
  - Use with `concurrently` for unified terminal workflow

**Example:**
```bash
npx concurrently "npm run dev" "console-bridge start localhost:3000 --merge-output"
```

All v1 flags work identically in v2.

---

## CLI Flag Compatibility

### All v1 Flags Supported

| Flag | v1.0.0 | v2.0.0 Puppeteer Mode | v2.0.0 Extension Mode |
|------|--------|----------------------|---------------------|
| `--output <file>` | ✅ | ✅ | ✅ |
| `--levels <levels>` | ✅ | ✅ | ⚠️ Not yet implemented |
| `--no-headless` | ✅ | ✅ | N/A (user controls browser) |
| `--max-instances <n>` | ✅ | ✅ | N/A (user controls tabs) |
| `--no-timestamp` | ✅ | ✅ | ✅ |
| `--no-source` | ✅ | ✅ | ✅ |
| `--location` | ✅ | ✅ | ✅ |
| `--timestamp-format <fmt>` | ✅ | ✅ | ✅ |

**Note:** Some flags don't apply to Extension Mode because the user controls their own browser (e.g., `--no-headless`, `--max-instances`).

---

## Use Case Migration

### 1. CI/CD Automated Testing

**v1.0.0:**
```bash
# Start console bridge in background
console-bridge start localhost:3000 --output ci-logs.txt &
PID=$!

# Run tests
npm run test:e2e

# Stop console bridge
kill $PID
```

**v2.0.0 (No Changes Required):**
```bash
# Same command works identically
console-bridge start localhost:3000 --output ci-logs.txt &
PID=$!

npm run test:e2e

kill $PID
```

✅ **Recommendation:** Continue using Puppeteer mode for CI/CD.

---

### 2. Manual Development

**v1.0.0:**
```bash
# Launch Puppeteer browser
console-bridge start localhost:3000 --no-headless

# Must use Puppeteer's Chromium
# Can't use personal Chrome
# Can't use React DevTools
```

**v2.0.0 (NEW: Extension Mode):**
```bash
# Start CLI in extension mode
console-bridge start --extension-mode

# Then: Open YOUR Chrome
# - Navigate to localhost:3000
# - Open DevTools (F12)
# - Click "Console Bridge" tab
# - Use React DevTools, Redux DevTools, etc.!
```

✅ **Recommendation:** Switch to Extension Mode for daily development.

---

### 3. Multi-Instance Monitoring

**v1.0.0:**
```bash
# Monitor frontend + backend
console-bridge start localhost:3000 localhost:8080

# Launches 2 Puppeteer browsers
```

**v2.0.0 Puppeteer Mode (Same):**
```bash
# Works identically
console-bridge start localhost:3000 localhost:8080
```

**v2.0.0 Extension Mode (NEW: Multiple Tabs):**
```bash
# Start CLI
console-bridge start --extension-mode

# Then: Open multiple tabs in YOUR Chrome
# Tab 1: localhost:3000 (frontend)
# Tab 2: localhost:8080 (backend)
# Tab 3: localhost:5000 (API server)

# All 3 tabs stream to same terminal!
```

✅ **Recommendation:** Extension Mode for manual multi-tab monitoring.

---

## Code Changes Required

**None!**

v2.0.0 is purely a CLI upgrade. No code changes required in your application.

---

## Feature Comparison

| Feature | v1.0.0 | v2.0.0 Puppeteer | v2.0.0 Extension |
|---------|--------|-----------------|-----------------|
| Console log streaming | ✅ | ✅ | ✅ |
| Color-coded output | ✅ | ✅ | ✅ |
| Timestamps | ✅ | ✅ | ✅ |
| Source URLs | ✅ | ✅ | ✅ |
| File export | ✅ | ✅ | ✅ |
| Log filtering | ✅ | ✅ | ⚠️ Planned |
| Multi-instance | ✅ | ✅ | ✅ |
| **Monitor personal Chrome** | ❌ | ❌ | ✅ **NEW** |
| **Browser extensions** | ❌ | ❌ | ✅ **NEW** |
| **Advanced serialization** | Basic | Basic | ✅ **NEW** |
| **Message queuing** | ❌ | ❌ | ✅ **NEW** |
| **Auto-reconnect** | ❌ | ❌ | ✅ **NEW** |

---

## Extension Installation (Development)

If Chrome Web Store listing isn't available yet, load extension manually:

### 1. Clone Repository

```bash
git clone https://github.com/pelchers/console-bridge-v2.git
cd console-bridge-v2/chrome-extension-poc
```

### 2. Load Extension in Chrome

1. Open Chrome
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode" (top-right toggle)
4. Click "Load unpacked"
5. Select `chrome-extension-poc/` directory
6. Extension installed! ✅

### 3. Verify Installation

1. Open Chrome DevTools (F12) on any localhost page
2. Look for "Console Bridge" tab
3. If you see the tab, extension is installed correctly!

---

## When to Use Which Mode?

### Use Puppeteer Mode (v1 Compatible) When:

✅ **CI/CD automated testing**
✅ **Scripted browser automation**
✅ **Headless server monitoring**
✅ **Integration testing**
✅ **Reproducible test environments**

**Command:**
```bash
console-bridge start localhost:3000 [options]
```

---

### Use Extension Mode (v2 NEW) When:

✅ **Manual development**
✅ **Debugging with React DevTools, Redux DevTools, etc.**
✅ **Working in your daily Chrome browser**
✅ **Monitoring multiple personal Chrome tabs**
✅ **Testing browser extensions compatibility**

**Command:**
```bash
console-bridge start --extension-mode
```

---

## Troubleshooting Migration

### "Command not found: console-bridge"

**Solution:**
```bash
npm install -g console-bridge@2.0.0
```

Verify installation:
```bash
console-bridge --version
# Should show: 2.0.0
```

---

### "Extension not appearing in DevTools"

**Solution:**

1. **Verify extension installed:**
   - Go to `chrome://extensions/`
   - Look for "Console Bridge" extension
   - Ensure it's enabled

2. **Verify localhost only:**
   - Extension only works on localhost/127.0.0.1
   - Does NOT work on production domains (by design)

3. **Refresh extension:**
   - Go to `chrome://extensions/`
   - Click reload icon on Console Bridge extension
   - Refresh DevTools (close and reopen)

---

### "Connection failed: CLI not running"

**Solution:**

Extension mode requires CLI to be running:

```bash
# Start CLI in extension mode
console-bridge start --extension-mode

# Then: Open Chrome DevTools
# The extension will connect to CLI on ws://localhost:9223
```

Connection status shown in DevTools panel UI.

---

### "v1 command fails in v2"

**This should not happen!** v2.0.0 is 100% backward compatible.

If you encounter issues:

1. **Verify version:**
   ```bash
   console-bridge --version  # Should be 2.0.0
   ```

2. **Report bug:**
   - GitHub: https://github.com/pelchers/console-bridge-v2/issues
   - Include: v1 command, error message, environment details

---

## Performance Considerations

### v1.0.0 Performance

- Startup: ~2-3 seconds (launch Chromium)
- Memory: ~100-150 MB per browser
- Latency: <10ms (CDP in-process)

### v2.0.0 Puppeteer Mode

- **Same as v1.0.0** (identical performance)

### v2.0.0 Extension Mode

- Startup: ~500ms (WebSocket server only)
- Memory: ~5-10 MB (no browser launch)
- Latency: <50ms (WebSocket localhost)

**Extension Mode is 10-20x lighter than Puppeteer mode** (no browser launch).

---

## FAQ

### Q: Do I need to change my v1 commands?

**A:** No! All v1 commands work identically in v2.

---

### Q: Can I use v1 and v2 at the same time?

**A:** No. v2 replaces v1. Uninstall v1, then install v2:

```bash
npm uninstall -g console-bridge  # Remove v1
npm install -g console-bridge@2.0.0  # Install v2
```

---

### Q: What if I only use Puppeteer mode (never use Extension mode)?

**A:** That's fine! v2 = v1 + Extension Mode. If you only use Puppeteer mode, v2 behaves exactly like v1.

---

### Q: Will v1 still be maintained?

**A:** No. v1 is deprecated as of v2.0.0 release. All future development happens in v2.

However, v2 maintains 100% v1 compatibility, so migrating is risk-free.

---

### Q: Can I use Extension Mode in production?

**A:** No. Extension Mode only monitors localhost/127.0.0.1 (by design, for security).

Use Puppeteer mode for production monitoring.

---

### Q: How do I know which mode is running?

**CLI Output:**

**Puppeteer Mode:**
```
Console Bridge v2.0.0
Launching browser for localhost:3000...
Browser launched successfully
Monitoring console logs...
```

**Extension Mode:**
```
Console Bridge v2.0.0 - Extension Mode
WebSocket server listening on ws://localhost:9223
Waiting for extension connections...
✓ Extension connected (Tab 12345: http://localhost:3000)
```

---

## Additional Resources

- **Full Comparison:** [v1 to v2 Comparison](../.claude/versions/comparison/v1-to-v2.md)
- **Extension Usage Guide:** [USAGE.md - Extension Mode](./USAGE.md#extension-mode-v2-new)
- **API Documentation:** [API.md](./API.md)
- **Troubleshooting:** [USAGE.md - Troubleshooting](./USAGE.md#troubleshooting)
- **GitHub Issues:** https://github.com/pelchers/console-bridge-v2/issues

---

## Support

**Questions?**
- GitHub Discussions: https://github.com/pelchers/console-bridge-v2/discussions
- GitHub Issues (bugs): https://github.com/pelchers/console-bridge-v2/issues

**Found a bug?**
- File issue: https://github.com/pelchers/console-bridge-v2/issues/new

---

**Migration Guide Version:** 1.0
**Last Updated:** October 8, 2025
**Status:** ✅ Complete
