# Console Bridge - Chrome Extension

**Version:** 2.0.0
**Status:** Production Ready - Ready for Chrome Web Store submission

Stream browser console logs from localhost development servers directly to your terminal.

---

## 🚀 Quick Start

### Prerequisites

1. **Install Console Bridge CLI:**
   ```bash
   npm install -g console-bridge
   ```

2. **Install Chrome Extension:**

   **Option A: Chrome Web Store (Recommended - Coming Soon)**
   - Visit [Chrome Web Store link - TBD]
   - Click "Add to Chrome"

   **Option B: Developer Mode (Current)**
   - Clone this repository
   - Open Chrome → `chrome://extensions`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select `console-bridge-v2/chrome-extension-poc/` directory

### Usage

1. **Start CLI in extension mode:**
   ```bash
   console-bridge start --extension-mode
   ```

2. **Open DevTools on any localhost page:**
   - Navigate to `http://localhost:3000` (or any localhost URL)
   - Open Chrome DevTools (F12 or Ctrl+Shift+I)
   - Click on "Console Bridge" tab

3. **See console logs in terminal!**
   - Console logs from the browser appear in your terminal in real-time
   - Supports multiple tabs simultaneously

---

## ✨ Features

- **Real-time streaming:** Console logs appear instantly in terminal
- **Multi-tab support:** Monitor multiple localhost tabs at once
- **Color-coded output:** Logs styled by level (log, warn, error, etc.)
- **Source labeling:** See which tab/URL each log comes from
- **Timestamps:** Optional timestamp display
- **Localhost-only:** Secure by design - only monitors localhost
- **No data collection:** Zero analytics, zero tracking

---

## 🔒 Privacy & Security

**Console Bridge is localhost-only and collects ZERO data.**

- ✅ Only monitors localhost and 127.0.0.1
- ✅ All data stays on your machine
- ✅ No external connections
- ✅ No analytics or tracking
- ✅ 100% open source

See [PRIVACY_POLICY.md](./PRIVACY_POLICY.md) for complete privacy details.

---

## 📂 Extension Files

```
chrome-extension-poc/
├── manifest.json           # Extension manifest (Manifest V3)
├── devtools.html          # DevTools page entry point
├── devtools.js            # DevTools initialization
├── panel.html             # Console Bridge panel UI
├── panel.js               # Panel logic & WebSocket client
├── icons/                 # Extension icons (16px, 48px, 128px)
├── README.md              # This file
├── PRIVACY_POLICY.md      # Privacy policy
├── CHROME_WEB_STORE_LISTING.md  # Store listing content
└── ICONS_NEEDED.md        # Icon design guide
```

---

## 🛠️ Technical Details

### WebSocket Protocol

The extension communicates with the CLI via WebSocket on `ws://localhost:9223`.

**Protocol Version:** 1.0.0

**Message Format:**
```json
{
  "version": "1.0.0",
  "type": "console_event",
  "timestamp": "2025-10-08T12:00:00.000Z",
  "source": {
    "tabId": 12345,
    "url": "http://localhost:3000",
    "title": "My App"
  },
  "payload": {
    "method": "log",
    "args": [
      { "type": "string", "value": "Hello world" }
    ],
    "location": {
      "url": "http://localhost:3000/app.js",
      "lineNumber": 42,
      "columnNumber": 10
    }
  }
}
```

### Message Types

- `connection_status` - Connection established/disconnected
- `console_event` - Console log from browser
- `ping` - Keep-alive from extension
- `pong` - Keep-alive response from CLI
- `welcome` - Server welcome message

### Features

- **Message Queuing:** Up to 1000 messages queued during disconnections
- **Keep-Alive:** Ping/pong every 30 seconds
- **Auto-Reconnect:** Exponential backoff (1s → 2s → 4s → 8s → 16s)
- **Advanced Serialization:** Handles circular refs, DOM elements, Maps, Sets, Promises

---

## 🐛 Troubleshooting

### Extension not appearing in DevTools

1. **Check extension is loaded:**
   - Go to `chrome://extensions`
   - Verify "Console Bridge" is enabled

2. **Reload extension:**
   - Click "Reload" button on extension card
   - Close and reopen DevTools

3. **Check URL:**
   - Extension only works on `localhost` and `127.0.0.1`
   - Will not appear on other websites

### Cannot connect to CLI

1. **Check CLI is running:**
   ```bash
   console-bridge start --extension-mode
   ```

2. **Check port 9223 is free:**
   ```bash
   # Windows
   netstat -ano | findstr :9223

   # macOS/Linux
   lsof -i :9223
   ```

3. **Check firewall:**
   - Ensure localhost connections are allowed
   - Some firewalls block WebSocket connections

### Logs not appearing

1. **Check connection status in panel:**
   - Panel should show "Connected" status
   - If "Disconnected", restart CLI

2. **Check console logs are being generated:**
   - Open browser DevTools Console tab
   - Verify logs appear there
   - Extension mirrors browser console

3. **Check CLI output:**
   - Terminal should show "Extension connected" message
   - Should show incoming messages

---

## 🔧 Development

### Testing Extension Locally

1. **Load unpacked extension:**
   ```bash
   # Navigate to chrome://extensions
   # Enable Developer mode
   # Load unpacked → Select chrome-extension-poc/
   ```

2. **Test with sample page:**
   ```bash
   # Start test server
   cd test-page/
   python -m http.server 8080

   # In another terminal
   console-bridge start --extension-mode

   # Open http://localhost:8080 in Chrome
   # Open DevTools → Console Bridge tab
   # Logs should appear in terminal
   ```

3. **Inspect extension:**
   - Right-click in Console Bridge panel
   - Select "Inspect"
   - View extension console for errors

### Building for Production

The extension is ready for Chrome Web Store submission as-is:

1. **Create .zip file:**
   ```bash
   cd chrome-extension-poc/
   zip -r console-bridge-extension.zip . -x "*.md" -x "test/*"
   ```

2. **Submit to Chrome Web Store:**
   - Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
   - Upload .zip file
   - Follow submission process

---

## 📖 Documentation

- **Main Project:** [console-bridge-v2 README](../README.md)
- **Installation Guide:** [docs/extension-mode/installation.md](../docs/extension-mode/installation.md) (Coming in Phase 3.2)
- **Usage Tutorial:** [docs/extension-mode/usage.md](../docs/extension-mode/usage.md) (Coming in Phase 3.2)
- **Troubleshooting:** [docs/extension-mode/troubleshooting.md](../docs/extension-mode/troubleshooting.md) (Coming in Phase 3.2)

---

## 🤝 Contributing

Contributions welcome! See main project [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

**Extension-specific improvements:**
- UI/UX enhancements
- Additional message types
- Performance optimizations
- Browser compatibility (Edge, Brave, etc.)

---

## 📜 License

MIT License - See [LICENSE](../LICENSE) for details.

---

## 🙏 Support

- **Issues:** [GitHub Issues](https://github.com/pelchers/console-bridge-v2/issues)
- **Discussions:** [GitHub Discussions](https://github.com/pelchers/console-bridge-v2/discussions)

---

**Made with ❤️ by the Console Bridge community**
