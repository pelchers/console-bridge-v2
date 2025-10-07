# Development Guide - Console Bridge Extension

**Version:** 2.0.0-alpha
**Last Updated:** October 7, 2025

---

## Quick Start

### Prerequisites
- **Node.js** >= 18.x
- **npm** >= 9.x
- **Google Chrome** or any Chromium-based browser

### Setup (< 5 minutes)

```bash
# 1. Navigate to extension directory
cd extension/

# 2. Install dependencies
npm install

# 3. Start development server with hot-reload
npm run dev
```

That's it! Chrome will launch automatically with the extension loaded.

---

## Development Workflow

### Hot-Reload Development

```bash
npm run dev
```

**What this does:**
- Launches Chrome with extension loaded
- Watches for file changes
- Automatically reloads extension on save
- Opens DevTools by default

**How to use:**
1. Make changes to any file in `src/`
2. Save the file
3. Extension automatically reloads
4. Refresh the page you're testing (if needed)

### Manual Extension Loading (Alternative)

If hot-reload isn't working:

1. Open Chrome
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode" (top-right toggle)
4. Click "Load unpacked"
5. Select `extension/src/` directory

---

## Project Structure

```
extension/
├─ src/                        # Source code
│  ├─ devtools/
│  │  ├─ devtools.html         # DevTools entry point
│  │  ├─ devtools.js           # Creates DevTools panel
│  │  └─ panel/
│  │     ├─ panel.html         # Panel UI
│  │     ├─ panel.js           # Panel logic
│  │     └─ panel.css          # Panel styles
│  ├─ background/
│  │  └─ service-worker.js     # Background script (Manifest v3)
│  ├─ content/
│  │  └─ content-script.js     # Content script (if needed)
│  ├─ utils/
│  │  ├─ serialization.js      # Object serialization
│  │  ├─ websocket-client.js   # WebSocket connection
│  │  └─ console-capture.js    # Console capture logic
│  └─ manifest.json            # Extension manifest
├─ test/
│  ├─ unit/                    # Unit tests
│  └─ integration/             # Integration tests
├─ docs/                       # Documentation
├─ dist/                       # Built extension (production)
└─ package.json                # npm config & scripts
```

---

## Available Scripts

### Development
```bash
npm run dev              # Start hot-reload development
npm run build            # Build production extension
npm run build:dev        # Build development version with source maps
```

### Testing
```bash
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report
```

### Code Quality
```bash
npm run lint             # Check code with ESLint
npm run lint:fix         # Fix ESLint errors automatically
npm run format           # Format code with Prettier
npm run format:check     # Check if code is formatted
npm run validate         # Run lint + format + tests
```

---

## Making Changes

### Adding New Features

1. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Write your code**
   - Add functionality in `src/`
   - Write tests in `test/`
   - Update documentation if needed

3. **Validate your changes**
   ```bash
   npm run validate  # Lint + format + test
   ```

4. **Test manually**
   ```bash
   npm run dev  # Load extension in Chrome
   ```

5. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push origin feature/your-feature-name
   ```

### File Naming Conventions

- **JavaScript files:** `kebab-case.js` (e.g., `websocket-client.js`)
- **Test files:** `*.test.js` (e.g., `serialization.test.js`)
- **CSS files:** `kebab-case.css` (e.g., `panel-styles.css`)
- **HTML files:** `kebab-case.html` (e.g., `devtools-panel.html`)

---

## Debugging

### DevTools Panel Debugging

1. Open any webpage
2. Open Chrome DevTools (F12)
3. Click "Console Bridge" tab
4. Right-click in the panel → "Inspect"
5. This opens DevTools for the DevTools panel itself!

### Background Script Debugging

1. Go to `chrome://extensions/`
2. Find "Console Bridge" extension
3. Click "service worker" link
4. DevTools opens for the background script

### Extension Console Logs

```javascript
// In panel.js or devtools.js
console.log('Debug message');  // Shows in panel DevTools

// In service-worker.js
console.log('Background message');  // Shows in service worker DevTools
```

---

## Common Issues

### Issue: Extension not loading

**Solution:**
- Check manifest.json syntax (use JSON validator)
- Look for errors in `chrome://extensions/`
- Check browser console for errors

### Issue: Hot-reload not working

**Solution:**
- Kill Chrome processes: `taskkill /F /IM chrome.exe` (Windows) or `killall Chrome` (Mac/Linux)
- Restart with `npm run dev`
- Try manual loading as fallback

### Issue: Tests failing

**Solution:**
- Check test output for specific error
- Run tests in watch mode: `npm run test:watch`
- Verify Chrome API mocks are set up correctly

### Issue: Lint errors

**Solution:**
- Auto-fix most errors: `npm run lint:fix`
- Check .eslintrc.js for rule configuration
- Add `// eslint-disable-next-line` for exceptions

---

## Best Practices

### Code Style

- Use ES6+ features (arrow functions, destructuring, etc.)
- Prefer `const` over `let`, avoid `var`
- Use async/await for asynchronous code
- Add JSDoc comments for public functions

Example:
```javascript
/**
 * Serialize console arguments for transmission
 * @param {Array} args - Console method arguments
 * @returns {Array} Serialized arguments
 */
export function serializeConsoleArgs(args) {
  // Implementation
}
```

### Chrome API Usage

- Always check for errors:
  ```javascript
  chrome.devtools.panels.create('Panel', '', 'panel.html', panel => {
    if (chrome.runtime.lastError) {
      console.error('Error:', chrome.runtime.lastError);
    }
  });
  ```

- Use promises when possible (many Chrome APIs support them)

### Testing

- Write unit tests for all utility functions
- Test edge cases (null, undefined, circular references, etc.)
- Aim for > 80% code coverage
- Use descriptive test names

---

## Next Steps

1. Complete Sprint 1 (Architecture & Planning)
2. Proceed to Sprint 2 (Full Chrome Extension Implementation)
3. Implement WebSocket client
4. Implement console capture logic
5. Build complete UI for panel

---

## Resources

- [Chrome Extensions Documentation](https://developer.chrome.com/docs/extensions/)
- [DevTools Extensions Guide](https://developer.chrome.com/docs/extensions/mv3/devtools/)
- [Manifest V3 Migration](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [web-ext Documentation](https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/)

---

## Getting Help

- Check [TESTING.md](./TESTING.md) for testing guide
- Check [ARCHITECTURE.md](./ARCHITECTURE.md) for extension architecture
- Check `.claude/adr/` for architecture decisions
- Create an issue if you find bugs

---

**Happy Coding! 🚀**
