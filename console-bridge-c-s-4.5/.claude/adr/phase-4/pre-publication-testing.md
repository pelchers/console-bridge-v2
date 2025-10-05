# ADR: Pre-Publication Testing and Deployment Planning

**Status:** In Progress
**Date Created:** 2025-10-02
**Author:** Claude + User
**Phase:** 4 - Pre-Publication Testing

---

## Context

Phase 4 development is complete (file export, programmatic API, documentation, examples). All 193 automated tests pass. Before publishing or deploying, we need to verify the package works correctly in real-world conditions and determine distribution strategy.

**Current State:**
- ✅ All code complete (Phases 1-4)
- ✅ 193/193 tests passing
- ✅ Documentation complete
- ✅ Examples created
- ✅ License changed to proprietary with co-ownership requirements
- ⏳ Package testing incomplete
- ⏳ Distribution strategy undefined

**Goals:**
- Verify package contents are correct
- Test global installation works
- Verify CLI works with real applications
- Determine distribution approach
- Document deployment process

---

## Completed Work

### 1. License Update ✅

**Action:** Changed from MIT to proprietary license.

**New License Terms:**
- Allows use and modification for internal purposes only
- Prohibits redistribution without explicit permission
- Requires attribution in all uses
- Grants copyright holders co-ownership of any modifications
- Grants copyright holders co-ownership stake in any software incorporating the tool
- Commercial use requires separate license agreement

**Files Modified:**
- `LICENSE` - Replaced MIT with custom proprietary license

**Implications:**
- Cannot be published to public npm registry under standard terms
- Protects intellectual property
- Allows controlled distribution
- Enables potential commercialization

---

### 2. Package Verification (npm pack) ✅

**Command:** `npm pack`

**Results:**
```
Package: console-bridge-1.0.0.tgz
Size: 29.0 kB (compressed)
Unpacked: 107.9 kB
Files: 26 total
```

**Files Included (Correct):**
- `LICENSE` - Proprietary license
- `README.md` - Project overview
- `bin/console-bridge.js` - CLI entry point
- `docs/API.md` - API documentation (17.3 kB)
- `docs/USAGE.md` - User guide (10.8 kB)
- `examples/` - All example directories and READMEs
  - `advanced/` (2 files)
  - `basic-cli/` (1 file)
  - `custom-formatter/` (3 files)
  - `file-export/` (3 files)
  - `programmatic/` (4 files)
- `src/` - All source code
  - `core/` - BridgeManager, BrowserPool, LogCapturer
  - `formatters/` - LogFormatter, colors
  - `utils/` - URL utilities
  - `index.js` - Programmatic API entry point
- `package.json` - Package metadata

**Files Excluded (Correct):**
- ❌ `test/` - All test files
- ❌ `*.test.js` - Test files
- ❌ `coverage/` - Coverage reports
- ❌ `.claude/` - Claude workflows and ADRs
- ❌ `.eslintrc.json`, `.prettierrc` - Linter configs
- ❌ `jest.config.js` - Test config
- ❌ `IMPLEMENTATION_PLAN.md`, `PRD.md`, `TRD.md` - Planning docs
- ❌ `.git/`, `.gitignore` - Git files
- ❌ `node_modules/` - Dependencies

**Verification:**
```bash
# Created tarball
npm pack

# Verified contents
tar -tzf console-bridge-1.0.0.tgz

# Checked for unwanted files (none found)
tar -tzf console-bridge-1.0.0.tgz | grep -E "(test/|\.test\.js|\.claude/|jest\.config)"
# Result: ✅ No matches (all excluded correctly)
```

**Conclusion:** Package structure is correct. Only production files included.

---

### 3. Global Installation Test ✅

**Command:** `npm install -g .`

**Result:** Successfully installed in 431ms

**Installation Location:**
```
/c/Program Files/nodejs/console-bridge
Symlinked to: C:\Claude\console-bridge-c-s-4.5
```

**Verification Tests:**

**Test 1: Version Check**
```bash
console-bridge --version
# Output: 1.0.0
# ✅ PASSED
```

**Test 2: Help Command**
```bash
console-bridge --help
# Output: Shows usage, options, and commands
# ✅ PASSED
```

**Test 3: Start Command Help**
```bash
console-bridge start --help
# Output: Shows all CLI options including:
#   -l, --levels <levels>
#   --no-headless
#   -m, --max-instances <number>
#   --no-timestamp
#   --no-source
#   --location
#   --timestamp-format <format>
#   -o, --output <file>
# ✅ PASSED
```

**Test 4: Verify Global Installation**
```bash
which console-bridge
# Output: /c/Program Files/nodejs/console-bridge
# ✅ PASSED

npm list -g console-bridge
# Output: console-bridge@1.0.0 -> (symlinked to dev directory)
# ✅ PASSED
```

**Conclusion:** Global installation works perfectly. CLI command is accessible system-wide.

**Note:** Currently installed globally. Can be removed with:
```bash
npm uninstall -g console-bridge
```

---

## Remaining Work

### 4. Manual CLI Smoke Test (In Progress)

**Objective:** Verify console-bridge works correctly with a real localhost application and browser.

**Why Needed:**
- All previous tests were automated (unit/integration tests in Jest)
- Need to verify real-world functionality with actual Puppeteer browser
- Catch issues that only appear in production-like scenarios
- Validate end-to-end workflow

**Test Plan:**

#### **Approach: Create Test HTML Server**

Since we shouldn't fake tests, we'll create a minimal but real test environment:

**Step 1: Create Test HTML Page**
- Simple HTML file with JavaScript
- Contains various console.log statements
- Includes different log levels (log, info, warn, error)
- Contains objects, arrays, and primitives
- Has intentional errors to test error capture

**Example Test Page:**
```html
<!DOCTYPE html>
<html>
<head>
  <title>Console Bridge Test</title>
</head>
<body>
  <h1>Console Bridge Smoke Test</h1>
  <script>
    // Test different log levels
    console.log('Test log message');
    console.info('Test info message');
    console.warn('Test warning message');
    console.error('Test error message');

    // Test complex objects
    console.log({ name: 'Test', value: 42, nested: { data: true } });
    console.log(['array', 'of', 'items']);

    // Test numbers and booleans
    console.log(123, true, null, undefined);

    // Test error with stack trace
    try {
      throw new Error('Intentional test error');
    } catch (e) {
      console.error('Caught error:', e.message);
    }

    // Continuous logging for testing
    let count = 0;
    setInterval(() => {
      console.log(`Periodic log ${++count}`);
    }, 2000);
  </script>
</body>
</html>
```

**Step 2: Create Simple HTTP Server**
- Use Node.js built-in `http` module (no external dependencies)
- Serve the HTML file on localhost:5555
- Keep server running during test

**Server Code:**
```javascript
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5555;
const HTML_FILE = path.join(__dirname, 'test-page.html');

const server = http.createServer((req, res) => {
  fs.readFile(HTML_FILE, (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end('Error loading page');
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Test server running at http://localhost:${PORT}/`);
});
```

**Step 3: Run Console Bridge**
```bash
# Test basic monitoring
console-bridge start localhost:5555

# Test with file output
console-bridge start localhost:5555 --output test-output.log

# Test with filtering
console-bridge start localhost:5555 --levels error,warn

# Test with all formatting options
console-bridge start localhost:5555 --location --timestamp-format iso

# Test with multiple URLs (if we create multiple test servers)
console-bridge start localhost:5555 localhost:5556
```

**Step 4: Verification Checklist**

**Basic Functionality:**
- [ ] Browser launches (headless or visible with --no-headless)
- [ ] Connects to localhost:5555 successfully
- [ ] Displays console.log messages
- [ ] Displays console.info messages
- [ ] Displays console.warn messages
- [ ] Displays console.error messages
- [ ] Displays objects/arrays correctly formatted

**Formatting:**
- [ ] Timestamps appear (default format HH:MM:SS)
- [ ] Source URL appears ([localhost:5555])
- [ ] Colors are applied (different colors for different levels)
- [ ] Log levels are labeled (log:, info:, warn:, error:)
- [ ] Objects are pretty-printed with JSON formatting
- [ ] Numbers/booleans are colored correctly

**Options:**
- [ ] `--levels error,warn` filters correctly (only shows errors/warnings)
- [ ] `--no-timestamp` hides timestamps
- [ ] `--no-source` hides source URL
- [ ] `--location` shows file location (test-page.html:line:col)
- [ ] `--timestamp-format iso` shows ISO format (2025-10-02T...)
- [ ] `--output file.log` creates log file

**File Export:**
- [ ] Log file is created at specified path
- [ ] File contains logs in plain text
- [ ] ANSI color codes are stripped (no `\x1b[` sequences)
- [ ] File is appended to (not overwritten) on subsequent runs
- [ ] File closes cleanly on Ctrl+C

**Shutdown:**
- [ ] Ctrl+C stops gracefully
- [ ] Shows "Shutting down gracefully..." message
- [ ] Shows "✓ Console Bridge stopped." message
- [ ] Closes log file if --output was used
- [ ] Exits cleanly (no hung processes)

**Error Handling:**
- [ ] Shows error if URL not found (localhost:9999)
- [ ] Handles browser crashes gracefully
- [ ] Recovers from page errors
- [ ] Shows clear error messages

**Expected Duration:** 10-15 minutes

**Deliverables:**
- Test server code (test-server.js, test-page.html)
- Test execution log/screenshots
- Verification report (checklist completed)
- Any bugs found documented

---

### 5. Distribution Strategy Planning (Not Started)

**Objective:** Determine how to distribute Console Bridge given the proprietary license restrictions.

**Challenge:**
The proprietary license prohibits redistribution, which conflicts with public package registries like npm. Standard npm publishing assumes open-source redistribution rights.

**Key License Restrictions:**
1. No redistribution without permission
2. No publishing to package registries
3. No embedding in other software without co-ownership grant
4. Commercial use requires separate license

**Distribution Options Analysis:**

---

#### **Option A: Private npm Registry**

**Description:** Set up a private npm registry to host the package.

**Implementation Options:**

**A1: GitHub Packages**
- Use GitHub's npm registry
- Requires GitHub account
- Free for public repos, paid for private

**Setup:**
```json
// package.json
{
  "name": "@yourusername/console-bridge",
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}
```

```bash
# Publish
npm publish

# Users install with:
npm install @yourusername/console-bridge
```

**Requirements:**
- GitHub repository
- Users need GitHub account and authentication token
- Scope package name (@yourusername/...)

**A2: GitLab Package Registry**
- Similar to GitHub Packages
- Integrated with GitLab CI/CD

**A3: Verdaccio (Self-Hosted)**
- Run your own npm registry
- Full control over access
- Requires server/hosting

**Pros:**
- Professional distribution
- Version management built-in
- Users get updates via `npm update`
- Standard npm workflow
- Access control via authentication

**Cons:**
- Requires setup and configuration
- Users need authentication tokens
- Hosting costs (for self-hosted)
- Package name must be scoped (@username/package)
- More complex than simple distribution

**Best For:**
- Professional/enterprise distribution
- Multiple users/teams
- Long-term maintenance
- When you need version control and updates

**Estimated Setup Time:** 2-4 hours

---

#### **Option B: Git-Based Distribution**

**Description:** Users install directly from GitHub/GitLab repository.

**Implementation:**

**Step 1: Push to GitHub/GitLab**
```bash
# Create repository on GitHub
# Add remote
git remote add origin https://github.com/yourusername/console-bridge.git

# Push
git push -u origin master
```

**Step 2: Users Install from Git**
```bash
# Install from GitHub
npm install git+https://github.com/yourusername/console-bridge.git

# Install specific tag/version
npm install git+https://github.com/yourusername/console-bridge.git#v1.0.0

# Install from branch
npm install git+https://github.com/yourusername/console-bridge.git#develop
```

**Step 3: Create Git Tags for Versions**
```bash
# Tag release
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# Users install specific version
npm install git+https://github.com/yourusername/console-bridge.git#v1.0.0
```

**Access Control Options:**
- **Public repo:** Anyone can install
- **Private repo:** Only authorized users (requires SSH keys or tokens)

**Pros:**
- Simple setup (just push to git)
- Works with proprietary license
- No registry needed
- Easy updates (git pull)
- Can use private repos for access control

**Cons:**
- Users need git installed
- No version browsing (must know tags)
- Slower installs (clones entire repo)
- No download counts/analytics
- Requires git knowledge

**Best For:**
- Quick distribution
- Small user base
- Internal/team use
- When you want simplicity

**Estimated Setup Time:** 30 minutes

---

#### **Option C: Manual .tgz Distribution**

**Description:** Distribute the tarball file directly.

**Implementation:**

**Step 1: Create Package**
```bash
npm pack
# Creates: console-bridge-1.0.0.tgz
```

**Step 2: Distribute File**
- Email to users
- Upload to file sharing (Dropbox, Google Drive)
- Host on your website
- Include in project downloads

**Step 3: Users Install**
```bash
# From local file
npm install /path/to/console-bridge-1.0.0.tgz

# From URL
npm install https://yoursite.com/downloads/console-bridge-1.0.0.tgz
```

**Pros:**
- Maximum control
- Works anywhere (no internet needed for local install)
- Simple for one-off distribution
- No infrastructure needed

**Cons:**
- Manual version updates (send new file each time)
- No automatic updates
- Users must manually re-install for updates
- Tracking downloads is manual
- Not scalable

**Best For:**
- One-time distributions
- Offline installs
- Very small user base
- Demo/trial versions

**Estimated Setup Time:** 5 minutes

---

#### **Option D: Private Use Only**

**Description:** Don't distribute at all. Keep it for personal/internal use.

**Implementation:**
- Use locally: `npm link` for development
- Use globally: `npm install -g .` (already done)
- Copy to other machines manually

**Pros:**
- No distribution concerns
- No licensing issues
- Full control
- No maintenance burden

**Cons:**
- Can't share with others
- Limited to your machines
- Loses potential for collaboration/feedback
- No community benefits

**Best For:**
- Personal tools
- Proprietary internal tools
- When you don't want to support external users

**Estimated Setup Time:** 0 (already set up)

---

#### **Option E: Dual License Model**

**Description:** Offer different licenses for different use cases.

**Implementation:**

**License Tiers:**

**Tier 1: Personal/Internal Use (Free)**
- Use for personal projects
- Modify for internal use
- Cannot redistribute
- No co-ownership required if no redistribution

**Tier 2: Commercial Use (Paid License)**
- Use in commercial products
- Redistribute to customers
- Annual fee or one-time payment
- Include in Software-as-a-Service

**Tier 3: OEM/White Label (Negotiated)**
- Embed in your product
- Rebrand as your own
- Full integration rights
- Negotiated co-ownership or revenue share

**License File Structure:**
```
LICENSE-PERSONAL.md  - Free tier
LICENSE-COMMERCIAL.md - Paid tier
LICENSE-ENTERPRISE.md - Custom tier
LICENSE (main)        - Points to tier docs
```

**Distribution:**
- Public npm (free tier only)
- Private registry (commercial tier)
- Direct contact (enterprise tier)

**Pros:**
- Monetization potential
- Wider user base (free tier)
- Professional licensing structure
- Scalable business model
- Clear upgrade path

**Cons:**
- More complex to manage
- Need licensing system
- Need payment infrastructure
- Need legal review
- Support expectations

**Best For:**
- Building a product business
- Creating professional tools
- When you want to monetize
- Long-term project commitment

**Estimated Setup Time:** 8-16 hours + legal review

---

### **Recommendation Matrix**

| Use Case | Recommended Option | Why |
|----------|-------------------|-----|
| Personal tool, no sharing | Option D (Private) | Simplest, no overhead |
| Share with 1-5 people | Option C (.tgz) | Quick, easy, controlled |
| Share with team/company | Option B (Git) | Easy setup, team access |
| Open to community (limited) | Option B (Git) + Private Repo | Controlled access, easy updates |
| Professional distribution | Option A (Private Registry) | Professional, scalable |
| Build a business | Option E (Dual License) | Monetization, professional |

---

### **Questions to Determine Best Option:**

1. **Who will use this?**
   - Just you → Option D
   - 1-10 people → Option B or C
   - 10-100 people → Option A
   - Potentially thousands → Option E

2. **How much control do you want?**
   - Maximum control → Option C or D
   - Moderate control → Option B
   - Standard control → Option A

3. **Do you want to monetize?**
   - No → Options A-D
   - Yes → Option E

4. **How much time can you invest in distribution?**
   - Minimal (5 min) → Option C or D
   - Some (30 min - 1 hour) → Option B
   - Moderate (2-4 hours) → Option A
   - Significant (8+ hours) → Option E

5. **What's your long-term vision?**
   - Personal tool → Option D
   - Share with community → Option B
   - Professional project → Option A
   - Product/business → Option E

---

## Success Criteria

### Task 4: Manual Smoke Test
- [ ] All checklist items verified
- [ ] Test server created and runs successfully
- [ ] Console-bridge captures all log types
- [ ] File export works correctly
- [ ] All CLI options function as expected
- [ ] Graceful shutdown works
- [ ] No bugs found (or all bugs documented)

### Task 5: Distribution Strategy
- [ ] Distribution option selected
- [ ] Implementation plan documented
- [ ] Required infrastructure identified
- [ ] Timeline estimated
- [ ] Access control method defined
- [ ] User installation instructions drafted

---

## Next Steps

1. **Create test environment for smoke test**
   - Write test-page.html
   - Write test-server.js
   - Start server on localhost:5555

2. **Execute smoke test**
   - Run through verification checklist
   - Test all CLI options
   - Verify file export
   - Test graceful shutdown
   - Document any issues

3. **Discuss distribution strategy**
   - Review options analysis
   - Answer key questions
   - Select best option
   - Plan implementation

4. **Implement chosen distribution method**
   - Follow implementation plan
   - Test user installation
   - Document process

5. **Create final deployment documentation**
   - Installation instructions
   - Usage guide
   - Troubleshooting
   - License information

---

## Related Decisions

- Built on Phases 1-4 (all core functionality complete)
- License change to proprietary affects distribution options
- Package verification ensures quality distribution
- Global install test confirms CLI functionality

---

## Notes

This ADR documents the transition from development to deployment. The smoke test ensures real-world functionality, while the distribution strategy determines how the package reaches users.

The proprietary license significantly impacts distribution options. Traditional public npm publishing is not compatible with the license terms. Alternative distribution methods must be carefully considered.

**Critical Decision Point:** Distribution strategy must be chosen before proceeding with deployment.
