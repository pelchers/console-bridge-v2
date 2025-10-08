# Testing Conventions

**Date Created:** October 2, 2025
**Purpose:** Define rigorous testing standards to ensure 100% passing tests with verified success

---

## 🎯 Core Testing Principles

### 1. **Zero Assumptions**
- Never assume code works without verification
- Test every function, every edge case, every path
- Verify actual behavior, not expected behavior

### 2. **100% Passing Requirement**
- All tests must pass before moving to next phase/subtask
- No "TODO" tests or skipped tests in committed code
- Failed tests are blockers - fix immediately

### 3. **Verified Success**
- Run tests after EVERY code change
- Check test output manually for accuracy
- Ensure tests actually test what they claim to test

### 4. **No Failpoints**
- Identify potential failure scenarios
- Write tests for failure cases
- Handle errors gracefully in code

---

## 📋 Testing Workflow

### Before Writing Code:
1. Read requirements carefully
2. Identify all success criteria
3. List all edge cases and failure scenarios
4. Plan test cases before implementation

### During Implementation:
1. Write tests first (TDD approach recommended)
2. Run tests frequently during development
3. Add new tests when discovering edge cases
4. Never commit untested code

### After Implementation:
1. Run full test suite: `npm test`
2. Check test coverage: `npm run test:coverage`
3. Verify all tests pass (100%)
4. Review test quality and coverage
5. Add missing tests if needed

### For Each Subtask:
1. **BEFORE** marking subtask complete:
   - All tests must pass ✅
   - Test coverage > 80% for new code
   - Manual verification of functionality
   - No console errors or warnings

2. **AFTER** subtask completion:
   - Update ADR with test results
   - Document any testing challenges
   - Note coverage metrics

### For Each Phase:
1. **Integration Testing Required:**
   - Test all subtasks working together
   - Test cross-module interactions
   - Test realistic usage scenarios

2. **Regression Testing:**
   - Re-run all previous tests
   - Ensure new code didn't break old code

3. **Phase Sign-off Checklist:**
   - ✅ All unit tests passing
   - ✅ All integration tests passing
   - ✅ Coverage > 80%
   - ✅ No known bugs
   - ✅ Manual testing completed
   - ✅ Performance acceptable

---

## 🧪 Test Organization

### Directory Structure:
```
test/
├── unit/           # Unit tests for individual modules
│   ├── BrowserPool.test.js
│   ├── LogCapturer.test.js
│   ├── url.test.js
│   ├── colors.test.js
│   └── ...
├── integration/    # Integration tests for combined functionality
│   ├── phase-1-integration.test.js
│   ├── phase-2-integration.test.js
│   └── ...
└── e2e/           # End-to-end tests (if applicable)
    └── ...
```

### File Naming:
- Unit tests: `{ModuleName}.test.js`
- Integration tests: `{feature}-integration.test.js`
- Test files must be colocated with what they test logically

---

## 📊 Test Coverage Requirements

### Minimum Coverage:
- **Overall:** 80%
- **Statements:** 80%
- **Branches:** 75%
- **Functions:** 85%
- **Lines:** 80%

### Critical Modules:
- Core modules (BrowserPool, LogCapturer, BridgeManager): **90%+**
- Utility modules: **85%+**
- CLI/UI modules: **75%+**

### Checking Coverage:
```bash
npm run test:coverage
```

Review `coverage/lcov-report/index.html` for detailed coverage report.

---

## ✍️ Writing Quality Tests

### Test Structure (AAA Pattern):
```javascript
test('descriptive test name', () => {
  // Arrange - Set up test data and preconditions
  const input = 'test data';
  const expected = 'expected result';

  // Act - Execute the code being tested
  const result = functionUnderTest(input);

  // Assert - Verify the results
  expect(result).toBe(expected);
});
```

### Test Naming:
- Use descriptive names that explain what is being tested
- Format: `{function} {scenario} {expected result}`
- Examples:
  - ✅ `'normalizeUrl adds http:// to URL without protocol'`
  - ✅ `'validateUrl returns error for non-localhost hostname'`
  - ❌ `'test 1'`
  - ❌ `'it works'`

### What to Test:

#### ✅ Happy Path:
- Normal, expected usage
- Valid inputs
- Standard flows

#### ✅ Edge Cases:
- Empty strings, null, undefined
- Zero, negative numbers, very large numbers
- Boundary conditions
- First/last item in arrays

#### ✅ Error Conditions:
- Invalid inputs
- Type mismatches
- Network failures
- Timeouts

#### ✅ Integration Points:
- Module interactions
- Data flow between components
- External dependencies

---

## 🔍 Test Quality Checklist

For each test file, verify:

- [ ] All public functions have tests
- [ ] All error conditions are tested
- [ ] Edge cases are covered
- [ ] Tests are independent (no test depends on another)
- [ ] Tests are deterministic (same input = same output)
- [ ] No hardcoded values that might break (use ports 5555+)
- [ ] Mocks/stubs are used appropriately
- [ ] Async code is handled properly (async/await)
- [ ] Tests are fast (<10s for unit test file)
- [ ] Tests clean up after themselves

---

## 🚨 Common Testing Pitfalls

### ❌ Don't:
- Skip tests or use `.skip()` in committed code
- Write tests that always pass regardless of code
- Test implementation details instead of behavior
- Use hard-coded ports that may be in use (3000, 4000, 8080)
- Leave console.log() in test code
- Write flaky tests (tests that sometimes fail)
- Test multiple things in one test
- Copy-paste test code without updating it

### ✅ Do:
- Test behavior, not implementation
- Use high, uncommon ports (5555, 6666, 7777, etc.)
- Mock external dependencies
- Test one thing per test
- Use meaningful assertions
- Write self-documenting tests
- Run tests in isolation
- Keep tests simple and readable

---

## 🛠️ Testing Tools & Commands

### Run Tests:
```bash
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report
```

### Lint Tests:
```bash
npm run lint             # Lint source and test files
npm run lint:fix         # Auto-fix linting issues
```

### Debug Tests:
- Add `console.log()` temporarily for debugging
- Use `test.only()` to run single test during development
- Use `--verbose` flag for detailed output
- Remove debug code before committing

---

## 📝 Test Documentation

### In Test Files:
- Add comments for complex test setups
- Explain why a test exists if not obvious
- Document known limitations or quirks
- Link to related issues/ADRs if applicable

### In ADRs:
- Record test coverage metrics
- Note testing challenges encountered
- Document test strategy decisions
- List any areas not tested (with justification)

---

## 🎓 Example: Complete Test Suite

```javascript
/**
 * Tests for URL utilities
 */

const { normalizeUrl, validateUrl } = require('../../src/utils/url');

describe('URL Utilities', () => {
  describe('normalizeUrl', () => {
    // Happy path
    test('adds http:// to URL without protocol', () => {
      expect(normalizeUrl('localhost:5555')).toBe('http://localhost:5555/');
    });

    // Edge cases
    test('trims whitespace', () => {
      expect(normalizeUrl('  localhost:5555  ')).toBe('http://localhost:5555/');
    });

    // Error conditions
    test('throws error for empty string', () => {
      expect(() => normalizeUrl('')).toThrow('URL must be a non-empty string');
    });

    test('throws error for null', () => {
      expect(() => normalizeUrl(null)).toThrow('URL must be a non-empty string');
    });
  });
});
```

---

## 🔄 Continuous Testing

### Git Hooks (Future Enhancement):
Consider adding pre-commit hooks to run tests automatically:
```bash
# .git/hooks/pre-commit
npm test
```

### CI/CD (Future):
- Run tests on every push
- Block merges if tests fail
- Generate coverage reports
- Notify team of failures

---

## 📈 Testing Phases & Subtasks

### Phase-Level Testing:
1. **Phase 1:** Unit tests for all modules
2. **Phase 2:** Integration tests + unit tests
3. **Phase 3:** E2E tests + integration + unit
4. **Phase 4:** Full system tests + all previous

### Subtask-Level Testing:
- Each subtask must have tests
- Tests must pass before subtask completion
- Update test suite incrementally
- Never accumulate "test debt"

---

## ✅ Success Criteria

A subtask/phase is **NOT COMPLETE** until:

1. ✅ All tests written for new code
2. ✅ All tests passing (100%)
3. ✅ Coverage requirements met
4. ✅ Manual verification performed
5. ✅ No console warnings/errors
6. ✅ Code reviewed (if applicable)
7. ✅ ADR updated with test results
8. ✅ Committed to git with passing tests

**No exceptions. No assumptions. Verified success only.**

---

## 🚀 Quick Reference

**Before coding:** Plan tests
**During coding:** Write & run tests
**After coding:** Verify 100% passing
**Before commit:** Full test suite passes
**Before phase merge:** Integration tests pass

**Remember:** If it's not tested, it's broken. Prove it works.

---

**Related Files:**
- Branching Conventions: `.claude/workflows/conventions/branching-and-commits.md`
- ADR Conventions: `.claude/workflows/conventions/adr-conventions.md`
- Claude Guide: `.claude/claude.md`
