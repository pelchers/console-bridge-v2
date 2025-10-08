# Privacy Policy for Console Bridge

**Effective Date:** October 8, 2025
**Last Updated:** October 8, 2025

---

## Overview

Console Bridge is a developer tool that streams browser console logs from localhost development servers to your terminal. This privacy policy explains how the extension handles data.

---

## Data Collection

**Console Bridge collects ZERO personal data.**

### What We DO NOT Collect:
- ❌ Personal information (name, email, etc.)
- ❌ Browsing history
- ❌ Cookies or authentication tokens
- ❌ Analytics or telemetry
- ❌ Crash reports
- ❌ Usage statistics
- ❌ Any data from non-localhost websites

### What the Extension Processes Locally:
- ✅ Console logs from localhost/127.0.0.1 pages only
- ✅ Page URLs (localhost only)
- ✅ Console log messages, levels, and timestamps
- ✅ DevTools panel connection status

**All data processing happens locally on your machine. Nothing is sent to external servers.**

---

## How Console Bridge Works

1. **You open DevTools** on a localhost page (e.g., http://localhost:3000)
2. **Extension captures console logs** from that page
3. **Extension sends logs via WebSocket** to localhost:9223 (your own machine)
4. **CLI displays logs** in your terminal

**Data Flow:** Browser Console → Extension → WebSocket (localhost:9223) → CLI → Your Terminal

**No external connections. No cloud services. No third-party servers.**

---

## Permissions Justification

### DevTools Permission
**Required to:**
- Create the "Console Bridge" panel in Chrome DevTools
- Access console API to capture console events from localhost pages

**Does NOT allow:**
- Accessing console logs from non-localhost websites
- Modifying page content or behavior

### Host Permissions (localhost only)
**Required to:**
- Monitor console logs from http://localhost/* pages
- Monitor console logs from http://127.0.0.1/* pages

**Does NOT allow:**
- Accessing any non-localhost websites
- Monitoring any external or production websites
- Accessing user data from other websites

---

## Data Storage

**Console Bridge stores NO data on disk.**

- No cookies
- No localStorage
- No IndexedDB
- No file writes
- No persistent storage

The extension only keeps connection state in memory while running. When you close DevTools or refresh the page, all state is cleared.

---

## Third-Party Services

**Console Bridge uses ZERO third-party services.**

- No analytics providers (Google Analytics, etc.)
- No error tracking services (Sentry, etc.)
- No cloud logging services
- No advertising networks
- No social media integrations

---

## Open Source Transparency

Console Bridge is 100% open source:

**GitHub Repository:** https://github.com/pelchers/console-bridge-v2

You can review the complete source code to verify:
- What data is processed
- How data flows through the extension
- That no external connections are made
- That no data is collected or stored

---

## Security

### Localhost-Only Design
The extension is **security-by-design**:
- Only monitors localhost and 127.0.0.1 domains
- Cannot access production websites or user data
- Cannot send data outside your machine

### WebSocket Security
- WebSocket server runs on localhost:9223 (your machine only)
- No remote connections accepted
- No authentication required (localhost-only)
- No encryption needed (data never leaves your machine)

---

## Children's Privacy

Console Bridge is a developer tool intended for software developers. It does not target children under 13 and does not knowingly collect data from children.

---

## Changes to This Policy

We may update this privacy policy as the extension evolves. Changes will be posted at:
- This document in the GitHub repository
- Chrome Web Store listing

**Current Version:** 1.0.0
**Extension Version:** 2.0.0

---

## Contact

**Questions or concerns about privacy?**

- **GitHub Issues:** https://github.com/pelchers/console-bridge-v2/issues
- **Email:** [Your contact email - TBD]

---

## Summary

**Console Bridge:**
- ✅ Processes console logs locally
- ✅ Only works with localhost pages
- ✅ Sends data to your own CLI via localhost WebSocket
- ✅ 100% open source and transparent
- ❌ Collects NO personal data
- ❌ Sends NO data to external servers
- ❌ Uses NO third-party services
- ❌ Stores NO data on disk

**Your data stays on your machine. Period.**

---

**Document Version:** 1.0
**Created:** October 8, 2025
**Status:** ✅ Ready for Chrome Web Store submission
