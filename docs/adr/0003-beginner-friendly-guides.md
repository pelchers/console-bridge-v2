# ADR 0003: Beginner-Friendly Setup and Usage Guides

**Date:** 2025-10-05
**Status:** Accepted
**Deciders:** Console Bridge Development Team
**Related ADRs:**
- [0002 - Version 1.0.0 Release](./0002-version-1.0.0-release.md)
- [0001 - Unified Terminal Output](./0001-unified-terminal-output.md)

---

## Context

Following the v1.0.0 release (ADR 0002), user feedback indicated that while the documentation is comprehensive, it lacks simple, step-by-step guides for beginners. The existing documentation assumes familiarity with the tool and development workflows:

**Existing Documentation:**
- `getting-started.md` - Comprehensive but assumes understanding of concepts
- `advanced-usage.md` - Reference-style documentation
- `troubleshooting.md` - Issue-focused

**Gap Identified:**
New users need:
1. Clear setup instructions from zero to working installation
2. Simple explanations of the 4 different ways to run Console Bridge
3. Step-by-step testing procedures
4. When to use which method

**User Request:**
> "is that info in the 'c:/Claude/console-bridge-c-s-4.5/docs/guides' in one of those files comprehensivly., if not you should make a file for that (maybe in app usage guide simple where you explain the 4 ways to run in a very simple step by step way...and you can also make a file for setup guide (they can be numbered 1 and 2, the setup guide first and the other guide next."

This feedback highlighted the need for beginner-oriented, numbered guides that progressively take users from installation to daily usage.

---

## Decision

**We will add two new beginner-friendly guides to the documentation suite:**

1. **`1-setup-guide.md`** - Step-by-step installation and configuration
2. **`2-usage-guide.md`** - The 4 methods to run Console Bridge with examples

These guides will complement (not replace) the existing comprehensive documentation by providing a gentle on-ramp for new users.

---

## Guide Specifications

### 1-setup-guide.md

**Purpose:** Get users from zero to working installation

**Contents:**
1. Prerequisites check
2. Global installation of Console Bridge
3. Installation verification
4. Unified terminal setup (concurrently)
5. Script configuration in package.json
6. Verification testing
7. Common setup issues and fixes
8. Platform-specific notes

**Target Audience:** Complete beginners, first-time users

**Writing Style:**
- Direct, imperative instructions
- Every command shown explicitly
- Copy-paste friendly code blocks
- Assumes no prior knowledge

---

### 2-usage-guide.md

**Purpose:** Explain the 4 ways to run Console Bridge and when to use each

**Contents:**

**The 4 Methods:**
1. **Method 1: Basic Usage** (2 separate terminals)
   - Simplest approach
   - Good for learning
   - Step-by-step terminal commands

2. **Method 2: Manual Merge** (2 terminals with --merge-output)
   - Shows how --merge-output works manually
   - Advanced understanding

3. **Method 3: Unified Terminal** (concurrently - RECOMMENDED)
   - One command, one terminal
   - Daily development workflow
   - Seamless integration

4. **Method 4: Headful Debug Mode** (visible browser)
   - Debugging Console Bridge
   - Visual verification
   - Learning tool

**Additional Sections:**
- Quick comparison table
- Common workflows
- CLI options reference
- Testing checklist
- Tips & tricks
- Quick reference card

**Target Audience:** Users who have completed setup, ready to start using

**Writing Style:**
- Clear method comparisons
- Visual examples of terminal output
- When to use each method
- Copy-paste ready commands

---

## Rationale

### Why Add These Guides?

**1. Lower Barrier to Entry**

Current documentation assumes:
- Understanding of concurrently
- Knowledge of package.json scripts
- Familiarity with terminal workflows
- Understanding of headless vs headful

New guides remove these assumptions and teach concepts progressively.

**2. Progressive Learning Path**

Numbered guides create a natural progression:
```
1-setup-guide.md
   ↓
   Installation complete
   ↓
2-usage-guide.md
   ↓
   Pick a method, start using
   ↓
advanced-usage.md
   ↓
   Deep dive into features
```

**3. Reduce Support Burden**

Common questions like:
- "How do I install this?"
- "Why do I need concurrently?"
- "What's the difference between --merge-output and concurrently?"
- "When should I use headful mode?"

All answered in one place with clear examples.

**4. Framework-Specific Examples**

Each guide includes examples for:
- Next.js (most popular)
- Vite
- Create React App
- Express
- Generic npm dev server

Users can copy-paste the exact configuration for their framework.

**5. Addresses Global + Concurrently Confusion**

User question:
> "is this gonna be an issue to use concurrently since our apps configured for global use but concurrently might have an issue with that due to paths and other stuff"

**Answer in guides:**
- Console Bridge installed globally (available in PATH)
- Concurrently installed locally per-project
- They work together seamlessly
- No path conflicts

This common confusion is explicitly addressed.

---

## Design Decisions

### Numbering Convention

**Why numbered guides?**
- Clear sequence (1 → 2 → advanced docs)
- Prevents users from skipping setup
- Natural progression

**Why not replace existing guides?**
- Existing guides are valuable reference docs
- Some users prefer comprehensive docs
- Keep both: beginner path + reference docs

---

### Content Strategy

**1-setup-guide.md:**
- ✅ Platform-specific instructions
- ✅ Copy-paste commands
- ✅ Troubleshooting common setup issues
- ✅ Verification steps
- ❌ Advanced configuration (save for advanced-usage.md)
- ❌ Architecture explanations (save for system-overview.md)

**2-usage-guide.md:**
- ✅ All 4 methods with examples
- ✅ When to use each method
- ✅ Visual examples of terminal output
- ✅ Quick reference cards
- ❌ Deep dive into CLI options (reference advanced-usage.md)
- ❌ Troubleshooting (reference troubleshooting.md)

Each guide links to deeper docs for users who want more.

---

### Method Naming

**Why "Method 1, 2, 3, 4" instead of "Option 1, 2, 3, 4"?**

Avoid confusion with `system-overview.md` which uses "Option 1-4" to describe technical architecture.

**Methods** = User-facing workflows
**Options** = Technical implementation details

---

## Consequences

### Positive

**For New Users:**
- ✅ Clear path from zero to working setup
- ✅ Confidence in choosing the right method
- ✅ Less trial and error
- ✅ Faster time to productivity

**For Documentation:**
- ✅ Entry point for beginners
- ✅ Funnels users to appropriate advanced docs
- ✅ Reduces redundancy through linking
- ✅ Maintains existing comprehensive docs

**For Support:**
- ✅ Point users to numbered guides first
- ✅ Reduces common questions
- ✅ Self-service troubleshooting

### Neutral

**Documentation Maintenance:**
- ⚠️ Two more files to maintain
- ⚠️ Need to update when CLI changes
- ⚠️ Keep synchronized with package.json examples

**Mitigation:** Use version-specific docs (docs/versions/) to snapshot guide state per release.

### Negative

**Potential Redundancy:**
- ⚠️ Some overlap with getting-started.md
- ⚠️ Some overlap with advanced-usage.md

**Mitigation:**
- Cross-link between guides
- Each guide has distinct purpose
- Numbered guides = beginner-focused
- Other guides = reference/comprehensive

**Risk of Fragmentation:**
- ⚠️ Users might not know which guide to read

**Mitigation:**
- Clear naming (1-setup, 2-usage)
- README.md directs users appropriately
- Each guide links to next step

---

## Implementation

### File Structure

```
docs/guides/
├── 1-setup-guide.md          ← New (setup from scratch)
├── 2-usage-guide.md          ← New (4 methods explained)
├── getting-started.md        ← Existing (comprehensive intro)
├── advanced-usage.md         ← Existing (feature reference)
├── troubleshooting.md        ← Existing (problem solving)
└── README.md                 ← Update to point to new guides
```

### Updates to Existing Files

**docs/guides/README.md:**
```markdown
## Quick Start

New to Console Bridge?
1. [Setup Guide](./1-setup-guide.md) - Install and configure
2. [Usage Guide](./2-usage-guide.md) - Learn the 4 ways to run

Already set up? Jump to:
- [Advanced Usage](./advanced-usage.md) - All features
- [Troubleshooting](./troubleshooting.md) - Fix issues
```

**docs/versions/1.0.0.md:**
Add note about new beginner guides in v1.0.0+

---

## Examples from New Guides

### From 1-setup-guide.md

```markdown
## Step 1: Install Console Bridge Globally

Open your terminal and run:

```bash
npm install -g console-bridge
```

**Why global?** This makes the `console-bridge` command available anywhere on your system.
```

**Clear, direct, with explanations.**

---

### From 2-usage-guide.md

```markdown
## Method 3: Unified Terminal (Recommended)

**One terminal - that's it!**
```bash
cd path/to/your-project
npm run dev:debug
```

**You'll see:**
```
[0] ✓ Ready on localhost:3000
[1] 🌉 Console Bridge v1.0.0
[1] ✓ Successfully attached to process 12345
[0] ○ Compiling / ...
[1] [14:32:15] [localhost:3000] log: Page loaded
```

**See?** Dev server logs (`[0]`) and browser logs (`[1]`) all in one terminal! 🎉
```

**Visual examples showing exactly what users will see.**

---

## Success Metrics

**User Success:**
- [ ] New users complete setup without assistance
- [ ] Users understand when to use each method
- [ ] Reduced "how do I install" questions
- [ ] Increased adoption of unified terminal workflow

**Documentation Quality:**
- [ ] Guides test well with beginners
- [ ] Clear progression from setup → usage → advanced
- [ ] Low maintenance burden
- [ ] Positive user feedback

---

## Alternatives Considered

### Alternative 1: Update Existing Guides

**Approach:** Add beginner content to getting-started.md

**Rejected because:**
- getting-started.md already 287 lines
- Mixing beginner + advanced = confusing
- Harder to maintain distinct audiences

### Alternative 2: Single Combined Guide

**Approach:** One big "Setup and Usage" guide

**Rejected because:**
- Too long (800+ lines)
- Users can't find specific info quickly
- Setup and usage are distinct phases

### Alternative 3: Wiki-Style Documentation

**Approach:** Move to external wiki or docs site

**Rejected because:**
- Adds deployment complexity
- Breaks local docs access
- Adds tooling dependency
- Current markdown works well

---

## Related Documentation

- [Version 1.0.0 Documentation](../versions/1.0.0.md)
- [ADR 0002 - Version 1.0.0 Release](./0002-version-1.0.0-release.md)
- [ADR 0001 - Unified Terminal Output](./0001-unified-terminal-output.md)
- [Setup Guide](../guides/1-setup-guide.md)
- [Usage Guide](../guides/2-usage-guide.md)

---

## Version History

- **2025-10-05:** ADR created and accepted
- **2025-10-05:** Guides implemented and added to repository

---

## Notes

**Key Insight from User Feedback:**

Users needed explicit confirmation that global Console Bridge + local concurrently work together. This was not obvious from existing docs.

**Quote:**
> "is this gonna be an issue to use concurrently since our apps configured for global use but concurrently might have an issue with that due to paths and other stuff"

**Answer now in 1-setup-guide.md:**
> "Console Bridge is global → Available in PATH as `console-bridge` command
> Concurrently is local → Just runs commands, doesn't care where they come from
> It works like this: concurrently executes `console-bridge` as a shell command"

This type of explicit clarification is what makes beginner guides valuable.

---

**Contributors:**
- Guide Design & Implementation: Claude Code
- User Feedback Integration: Console Bridge Team

**License:** [Your License Here]

---

## Approval

**Status:** ✅ Accepted
**Date:** 2025-10-05
**Decision Makers:** Console Bridge Development Team

---

## Future Enhancements

Potential additions based on user feedback:

- Video walkthroughs for each method
- Interactive setup wizard
- Framework-specific quick-start repos
- VSCode extension with guided setup
- npx quick-start command
