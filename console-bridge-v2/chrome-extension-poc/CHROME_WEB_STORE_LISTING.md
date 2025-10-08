# Chrome Web Store Listing Content

**Purpose:** Complete listing content for Chrome Web Store submission

---

## Basic Information

**Name:** Console Bridge

**Summary (132 characters max):**
Stream browser console logs to your terminal in real-time. Perfect for localhost development and debugging.

**Category:** Developer Tools

**Language:** English

---

## Detailed Description

```
Console Bridge streams your browser's console output directly to your terminal, making it easy to monitor localhost development servers, debug microservices, and keep an eye on frontend logs without constantly switching browser tabs.

✨ KEY FEATURES

• Real-time console log streaming to terminal
• Works with your personal Chrome browser (no automation required)
• Supports multiple tabs simultaneously
• Color-coded output by log level and source
• Timestamps and source labeling
• File export for log archiving
• 100% localhost-only (secure by design)
• Compatible with all Chromium browsers (Chrome, Edge, Brave, Opera, Vivaldi)

🚀 QUICK START

1. Install Console Bridge CLI:
   npm install -g console-bridge

2. Install this Chrome extension

3. Start CLI in extension mode:
   console-bridge start --extension-mode

4. Open DevTools on any localhost page → "Console Bridge" panel

5. Console logs appear in terminal in real-time!

💡 USE CASES

• Monitor multiple localhost dev servers simultaneously
• Debug microservices without switching browser tabs
• Keep console logs visible while working in your IDE
• Archive console logs to files for later review
• Share console output with AI coding assistants
• Monitor frontend errors in terminal
• Debug React, Vue, Angular, Next.js apps more efficiently

🔒 PRIVACY & SECURITY

• Localhost-only: Extension ONLY monitors localhost and 127.0.0.1
• No data collection: No analytics, no tracking, no telemetry
• No external connections: All communication stays on your machine
• Open source: Full transparency at github.com/pelchers/console-bridge-v2
• No account required: No sign-up, no login, no cloud services

📖 DOCUMENTATION

Full installation guide, tutorials, and troubleshooting:
https://github.com/pelchers/console-bridge-v2#readme

Video tutorials:
• Installation: [YouTube link TBD]
• Usage guide: [YouTube link TBD]
• Troubleshooting: [YouTube link TBD]

🆚 EXTENSION MODE vs PUPPETEER MODE

Console Bridge offers two modes:

• Extension Mode (v2.0.0): Monitor YOUR Chrome browser with extensions
• Puppeteer Mode (v1.0.0): Automated headless/headful browser monitoring

Use extension mode for manual testing with your personal browser and dev tools.
Use Puppeteer mode for CI/CD, automated testing, and scripting.

🐛 SUPPORT

Report issues: https://github.com/pelchers/console-bridge-v2/issues
Ask questions: [GitHub Discussions link]

🙏 CONTRIBUTE

Console Bridge is open source! Contributions welcome:
https://github.com/pelchers/console-bridge-v2

⭐ RATE THIS EXTENSION

If you find Console Bridge helpful, please leave a review! Your feedback helps improve the tool for everyone.

---

Made with ❤️ by the Console Bridge community
```

---

## Screenshots

**Required:** 5-7 screenshots (1280x800 or 640x400)

### Screenshot 1: Extension Panel
**Title:** Console Bridge DevTools Panel
**Description:** Connection status and statistics in Chrome DevTools
**Show:**
- DevTools open with Console Bridge panel
- Connection status: "Connected"
- Stats: messages sent, connection time, queue size
- Clean, professional UI

### Screenshot 2: Terminal Output
**Title:** Real-time Console Logs in Terminal
**Description:** Formatted console output with timestamps and colors
**Show:**
- Terminal window with console logs
- Color-coded log levels (log, warn, error)
- Timestamps
- Source URLs ([localhost:3000])
- Multiple log entries

### Screenshot 3: Multiple Tabs
**Title:** Monitor Multiple Tabs Simultaneously
**Description:** Console logs from multiple localhost tabs in one terminal
**Show:**
- Terminal with logs from different sources
- Different source labels ([localhost:3000], [localhost:8080])
- Mixed log levels from different apps

### Screenshot 4: CLI + Extension Setup
**Title:** Simple Setup: CLI + Extension
**Description:** Split screen showing CLI command and extension panel
**Show:**
- Left: Terminal with `console-bridge start --extension-mode`
- Right: Chrome with extension panel showing "Connected"
- Clean, easy-to-understand layout

### Screenshot 5: React DevTools Compatibility
**Title:** Works with React DevTools & Other Extensions
**Description:** Console Bridge alongside other developer extensions
**Show:**
- Chrome with React DevTools + Console Bridge
- Both extensions working simultaneously
- Terminal showing React console logs

### Screenshot 6: File Export
**Title:** Export Logs to Files
**Description:** Save console logs to files for archiving
**Show:**
- Terminal with `--output logs.txt` flag
- Text editor showing exported log file
- Clean, plain text format (no ANSI codes)

### Screenshot 7: Error Monitoring
**Title:** Catch Frontend Errors Instantly
**Description:** Monitor errors and warnings in real-time
**Show:**
- Terminal with error logs highlighted
- Stack traces formatted
- Error objects pretty-printed

---

## Promotional Tile (440x280)

**Design:**
- Console Bridge logo/icon
- Tagline: "Browser Logs → Terminal"
- Visual: Simple diagram showing browser → terminal flow
- Colors: Brand colors (blue, green, dark)
- Clean, professional design

---

## Small Tile (200x200)

**Design:**
- Console Bridge icon (large)
- Name: "Console Bridge"
- Minimal text
- High contrast for visibility

---

## Marquee Tile (1400x560)

**Design:**
- Large: "Console Bridge"
- Tagline: "Stream browser console logs to your terminal"
- Visual: Mockup of browser + terminal side-by-side
- Call to action: "Perfect for localhost development"
- Professional, inviting design

---

## Privacy Policy (Required)

See: `PRIVACY_POLICY.md`

---

## Single Purpose Description (Required by Chrome Web Store)

**Single Purpose:**
Console Bridge serves a single purpose: to stream browser console logs from localhost development servers to the user's terminal via WebSocket connection for development and debugging purposes.

**Justification:**
- The extension captures console events from localhost pages only
- It sends this data to a locally-running CLI tool via WebSocket (port 9223)
- All functionality directly supports this single purpose
- No secondary features or data collection

**Host Permissions Justification:**
- `http://localhost/*` - Required to monitor localhost development servers
- `http://127.0.0.1/*` - Required to monitor 127.0.0.1 (localhost alias)

**DevTools Permission Justification:**
- Required to create Console Bridge panel in Chrome DevTools
- Required to access console API for capturing console events

---

## Version History

**v2.0.0 (Initial Release):**
- Extension mode for monitoring personal Chrome browser
- WebSocket Protocol v1.0.0 implementation
- Multi-tab support
- Message queuing and keep-alive
- Advanced object serialization

**Future Versions:**
- v2.1.0: Extension settings panel, enhanced filtering
- v2.2.0: Performance optimizations, improved UI

---

## Submission Checklist

- [ ] All screenshots created (7 images)
- [ ] Promotional tiles created (3 tiles)
- [ ] Privacy policy published
- [ ] Icons created and tested (16px, 48px, 128px)
- [ ] Extension tested in Chrome
- [ ] Description proofread
- [ ] All links working
- [ ] Video tutorials uploaded (or marked TBD)
- [ ] Single purpose justification clear
- [ ] Host permissions justified
- [ ] Developer account set up
- [ ] $5 developer fee paid (one-time)

---

**Status:** 📝 Draft - Ready for review
**Next Step:** Create screenshots and tiles
**Estimated Time to Complete:** 4-6 hours (with design work)
