# Testing Conventions

**Date Created:** October 2, 2025
**Purpose:** Define rigorous testing standards to ensure 100% passing tests

---

## 🎯 Core Principles

### 1. Zero Assumptions
- Never assume code works without verification
- Test every function, edge case, path
- Verify actual behavior, not expected

### 2. 100% Passing Requirement  
- All tests must pass before moving forward
- No "TODO" or skipped tests in commits
- Failed tests are blockers

### 3. Verified Success
- Run tests after EVERY code change
- Check output manually
- Ensure tests actually test what they claim

### 4. No Failpoints
- Identify potential failure scenarios
- Write tests for failure cases
- Handle errors gracefully

---

## 📋 Testing Workflow

**Before Writing Code:**
1. Read requirements carefully
2. Identify success criteria
3. List edge cases and failures
4. Plan test cases

**During Implementation:**
1. Write tests first (TDD)
2. Run tests frequently
3. Add tests for edge cases
4. Never commit untested code

**After Implementation:**
1. Run full suite: `npm test`
2. Check coverage: `npm run test:coverage`
3. Verify 100% passing
4. Review quality and coverage

---

## 📊 Coverage Requirements

- **Overall:** 80%
- **Core modules:** 90%+
- **Utility modules:** 85%+

---

## ✅ Success Criteria

A subtask is NOT COMPLETE until:
- ✅ All tests written
- ✅ All tests passing (100%)
- ✅ Coverage requirements met
- ✅ Manual verification done
- ✅ No console warnings/errors
- ✅ ADR updated

**No exceptions. No assumptions. Verified success only.**

---

For full conventions see original console-bridge project.
