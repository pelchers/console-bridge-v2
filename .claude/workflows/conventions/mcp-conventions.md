# MCP Server Usage Conventions

**Last Updated:** 2025-10-07
**Purpose:** Decision matrix for which MCP to use for specific tasks

---

## 📚 Documentation & Knowledge Priority Order

**ALWAYS follow this hierarchy:**

1. **Context7** - PRIMARY source for documentation-based decisions
   - Use FIRST when answering questions about libraries, frameworks, tools
   - Check official docs, API references, best practices
   - Example: "Use Context7 to check React 19 hooks documentation"

2. **WebSearch** - SECONDARY source if Context7 doesn't have the answer
   - Use AFTER Context7 yields no results
   - For recent updates, breaking changes, community discussions
   - Example: "Context7 didn't find it → WebSearch for 2025 updates"

**Never skip Context7 for documentation questions!**

---

## 🌐 Browser/Web Automation Decision Matrix

### When to Use Each MCP:

**Puppeteer** → Basic automated web testing
- ✅ Simple page navigation
- ✅ Form filling and submission
- ✅ Basic scraping
- ✅ Screenshot capture
- ✅ Headless browser testing
- ❌ Chrome DevTools panel access
- ❌ Extensions (launches new instances)

**Browser MCP** → Chrome-exclusive tasks with real browser
- ✅ Testing Chrome extensions (they persist!)
- ✅ Using existing login sessions
- ✅ Reading console logs from active page
- ✅ Avoiding bot detection (uses real profile)
- ✅ Interacting with DevTools panels (via extension)
- ✅ Local automation (fast, private)
- ❌ Cross-browser testing

**Playwright** → Cross-browser testing & advanced automation
- ✅ Testing across Chromium, Firefox, WebKit
- ✅ Advanced automation scenarios
- ✅ Network interception
- ✅ Mobile emulation
- ✅ Parallel testing
- ✅ Modern API with auto-wait
- ❌ Uses existing browser profile (launches new instances)

**Chrome DevTools MCP** → Deep Chrome debugging & analysis
- ✅ Performance tracing
- ✅ Network traffic monitoring
- ✅ JavaScript profiling
- ✅ Memory analysis
- ✅ Protocol-level access
- ❌ Chrome only
- ❌ More complex setup

---

## 💻 Desktop/System Automation

**Desktop Automation** → General PC use & testing
- ✅ **PRIMARY:** Keyboard/mouse control
- ✅ **PRIMARY:** Window management
- ✅ **PRIMARY:** Screen capture
- ✅ **PRIMARY:** System-level automation
- ✅ **FALLBACK:** When web MCPs can't do something

**Critical Fallback Example:**
```
Problem: Browser MCP can't open DevTools (F12)
Solution: Use Desktop Automation to press F12 key
Then: Continue with Browser MCP for page interaction
```

---

## 🎯 Decision Tree Examples

### Example 1: Testing a Chrome Extension
```
Task: Test Console Bridge extension with 48 test scenarios
Decision: Browser MCP
Reason: Extension must persist, need to read console logs, Chrome-only
Fallback: Desktop Automation to press F12 if needed
```

### Example 2: Cross-Browser Compatibility Testing
```
Task: Test website works in Chrome, Firefox, Safari
Decision: Playwright
Reason: Supports multiple browsers, modern API, parallel testing
```

### Example 3: Simple Form Automation
```
Task: Fill out and submit contact form
Decision: Puppeteer
Reason: Simple task, doesn't need special features
```

### Example 4: Performance Analysis
```
Task: Analyze page load performance and network requests
Decision: Chrome DevTools MCP
Reason: Deep protocol-level access to performance data
```

### Example 5: Opening DevTools Programmatically
```
Task: Open Chrome DevTools during automated test
Decision: Desktop Automation (keyboard_press F12)
Reason: Web MCPs can't control browser UI, need system-level key press
```

### Example 6: Answering React Questions
```
Task: User asks "What are React 19 Server Components?"
Decision: Context7 FIRST → WebSearch if needed
Reason: Documentation-based question, follow priority order
```

---

## 🔄 Combining MCPs

**Common Patterns:**

### Pattern 1: Chrome Extension Testing
```
1. Desktop Automation → Press F12 (open DevTools)
2. Desktop Automation → Click "Console Bridge" tab
3. Browser MCP → Navigate to test page
4. Browser MCP → Click test buttons
5. Browser MCP → Read console logs
6. Desktop Automation → Screenshot for verification
```

### Pattern 2: Full E2E Testing
```
1. Playwright → Launch browser and navigate
2. Browser MCP → Handle Chrome-specific features
3. Desktop Automation → Handle system dialogs
```

### Pattern 3: Documentation-Driven Development
```
1. Context7 → Check official docs
2. WebSearch → Look for recent updates if not in Context7
3. Browser MCP/Playwright → Test implementation
```

---

## 📝 Best Practices

### DO:
- ✅ Always use Context7 before WebSearch for docs
- ✅ Choose the most specific MCP for the task
- ✅ Use Desktop Automation as fallback/bridge
- ✅ Combine MCPs when needed
- ✅ Document which MCP you're using and why

### DON'T:
- ❌ Skip Context7 for documentation questions
- ❌ Use Puppeteer for Chrome extension testing
- ❌ Use Browser MCP for cross-browser testing
- ❌ Use Desktop Automation for tasks web MCPs can handle
- ❌ Forget about fallback options

---

## 🆘 Troubleshooting

**"Web MCP can't do X"**
→ Try Desktop Automation as fallback

**"Need official docs for library X"**
→ Context7 FIRST, then WebSearch

**"Extension not persisting"**
→ Use Browser MCP (not Puppeteer/Playwright)

**"Need cross-browser testing"**
→ Use Playwright (not Browser MCP)

**"Can't access DevTools panels"**
→ Desktop Automation to open, Browser MCP to interact

---

**Created:** 2025-10-07
**Maintained by:** Claude Code
**Status:** Living Document - Update as needed
