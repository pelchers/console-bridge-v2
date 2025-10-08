# Screenshot Capture Guide

**Purpose:** Instructions for capturing Chrome Web Store screenshots
**Status:** Ready for capture
**Required:** 5-7 screenshots (1280x800 or 640x400 recommended)

---

## Prerequisites

1. **Extension loaded in Chrome:**
   ```bash
   # 1. Open chrome://extensions
   # 2. Enable "Developer mode"
   # 3. Click "Load unpacked"
   # 4. Select: C:/Claude/console-bridge-v2/chrome-extension-poc/
   ```

2. **CLI running in extension mode:**
   ```bash
   cd C:/Claude/console-bridge-v2
   node bin/console-bridge.js start --extension-mode
   ```

3. **Test application running:**
   ```bash
   # Use any localhost app, or start npm start for test page
   cd C:/Claude/console-bridge-v2
   npm start
   # Opens http://localhost:8080
   ```

4. **Screenshot tool:** Use Windows Snipping Tool, macOS Screenshot, or browser screenshot tool

---

## Screenshot 1: Extension Panel

**File:** `screenshot-1-extension-panel.png`
**Size:** 1280x800 (or 640x400)
**Title:** Console Bridge DevTools Panel

**Steps:**
1. Open Chrome to http://localhost:8080 (or any localhost app)
2. Press F12 to open DevTools
3. Click "Console Bridge" tab in DevTools
4. Ensure status shows "Connected" (green)
5. Let a few console messages flow through to show stats
6. Capture screenshot showing:
   - DevTools with Console Bridge panel visible
   - Connection status: Connected
   - Message count, connection time
   - Clean, professional UI

**What to show:**
- ✅ DevTools open with Console Bridge tab
- ✅ Connection status indicator (green = connected)
- ✅ Statistics (messages sent, connection time, queue size)
- ✅ Professional, clean UI

---

## Screenshot 2: Terminal Output

**File:** `screenshot-2-terminal-output.png`
**Size:** 1280x800 (or 640x400)
**Title:** Real-time Console Logs in Terminal

**Steps:**
1. Ensure CLI is running: `node bin/console-bridge.js start --extension-mode`
2. Open browser with extension to http://localhost:8080
3. Open DevTools → Console Bridge panel
4. Generate various log levels in browser console:
   ```javascript
   console.log('Application started');
   console.info('User logged in');
   console.warn('API rate limit approaching');
   console.error('Connection failed');
   console.debug('Debug info here');
   ```
5. Capture terminal window showing:
   - Colored log output
   - Timestamps
   - Source labels [localhost:8080]
   - Multiple log entries

**What to show:**
- ✅ Terminal with formatted console logs
- ✅ Color-coded log levels (log=blue, warn=yellow, error=red)
- ✅ Timestamps [HH:MM:SS]
- ✅ Source URLs [localhost:8080]
- ✅ Clean formatting

---

## Screenshot 3: Multiple Tabs

**File:** `screenshot-3-multiple-tabs.png`
**Size:** 1280x800 (or 640x400)
**Title:** Monitor Multiple Tabs Simultaneously

**Steps:**
1. CLI running in extension mode
2. Open multiple tabs:
   - Tab 1: http://localhost:8080
   - Tab 2: http://localhost:3000 (or another port)
   - Tab 3: http://localhost:5000 (or another port)
3. In each tab, open DevTools → Console Bridge → Connect
4. Generate logs in each tab with different content
5. Capture terminal showing logs from all sources interleaved

**What to show:**
- ✅ Terminal with logs from multiple sources
- ✅ Different source labels ([localhost:8080], [localhost:3000], [localhost:5000])
- ✅ Mixed log levels from different apps
- ✅ Demonstrates multi-tab monitoring

---

## Screenshot 4: CLI + Extension Setup

**File:** `screenshot-4-setup.png`
**Size:** 1280x800 (or 640x400)
**Title:** Simple Setup: CLI + Extension

**Steps:**
1. Split screen showing both terminal and browser
2. Left side: Terminal with CLI command visible:
   ```
   $ console-bridge start --extension-mode
   WebSocket server listening on ws://localhost:9223
   Waiting for extension connection...
   Extension connected!
   ```
3. Right side: Chrome browser with:
   - Extension loaded (check chrome://extensions)
   - DevTools open with Console Bridge panel
   - Connection status: "Connected"
4. Clean, side-by-side layout

**What to show:**
- ✅ Split screen: Terminal (left) + Chrome (right)
- ✅ CLI command clearly visible
- ✅ Extension panel showing "Connected"
- ✅ Simple, easy-to-understand workflow

---

## Screenshot 5: React DevTools Compatibility

**File:** `screenshot-5-react-devtools.png`
**Size:** 1280x800 (or 640x400)
**Title:** Works with React DevTools & Other Extensions

**Steps:**
1. Install React DevTools extension (if not already installed)
2. Open a React app on localhost (or create simple React app)
3. Open DevTools showing both:
   - React DevTools tab
   - Console Bridge tab
4. Terminal showing React console logs
5. Demonstrates both extensions working simultaneously

**What to show:**
- ✅ DevTools with React DevTools + Console Bridge tabs visible
- ✅ Both extensions active and functional
- ✅ Terminal showing React app console logs
- ✅ Compatibility with other DevTools extensions

**Note:** If React DevTools not available, can substitute with Vue DevTools, Redux DevTools, or any other popular DevTools extension.

---

## Screenshot 6: File Export

**File:** `screenshot-6-file-export.png`
**Size:** 1280x800 (or 640x400)
**Title:** Export Logs to Files

**Steps:**
1. Run CLI with output flag:
   ```bash
   console-bridge start --extension-mode --output logs.txt
   ```
2. Generate several console logs in browser
3. Stop CLI (Ctrl+C)
4. Open logs.txt in text editor
5. Capture split screen:
   - Left: Terminal with --output flag visible
   - Right: Text editor showing exported log file

**What to show:**
- ✅ CLI command with `--output logs.txt` flag
- ✅ Text editor with exported logs
- ✅ Plain text format (no ANSI color codes)
- ✅ Demonstrates file export feature

---

## Screenshot 7: Error Monitoring

**File:** `screenshot-7-error-monitoring.png`
**Size:** 1280x800 (or 640x400)
**Title:** Catch Frontend Errors Instantly

**Steps:**
1. CLI running in extension mode
2. In browser console, generate errors:
   ```javascript
   console.error('Network request failed', { status: 500, url: '/api/users' });
   console.error(new Error('Uncaught TypeError: Cannot read property of undefined'));
   console.warn('Deprecated API usage detected');
   ```
3. Capture terminal showing:
   - Error logs highlighted (red)
   - Error objects formatted
   - Stack traces (if available)
   - Professional error formatting

**What to show:**
- ✅ Terminal with error logs prominently displayed
- ✅ Red color highlighting for errors
- ✅ Error objects pretty-printed
- ✅ Demonstrates real-time error monitoring

---

## Tips for Great Screenshots

### Composition
- Use high resolution (1280x800 recommended, minimum 640x400)
- Clean workspace (close unnecessary tabs/windows)
- Professional appearance (tidy terminal, clean browser UI)
- Good lighting if capturing physical screen

### Content
- Real logs (not placeholder text)
- Realistic use cases
- Clear, readable text
- Professional color scheme (use dark terminal themes or standard themes)

### Annotations (Optional)
- Use arrows to highlight key features
- Add captions to explain functionality
- Maintain consistent style across screenshots
- Don't overload with annotations

### File Format
- PNG format (lossless, best for UI screenshots)
- Optimized file size (<2MB per screenshot)
- Consistent dimensions across screenshots

---

## Storage

**Recommended location:**
```
chrome-extension-poc/screenshots/
├── screenshot-1-extension-panel.png
├── screenshot-2-terminal-output.png
├── screenshot-3-multiple-tabs.png
├── screenshot-4-setup.png
├── screenshot-5-react-devtools.png
├── screenshot-6-file-export.png
└── screenshot-7-error-monitoring.png
```

**Upload to Chrome Web Store:**
- Screenshots section in store listing
- Upload all 7 screenshots
- Add titles and descriptions for each
- Ensure screenshots meet size requirements

---

## Checklist

After capturing screenshots:
- [ ] All 7 screenshots captured
- [ ] File sizes < 2MB each
- [ ] Dimensions: 1280x800 or 640x400
- [ ] PNG format
- [ ] Clear, readable text
- [ ] Professional appearance
- [ ] Realistic use cases shown
- [ ] No sensitive information visible
- [ ] Saved to chrome-extension-poc/screenshots/
- [ ] Ready for Chrome Web Store upload

---

**Status:** Documentation complete, ready for manual screenshot capture
**Estimated Time:** 30-60 minutes
**Tools Needed:** Browser, CLI, screenshot tool, (optional) image editor
