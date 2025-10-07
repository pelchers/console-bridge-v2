# Console Bridge - Chrome Extension

**Version:** 2.0.0-alpha
**Status:** Development (Sprint 1 - Architecture & Planning)

---

## Overview

Console Bridge Chrome Extension captures console events from your browser and streams them to the Console Bridge CLI in your terminal via WebSocket.

**Part of Console Bridge v2.0.0 - Dual-Mode Operation:**
- **Extension Mode (NEW):** Monitor your personal Chrome browser with full extension support
- **Puppeteer Mode (v1.0.0):** Automated testing and CI/CD pipelines

---

## Features (Planned for Sprint 2-3)

- ✅ Capture all 18 console methods (log, info, warn, error, debug, etc.)
- ✅ Object serialization with circular reference handling
- ✅ WebSocket connection to CLI (`ws://localhost:9223`)
- ✅ DevTools panel UI showing connection status
- ✅ Multi-tab support
- ✅ Source labeling for multiple tabs
- ✅ Works on all Chromium-based browsers (Chrome, Edge, Brave, Opera, Vivaldi)

---

## Quick Start

### For Users (Not Yet Available)

Extension will be available on Chrome Web Store after Sprint 3 completion.

### For Developers

```bash
# 1. Clone repository
git clone git@github.com:pelchers/console-bridge-v2.git
cd console-bridge-v2/extension

# 2. Install dependencies
npm install

# 3. Start development mode with hot-reload
npm run dev
```

Chrome will launch automatically with the extension loaded.

---

## Development

See [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md) for complete development guide.

**Quick commands:**

```bash
npm run dev          # Start hot-reload development
npm test             # Run tests
npm run lint         # Check code quality
npm run build        # Build production extension
npm run validate     # Lint + format + test
```

---

## Testing

See [docs/TESTING.md](./docs/TESTING.md) for complete testing guide.

```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

**Test Coverage Goals:**
- Overall: > 80%
- Utilities: 100%
- Critical paths: 100%

---

## Project Status

**Current Phase:** Sprint 1 - Architecture & Planning
**Current Subtask:** 1.2 - Development Environment Setup

**Sprint 1 Deliverables:**
- [x] Subtask 1.1: Chrome DevTools API POC ✅
- [x] Subtask 1.2: Development Environment Setup ✅ (In Progress)
- [ ] Subtask 1.3: WebSocket Message Protocol Finalization
- [ ] Subtask 1.4: Extension Manifest v3 Finalization

**Upcoming:**
- **Sprint 2-3:** Full Chrome Extension Implementation
- **Sprint 4:** CLI WebSocket Server
- **Sprint 5:** Testing & Documentation

---

## Architecture

```
┌──────────────────────────────────────┐
│   Chrome Browser                     │
│   ┌──────────────────────────────┐   │
│   │  Console Bridge Extension    │   │
│   │  ├─ DevTools Panel (UI)      │   │
│   │  ├─ Console Capture Layer    │   │
│   │  └─ WebSocket Client         │   │
│   └────────────┬─────────────────┘   │
└────────────────┼─────────────────────┘
                 │ WebSocket
                 │ ws://localhost:9223
                 ▼
┌──────────────────────────────────────┐
│   Console Bridge CLI (Terminal)      │
│   ├─ WebSocket Server                │
│   ├─ Log Formatter                   │
│   └─ Terminal Output                 │
└──────────────────────────────────────┘
```

---

## Directory Structure

```
extension/
├─ src/                        # Source code
│  ├─ devtools/               # DevTools panel
│  ├─ background/             # Background service worker
│  ├─ content/                # Content scripts
│  ├─ utils/                  # Utilities (serialization, WebSocket)
│  └─ manifest.json           # Extension manifest
├─ test/                      # Tests
│  ├─ unit/                   # Unit tests
│  └─ integration/            # Integration tests
├─ docs/                      # Documentation
│  ├─ DEVELOPMENT.md          # Development guide
│  └─ TESTING.md              # Testing guide
├─ dist/                      # Built extension (production)
├─ package.json               # npm configuration
├─ webpack.config.js          # Build configuration
├─ .eslintrc.js              # Linting rules
└─ .prettierrc.json          # Formatting rules
```

---

## Contributing

1. Read [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md)
2. Check `.claude/adr/` for architecture decisions
3. Create feature branch
4. Write tests
5. Run `npm run validate`
6. Submit PR

---

## Resources

### Documentation
- [Development Guide](./docs/DEVELOPMENT.md)
- [Testing Guide](./docs/TESTING.md)
- [Implementation Plan](../.claude/versions/2.0.0/implementation-plan.md)
- [ADRs](../.claude/adr/phase-1/)

### Chrome Extension Docs
- [Chrome Extensions](https://developer.chrome.com/docs/extensions/)
- [DevTools Extensions](https://developer.chrome.com/docs/extensions/mv3/devtools/)
- [Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/)

---

## License

MIT © 2025

---

## Related Projects

- [Console Bridge CLI](https://github.com/pelchers/console-bridge) - v1.0.0 (Puppeteer Mode)
- [Console Bridge v2.0.0](https://github.com/pelchers/console-bridge-v2) - Extension Mode + Puppeteer Mode

---

**Status:** 🚧 Under Active Development (Sprint 1)

**Next Milestone:** Sprint 2 - Full Chrome Extension Implementation
