# Console Bridge v2.0.0 - Chrome Extension POC

**Status:** Proof of Concept
**Version:** 2.0.0-poc
**Purpose:** Validate Chrome DevTools APIs for console capture

---

## Purpose

This POC validates that:
1. Chrome DevTools APIs can capture all console methods
2. Complex objects can be serialized (circular refs, DOM elements, functions)
3. WebSocket connection from extension to CLI is reliable
4. Extension performance is acceptable
5. No blocking API limitations exist

---

## File Structure

```
chrome-extension-poc/
├── manifest.json          # Manifest v3 configuration
├── devtools.html          # DevTools page entry point
├── devtools.js            # Creates DevTools panel
├── panel.html             # Panel UI (shows in DevTools)
├── panel.js               # Console capture logic + WebSocket
├── icons/                 # Extension icons (placeholders)
│   └── README.md
└── README.md             # This file
```

---

## How to Load Extension

### Step 1: Open Chrome Extensions Page

```
chrome://extensions/
```

### Step 2: Enable Developer Mode

Toggle "Developer mode" in the top-right corner

### Step 3: Load Unpacked Extension

1. Click "Load unpacked"
2. Navigate to: `C:/Claude/console-bridge-v2/chrome-extension-poc/`
3. Click "Select Folder"

Extension should now appear in the list!

---

## How to Test POC

### Prerequisites

You need a test page running on localhost. Options:

**Option 1: Simple HTTP Server**
```bash
# Create test page
echo '<html><body><h1>Test Page</h1><script>console.log("Hello from test page!");</script></body></html>' > test.html

# Serve it
npx http-server -p 3000
```

**Option 2: Existing Dev Server**
```bash
# If you have a React/Next.js/Vite app
npm run dev
```

### Testing Steps

**1. Start Test Server**
```bash
# Navigate to a directory with a test page
npx http-server -p 3000
```

**2. Open Test Page in Chrome**
```
http://localhost:3000
```

**3. Open DevTools**
- Press `F12` or `Cmd+Option+I` (Mac) or `Ctrl+Shift+I` (Windows/Linux)

**4. Navigate to Console Bridge Panel**
- Look for "Console Bridge" tab in DevTools (alongside Console, Network, Elements, etc.)
- Click on it

**5. Test Console Events**

In the browser console (Console tab), run:

```javascript
console.log('Test log message');
console.info('Test info message');
console.warn('Test warning');
console.error('Test error');
console.debug('Test debug message');

// Test with objects
console.log({ name: 'John', age: 30, hobbies: ['coding', 'reading'] });

// Test with DOM elements
console.log(document.body);

// Test with functions
function greet(name) { return `Hello, ${name}!`; }
console.log(greet);

// Test with circular reference
const obj = { name: 'Circular' };
obj.self = obj;
console.log(obj);
```

**6. Check Console Bridge Panel**

The "Console Bridge" panel should show:
- Status: Connected (green indicator) or Disconnected (red indicator)
- Server Address: ws://localhost:9223
- Statistics: Events Captured, Messages Sent, Errors

---

## Expected Behavior

### When WebSocket Server is NOT Running

- Status: Disconnected (red)
- Error message: "WebSocket connection failed. Is the CLI running with --extension-mode?"
- Events are still captured (visible in browser console)
- Events are NOT sent (messagesSent stays at 0)

### When WebSocket Server IS Running

- Status: Connected (green)
- Events Captured count increases
- Messages Sent count increases
- Console logs should appear in terminal (if CLI implemented)

---

## Testing Checklist

### Console Method Coverage
- [ ] `console.log()` captured
- [ ] `console.info()` captured
- [ ] `console.warn()` captured
- [ ] `console.error()` captured
- [ ] `console.debug()` captured
- [ ] `console.dir()` captured (if implemented)
- [ ] `console.table()` captured (if implemented)
- [ ] `console.trace()` captured (if implemented)

### Object Serialization
- [ ] Primitive values (strings, numbers, booleans) work
- [ ] Objects serialized correctly
- [ ] Arrays serialized correctly
- [ ] Nested objects work
- [ ] Circular references handled (don't crash)
- [ ] DOM elements serialized with tag/id/class
- [ ] Functions serialized with name

### WebSocket Connection
- [ ] Connection establishes successfully
- [ ] Messages sent in correct JSON format
- [ ] Connection status updates in UI
- [ ] Reconnection works after disconnect
- [ ] Handles server not running gracefully

### Performance
- [ ] No noticeable lag when logging
- [ ] High-frequency logging doesn't freeze browser
- [ ] Memory usage acceptable

### Edge Cases
- [ ] Page navigation preserves extension state
- [ ] Works with DevTools already open
- [ ] Works with other extensions installed (React DevTools, etc.)
- [ ] Multiple tabs don't interfere with each other

---

## Known Limitations (POC)

1. **DevTools must be open** - Chrome DevTools APIs only work when DevTools is open
2. **Simplified console capture** - Uses override approach instead of native event capture
3. **Polling-based** - Uses polling instead of true event listeners (simplified for POC)
4. **Missing icons** - Uses default Chrome icons (no custom icons created)
5. **No CLI implementation yet** - WebSocket server doesn't exist yet (Sprint 4)

---

## Next Steps After POC

### If POC Succeeds:
1. Update ADR with findings and lessons learned
2. Document API capabilities and limitations
3. Create detailed implementation plan for Sprint 2
4. Implement full Chrome extension (Sprint 2-3)
5. Implement CLI WebSocket server (Sprint 4)

### If POC Reveals Issues:
1. Document issues in ADR
2. Evaluate alternative approaches
3. Determine if issues are blockers or workarounds exist
4. Adjust Sprint 2 plan accordingly

---

## Debugging

### Check Extension Logs

1. Go to `chrome://extensions/`
2. Find "Console Bridge POC"
3. Click "Inspect views: devtools.html" (if available)
4. Check console for extension logs (prefixed with `[Console Bridge POC]`)

### Check Panel Logs

1. Open DevTools on your test page
2. Go to "Console Bridge" panel
3. Right-click anywhere in the panel → "Inspect"
4. This opens DevTools-on-DevTools
5. Check console for panel.js logs

### Common Issues

**Extension doesn't appear in DevTools:**
- Make sure extension is enabled in `chrome://extensions/`
- Try reloading the extension
- Make sure you're on a localhost page (extension requires localhost permissions)

**WebSocket connection fails:**
- This is expected! CLI WebSocket server doesn't exist yet (Sprint 4)
- POC still validates console capture and serialization

**Console events not captured:**
- Check browser console for `[Console Bridge POC] Console capture active` message
- Try refreshing the page
- Check DevTools-on-DevTools console for errors

---

## Files Explained

### manifest.json
- Declares extension as Manifest V3
- Requests `devtools` permission only (no scary permissions)
- Sets `devtools_page` to `devtools.html`

### devtools.html / devtools.js
- Entry point for DevTools integration
- Creates new panel using `chrome.devtools.panels.create()`
- Minimal code, just creates the panel

### panel.html
- UI for the Console Bridge panel
- Shows connection status, statistics, instructions
- Dark theme to match DevTools aesthetic

### panel.js
- **Console Capture:** Injects code to override console methods
- **Serialization:** Handles objects, DOM elements, functions, circular refs
- **WebSocket Client:** Connects to `ws://localhost:9223`
- **UI Updates:** Shows connection status and statistics

---

## Architecture

```
┌──────────────────────────────────────┐
│   Localhost Page (http://localhost) │
│   - console.log() overridden         │
│   - Events queued in window object   │
└─────────────┬────────────────────────┘
              │
              │ chrome.devtools.inspectedWindow.eval()
              │ (polls every 100ms)
              ▼
┌──────────────────────────────────────┐
│   Console Bridge Panel (panel.js)   │
│   - Polls for console events         │
│   - Serializes arguments             │
│   - Sends via WebSocket              │
└─────────────┬────────────────────────┘
              │
              │ WebSocket (ws://localhost:9223)
              │ (Currently: connection fails - server not implemented)
              ▼
┌──────────────────────────────────────┐
│   Console Bridge CLI (Future)        │
│   - WebSocket server                 │
│   - Message parser                   │
│   - LogFormatter                     │
│   - Terminal output                  │
└──────────────────────────────────────┘
```

---

**Created:** 2025-10-06
**Status:** Ready for Testing
**Next:** Load extension and validate console capture works
