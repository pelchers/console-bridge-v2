# Testing Guide - Console Bridge Extension

**Version:** 2.0.0-alpha
**Last Updated:** October 7, 2025

---

## Quick Start

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

---

## Testing Strategy

### Test Pyramid

```
    ┌─────────────────┐
    │  Manual Tests   │  (DevTools-specific features)
    └─────────────────┘
         /         \
    ┌─────────────────┐
    │ Integration Tests│  (WebSocket, E2E)
    └─────────────────┘
         /         \
    ┌─────────────────┐
    │   Unit Tests    │  (Utilities, serialization)
    └─────────────────┘
```

**Strategy:**
- **Unit Tests:** 80% of tests - Fast, isolated, test individual functions
- **Integration Tests:** 15% of tests - Test component interactions
- **Manual Tests:** 5% - Test DevTools-specific features

---

## Unit Testing

### Writing Unit Tests

Location: `test/unit/`

Example: `test/unit/serialization.test.js`

```javascript
import { serializeConsoleArgs } from '../../src/utils/serialization';

describe('serializeConsoleArgs', () => {
  test('serializes primitives correctly', () => {
    const args = ['hello', 42, true];
    const result = serializeConsoleArgs(args);

    expect(result[0]).toEqual({ type: 'string', value: 'hello' });
    expect(result[1]).toEqual({ type: 'number', value: 42 });
    expect(result[2]).toEqual({ type: 'boolean', value: true });
  });

  test('handles circular references', () => {
    const circular = {};
    circular.self = circular;

    const result = serializeConsoleArgs([circular]);

    expect(result[0].value.self.type).toBe('circular');
  });
});
```

### Running Unit Tests

```bash
# Run once
npm test

# Watch mode (re-runs on file change)
npm run test:watch

# With coverage
npm run test:coverage
```

### Coverage Goals

- **Overall:** > 80%
- **Utilities:** 100% (serialization, validators, etc.)
- **Critical paths:** 100% (WebSocket, console capture)
- **UI:** > 60% (harder to test)

---

## Integration Testing

### Writing Integration Tests

Location: `test/integration/`

Example: `test/integration/websocket.test.js`

```javascript
describe('WebSocket Connection', () => {
  let mockServer;

  beforeEach(() => {
    // Set up mock WebSocket server
    mockServer = new MockWebSocketServer();
  });

  afterEach(() => {
    mockServer.close();
  });

  test('connects to CLI successfully', async () => {
    const client = new WebSocketClient('ws://localhost:9223');
    await client.connect();

    expect(client.isConnected()).toBe(true);
  });
});
```

### Running Integration Tests

```bash
# Run all tests (includes integration)
npm test

# Run only integration tests
npm test -- test/integration
```

---

## Manual Testing

### DevTools Panel Testing

Manual testing checklist: `../chrome-extension-poc/MANUAL_TESTING.md`

**Why manual testing?**
- DevTools extensions are hard to automate
- Chrome's extension APIs have limited test support
- Visual UI verification is easier manually

**How to test:**

1. **Load Extension**
   ```bash
   npm run dev
   ```

2. **Open Test Page**
   - Navigate to `http://localhost:3000` (or any localhost URL)
   - Open DevTools (F12)
   - Click "Console Bridge" tab

3. **Test Features**
   - [ ] Panel loads without errors
   - [ ] Connection status shows correctly
   - [ ] Statistics update when console logs occur
   - [ ] UI is responsive and styled correctly

4. **Test Console Capture**
   In browser console, run:
   ```javascript
   console.log('Test message');
   console.error('Test error');
   console.warn('Test warning');
   ```

   Verify:
   - [ ] Events are captured
   - [ ] Statistics increment
   - [ ] No JavaScript errors

---

## Mocking Chrome APIs

### Setup

Chrome APIs are mocked using `sinon-chrome`:

```javascript
// test/setup.js
const sinonChrome = require('sinon-chrome');
global.chrome = sinonChrome;

beforeEach(() => {
  sinonChrome.reset();
});
```

### Usage in Tests

```javascript
test('creates DevTools panel', () => {
  // Mock the panel creation
  chrome.devtools.panels.create.yields(mockPanel);

  // Call function that uses chrome.devtools.panels.create
  createPanel();

  // Assert
  expect(chrome.devtools.panels.create.calledOnce).toBe(true);
});
```

---

## Testing Utilities

### Serialization

Test edge cases:
- ✅ Primitives (string, number, boolean, null, undefined)
- ✅ Arrays (nested, empty, mixed types)
- ✅ Objects (nested, empty, with methods)
- ✅ Circular references
- ✅ DOM elements
- ✅ Functions
- ✅ Large objects (performance)

### WebSocket Client (Sprint 2)

Test scenarios:
- ✅ Successful connection
- ✅ Connection failure
- ✅ Reconnection logic
- ✅ Message sending
- ✅ Message receiving
- ✅ Graceful disconnection

---

## Test Structure

### Good Test Structure

```javascript
describe('Feature or Component', () => {
  // Setup
  let dependency;

  beforeEach(() => {
    dependency = createMockDependency();
  });

  // Cleanup
  afterEach(() => {
    dependency.cleanup();
  });

  // Test cases
  describe('specific behavior', () => {
    test('does something when condition is met', () => {
      // Arrange
      const input = 'test';

      // Act
      const result = functionUnderTest(input);

      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

### Test Naming

**Good:**
```javascript
test('serializes circular references as [Circular Reference]', () => {
  // Clear what is being tested
});
```

**Bad:**
```javascript
test('works', () => {
  // Unclear what "works" means
});
```

---

## Debugging Tests

### Failed Test

```bash
npm test
```

Output shows:
```
FAIL test/unit/serialization.test.js
  ● serializeConsoleArgs › handles circular references

    expect(received).toBe(expected) // Object.is equality

    Expected: "circular"
    Received: "object"
```

**How to debug:**

1. **Add console.log**
   ```javascript
   test('handles circular references', () => {
     const result = serializeConsoleArgs([circular]);
     console.log('Result:', JSON.stringify(result, null, 2));
     expect(result[0].value.self.type).toBe('circular');
   });
   ```

2. **Use debugger**
   ```javascript
   test('handles circular references', () => {
     debugger;  // Pause here
     const result = serializeConsoleArgs([circular]);
     expect(result[0].value.self.type).toBe('circular');
   });
   ```

   Run with Node debugger:
   ```bash
   node --inspect-brk node_modules/.bin/jest --runInBand
   ```

3. **Run only this test**
   ```javascript
   test.only('handles circular references', () => {
     // Only this test runs
   });
   ```

---

## Continuous Integration

### GitHub Actions (Future)

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run lint
      - run: npm test
      - run: npm run build
```

---

## Test Coverage Report

```bash
npm run test:coverage
```

Output:
```
--------------------|---------|----------|---------|---------|-------------------
File                | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
--------------------|---------|----------|---------|---------|-------------------
All files           |   85.23 |    78.45 |   90.12 |   85.23 |
 serialization.js   |   100   |    100   |   100   |   100   |
 websocket.js       |   72.34 |    65.78 |   80.45 |   72.34 | 45-52, 78-85
--------------------|---------|----------|---------|---------|-------------------
```

**Interpreting results:**
- **% Stmts:** Percentage of statements executed
- **% Branch:** Percentage of conditional branches tested
- **% Funcs:** Percentage of functions called
- **% Lines:** Percentage of lines executed
- **Uncovered Line #s:** Lines not covered by tests

---

## Best Practices

### Do's ✅

- Write tests before fixing bugs (TDD)
- Test edge cases (null, undefined, empty arrays, etc.)
- Keep tests simple and focused
- Use descriptive test names
- Mock external dependencies
- Aim for fast tests (< 100ms each)

### Don'ts ❌

- Don't test implementation details
- Don't make tests dependent on each other
- Don't skip tests without a comment explaining why
- Don't test third-party library code
- Don't write tests that rely on timing (use mocks instead)

---

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [sinon-chrome Documentation](https://github.com/acvetkov/sinon-chrome)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Happy Testing! 🧪**
