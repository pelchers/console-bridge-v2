# ADR: Repository Restructuring for Console Bridge v2.0.0

**Date:** October 20, 2025
**Status:** In Progress
**Decision Makers:** Development Team
**Related:** Phase B - Chrome Web Store Submission

---

## Context

After successfully publishing Console Bridge v2.0.0 to the Chrome Web Store on October 20, 2025, we identified a critical issue with the current repository structure that negatively impacts user experience and professional presentation.

### Current Repository State

**Repository:** `pelchers/console-bridge-v2`
**URL:** https://github.com/pelchers/console-bridge-v2

**Problems Identified:**

1. **Monorepo Confusion:**
   - Repository contains multiple unrelated projects in root directory
   - Users visiting from Chrome Web Store see confusing directory structure:
     - `agentic-interface-app/` (unrelated project)
     - `console-bridge-c-s-4.5/` (old version)
     - `console-bridge-depricated/` (deprecated version)
     - `console-bridge-v2/` (ACTUAL v2.0.0 project - buried in subdirectory)
     - `guides/`, `reference/`, `portfolio-test/`, `testing/` (misc content)

2. **Privacy Policy URL Complexity:**
   - Current URL: `https://github.com/pelchers/console-bridge-v2/blob/master/console-bridge-v2/chrome-extension-poc/PRIVACY_POLICY.md`
   - Nested path: repo → `console-bridge-v2/` subdirectory → `chrome-extension-poc/` subdirectory
   - Confusing for users and Chrome Web Store reviewers

3. **Unprofessional First Impression:**
   - Users expect focused, clean repository for a published Chrome extension
   - Current structure appears disorganized and experimental
   - Reduces trust and perceived quality

4. **Chrome Web Store Marketing Mismatch:**
   - Store listing claims "100% FREE AND OPEN SOURCE"
   - Links to repository with multiple projects and deprecated code
   - Users cannot easily find or evaluate the actual extension source code

### Branch State Before Restructuring

**Active Branches:**
- `master` - Current production code (just merged Phase B deliverables)
- `pre-chrome-store-release-2.0.0` - Release preparation branch
- `sp-terminal-streaming-working-via-extension` - Stable production branch
- `phase-b-web-store-submission` - Chrome Web Store submission work

**All branches need to be synced before migration.**

---

## Decision

**We will create a new, clean, focused repository for Console Bridge v2.0.0.**

### New Repository Specifications

**Repository Name:** `pelchers/console-bridge-2`
**URL:** `https://github.com/pelchers/console-bridge-2` (to be created)
**Purpose:** Single-purpose repository for Console Bridge extension and CLI

**Structure:**
```
pelchers/console-bridge-2/
├── .claude/                 # Project configuration and ADRs
├── chrome-extension-poc/    # Extension source (keep original name)
│   ├── icons/
│   ├── devtools.html
│   ├── devtools.js
│   ├── panel.html
│   ├── panel.js
│   ├── manifest.json
│   ├── PRIVACY_POLICY.md
│   └── README.md
├── src/                     # CLI source (keep original structure)
│   ├── commands/
│   ├── core/
│   ├── services/
│   ├── utils/
│   └── formatters/
├── bin/                     # CLI executables
├── docs/                    # Documentation
├── examples/                # Usage examples
├── screenshots/             # Chrome Web Store assets
├── tests/                   # Test suites
├── .gitignore
├── .npmignore
├── CHANGELOG.md
├── LICENSE                  # Proprietary source-available license
├── README.md                # Clean, focused README
└── package.json             # npm package configuration
```

**What Gets Migrated:**
- ✅ All source code from `console-bridge-v2/` subdirectory of monorepo
- ✅ LICENSE (proprietary source-available)
- ✅ Documentation from `console-bridge-v2/` subdirectory
- ✅ Phase B deliverables (screenshots, ADRs, checklists)
- ✅ Git history for v2.0.0 work (via selected branch migration)

**What Gets LEFT BEHIND:**
- ❌ `agentic-interface-app/`
- ❌ `console-bridge-c-s-4.5/`
- ❌ `console-bridge-depricated/`
- ❌ `guides/`, `reference/`, `portfolio-test/`, `testing/`
- ❌ Unrelated experimental code

---

## Migration Plan

### Phase 1: Prepare Current Repository (BEFORE Migration)

**Step 1.1: Create This ADR**
- Document the restructuring decision
- Commit to `master` branch

**Step 1.2: Sync All Branches**
- Ensure `master`, `pre-chrome-store-release-2.0.0`, and `sp-terminal-streaming-working-via-extension` are synced
- All branches should have identical state with Phase B deliverables
- Push all branches to remote as backup

**Step 1.3: Verify Current State**
- Confirm all Phase B deliverables are committed:
  - ✅ Screenshots (3 files in `screenshots-webstore/`)
  - ✅ Extension package (`console-bridge-extension-v2.0.0.zip`)
  - ✅ Phase B ADR
  - ✅ Chrome Web Store checklist
  - ✅ Privacy policy
  - ✅ Extension source code (v2.0.0)

### Phase 2: Create New Repository

**Step 2.1: User Creates GitHub Repository**
- User creates new repo: `pelchers/console-bridge-2`
- Visibility: Public
- No initialization (no README, .gitignore, LICENSE - we'll push our own)

**Step 2.2: Prepare Clean Local Repository**
- Copy `console-bridge-v2/` subdirectory from monorepo to new local directory
- Source: `C:\Claude\console-bridge-v2\console-bridge-v2\` (subdirectory inside monorepo)
- Destination: `C:\Claude\console-bridge-2\` (new directory at same level as monorepo)
- Keep original directory structure (no renaming):
  - `chrome-extension-poc/` stays as-is
  - `src/` stays as-is
  - All files and folders copied exactly
- Initialize fresh git repository in `C:\Claude\console-bridge-2\`
- No connection to old monorepo git history

**Step 2.3: Create Initial Branches**
- Create `master` branch (default, production-ready)
- Create `pre-chrome-store-release-2.0.0` branch (matches old branch name for continuity)
- Both branches have identical content initially

### Phase 3: Push to New Repository

**Step 3.1: Push All Branches**
- Push `master` branch to new repo
- Push `pre-chrome-store-release-2.0.0` branch
- Verify both branches are visible on GitHub

**Step 3.2: Create v2.0.0 Release**
- Create git tag `v2.0.0` on `master` branch
- Push tag to GitHub
- Create GitHub Release:
  - Title: "Console Bridge v2.0.0 - Chrome Web Store Launch"
  - Tag: `v2.0.0`
  - Body: Release notes with Chrome Web Store URL
  - Attachments: `console-bridge-extension-v2.0.0.zip`

### Phase 4: Update Chrome Web Store Listing

**Step 4.1: Update URLs in Chrome Web Store**
- Navigate to Developer Dashboard
- Edit Console Bridge listing
- Update URLs:

**OLD URLs:**
```
Privacy Policy: https://github.com/pelchers/console-bridge-v2/blob/master/console-bridge-v2/chrome-extension-poc/PRIVACY_POLICY.md
Homepage: https://github.com/pelchers/console-bridge-v2
Support: https://github.com/pelchers/console-bridge-v2/issues
```

**NEW URLs:**
```
Privacy Policy: https://github.com/pelchers/console-bridge-2/blob/master/chrome-extension-poc/PRIVACY_POLICY.md
Homepage: https://github.com/pelchers/console-bridge-2
Support: https://github.com/pelchers/console-bridge-2/issues
```

**Step 4.2: Save Changes**
- Chrome Web Store allows minor updates without re-review
- URL changes typically don't trigger full review
- Changes take effect immediately

### Phase 5: Manage Git Remotes

**Step 5.1: Two Separate Working Directories**
After migration, we'll have two distinct local directories:

**Monorepo (keep as-is):**
- Location: `C:\Claude\console-bridge-v2\`
- Connected to: `pelchers/console-bridge-v2` (monorepo remote)
- Purpose: Archive, reference, old development work
- Status: Keep but no active v2.0.0 development

**New Clean Repo:**
- Location: `C:\Claude\console-bridge-2\`
- Connected to: `pelchers/console-bridge-2` (new clean remote)
- Purpose: All future Console Bridge v2.0.0+ development
- Status: Active development directory

**Step 5.2: Working Strategy**
- **Future development:** Work in `C:\Claude\console-bridge-2\`
- **Monorepo:** Keep `C:\Claude\console-bridge-v2\` as archive
- **No remote mixing:** Each directory connected to only one remote
- **Clean separation:** No git submodules or nested repos

**Step 5.3: No Git Remote Confusion**
- Monorepo (`console-bridge-v2\`) pushes ONLY to `pelchers/console-bridge-v2`
- New repo (`console-bridge-2\`) pushes ONLY to `pelchers/console-bridge-2`
- Clean, simple, no risk of pushing to wrong remote

---

## Benefits

### User Experience
- ✅ Clean, focused repository when visiting from Chrome Web Store
- ✅ Easy to find extension source code
- ✅ Professional first impression
- ✅ Simpler privacy policy URL
- ✅ Clear project scope and purpose

### Developer Experience
- ✅ Focused development environment
- ✅ No confusion about which directory contains current code
- ✅ Easier for contributors to understand project structure
- ✅ Clean git history going forward
- ✅ Professional repository for portfolio/resume

### Business/Marketing
- ✅ Trustworthy appearance for potential users
- ✅ Easier to market and share
- ✅ Clear separation from experimental/deprecated code
- ✅ Better SEO and discoverability
- ✅ Aligns with "source-available" positioning

### Technical
- ✅ Cleaner CI/CD setup (if implemented later)
- ✅ Simpler package publishing to npm
- ✅ Reduced repository size
- ✅ Better git performance
- ✅ Easier to manage releases

---

## Risks and Mitigations

### Risk 1: Chrome Web Store URL Change Triggers Re-Review
**Likelihood:** Low
**Impact:** Medium (3-5 day delay)

**Mitigation:**
- URL changes are typically "minor updates" that don't require re-review
- Privacy policy content remains identical
- Extension package remains identical
- If review is triggered, approval should be fast (no code changes)

### Risk 2: Broken Links During Transition
**Likelihood:** Medium
**Impact:** Low (temporary)

**Mitigation:**
- Update all URLs simultaneously
- Keep old repository public as archive (links still work, just redirect to new repo)
- Test all new URLs before saving Chrome Web Store changes

### Risk 3: Lost Git History
**Likelihood:** Low
**Impact:** Medium

**Mitigation:**
- Old repository remains accessible with full history
- New repository starts fresh with v2.0.0 tag
- Can reference old repo commits if needed for archaeology

### Risk 4: User Confusion (Multiple Repos)
**Likelihood:** Medium
**Impact:** Low

**Mitigation:**
- Add clear README to old repo: "Archived - See new repo at pelchers/console-bridge"
- Archive old repository on GitHub (prevents new issues/PRs)
- Redirect in old repo README

### Risk 5: Multi-Remote Git Complexity
**Likelihood:** Medium
**Impact:** Low

**Mitigation:**
- Clear documentation of remote strategy
- Use descriptive remote names (`console-bridge` vs `origin`)
- Default to new remote for all future work

---

## Success Criteria

**Phase 1 Complete:**
- ✅ ADR committed
- ✅ All branches synced
- ✅ All branches pushed to old repo (backup)

**Phase 2 Complete:**
- ✅ New GitHub repo created
- ✅ Clean local repository structure prepared

**Phase 3 Complete:**
- ✅ All branches pushed to new repo
- ✅ v2.0.0 release created on new repo
- ✅ GitHub release includes Chrome Web Store URL

**Phase 4 Complete:**
- ✅ Chrome Web Store URLs updated
- ✅ Privacy policy URL works
- ✅ Homepage URL works
- ✅ Support URL works

**Phase 5 Complete:**
- ✅ Git remotes configured correctly
- ✅ Can push to new repo
- ✅ Can reference old repo if needed

**Overall Success:**
- ✅ Users visiting from Chrome Web Store see clean, professional repository
- ✅ Privacy policy URL is simple and accessible
- ✅ v2.0.0 release is published on new repo
- ✅ Extension remains live and functional throughout transition
- ✅ No disruption to users

---

## Timeline

**Total Duration:** 30-45 minutes

**Phase 1: Prepare Current Repository** (10 min)
- 5 min: Create and commit ADR
- 5 min: Sync and push branches

**Phase 2: Create New Repository** (10 min)
- 2 min: User creates GitHub repo
- 8 min: Prepare clean local structure

**Phase 3: Push to New Repository** (10 min)
- 5 min: Push branches and verify
- 5 min: Create v2.0.0 release

**Phase 4: Update Chrome Web Store** (5 min)
- Update 3 URLs
- Save changes
- Verify links work

**Phase 5: Configure Remotes** (5 min)
- Add new remote
- Test push/pull
- Document strategy

---

## Alternatives Considered

### Alternative 1: Clean Up Existing Repository
**Description:** Delete unrelated directories from `pelchers/console-bridge-v2`, move `console-bridge-v2/` subdirectory contents to root.

**Pros:**
- No URL changes needed
- Simpler migration

**Cons:**
- Git history remains cluttered with unrelated projects
- Repository name still says "v2" (what happens at v3?)
- Messy commit history visible to users
- Doesn't solve professional presentation issue

**Decision:** Rejected - fresh start is cleaner

### Alternative 2: Keep Monorepo, Add Better README
**Description:** Add clear README explaining monorepo structure, keep everything as-is.

**Pros:**
- No migration work
- Keep all projects together

**Cons:**
- Still confusing for users visiting from Chrome Web Store
- Doesn't solve privacy policy URL complexity
- Still unprofessional appearance
- Mixes unrelated projects

**Decision:** Rejected - doesn't solve core problems

### Alternative 3: Use Git Subtree/Filter-Branch to Preserve History
**Description:** Use advanced git techniques to extract `console-bridge-v2/` subdirectory with full history.

**Pros:**
- Preserves complete git history
- Single linear history in new repo

**Cons:**
- Complex git operations (high risk of errors)
- Time-consuming
- v2.0.0 is a clean milestone - fresh start is appropriate
- Old history still available in old repo if needed

**Decision:** Rejected - unnecessary complexity for v2.0.0 launch

---

## Post-Migration Actions

### Immediate (Day 1)
- ✅ Update personal bookmarks to new repo
- ✅ Test all Chrome Web Store links
- ✅ Share new repo URL with any stakeholders

### Short-term (Week 1)
- Add archive notice to old repository README
- Consider archiving old repository on GitHub
- Update any external documentation/links

### Long-term (Month 1)
- Monitor Chrome Web Store for any issues
- Gather user feedback on new repo structure
- Consider adding GitHub Pages for documentation (optional)

---

## Related Documents

- Phase B ADR: `.claude/adr/phase-b/phase-b-web-store-submission.md`
- Chrome Web Store Checklist: `CHROME_WEB_STORE_SUBMISSION_CHECKLIST.md`
- Privacy Policy: `chrome-extension-poc/PRIVACY_POLICY.md`
- v2.0.0 Implementation Plan: `.claude/adr/v2.0.0/implementation-plan.md`

---

## Approval

**Decision Date:** October 20, 2025
**Approved By:** Development Team
**Implementation Start:** October 20, 2025 (immediately)

---

## Status Log

**October 20, 2025 - Decision Made**
- Identified monorepo confusion issue
- Decided to create new clean repository
- Documented migration plan in this ADR

**October 20, 2025 - Phase 1 Started**
- Created this ADR
- Ready to sync branches and begin migration

---

**END OF ADR**
