# Chrome Web Store Submission Checklist
# Console Bridge v2.0.0

**Date:** October 15, 2025
**Status:** Ready for Submission
**Estimated Time:** 30-45 minutes

---

## ✅ Pre-Submission (Complete)

- [x] **Subtask B.1:** Screenshots created (3 professional screenshots)
- [x] **Subtask B.2:** Extension packaged (`console-bridge-extension-v2.0.0.zip` - 16 KB)
- [x] All prerequisites met (code complete, tests passing, documentation ready)

---

## 📋 Subtask B.3: Create Developer Account (10 minutes)

### Steps:

1. **Navigate to Chrome Web Store Developer Dashboard**
   ```
   https://chrome.google.com/webstore/devconsole
   ```

2. **Sign in with Google Account**
   - Use your primary Google account
   - This will be the publisher account

3. **Accept Developer Agreement**
   - Read and accept the Chrome Web Store Developer Agreement
   - Review Chrome Web Store Program Policies

4. **Pay $5 One-Time Registration Fee**
   - Payment required before submitting extensions
   - Use credit card or Google Pay
   - Fee is non-refundable
   - One-time fee (not recurring)

5. **Verify Account Active**
   - Check that Developer Dashboard is accessible
   - Confirm "New Item" button is available

### Checklist:
- [ ] Logged into Chrome Web Store Developer Dashboard
- [ ] Developer Agreement accepted
- [ ] $5 registration fee paid
- [ ] Dashboard shows "New Item" button
- [ ] Ready to upload extension

---

## 📦 Subtask B.4: Chrome Web Store Submission (30-45 minutes)

### Step 1: Upload Extension Package

1. **Go to Developer Dashboard**
   ```
   https://chrome.google.com/webstore/devconsole
   ```

2. **Click "New Item"**
   - Blue button in top right

3. **Upload Extension Package**
   - Select file: `console-bridge-extension-v2.0.0.zip`
   - Wait for upload to complete (should be fast, only 16 KB)
   - System will analyze the package

4. **Verify Upload Success**
   - Check for any errors or warnings
   - If errors appear, fix and re-upload

### Upload Checklist:
- [ ] Clicked "New Item" button
- [ ] Selected `console-bridge-extension-v2.0.0.zip`
- [ ] Upload completed successfully
- [ ] No errors or warnings shown
- [ ] Ready to fill out store listing

---

### Step 2: Fill Out Store Listing

**Important:** Use content from `chrome-extension-poc/CHROME_WEB_STORE_LISTING.md`

#### Product Details Tab:

**Name:**
```
Console Bridge
```

**Summary:** (132 characters max)
```
Stream browser console logs to your terminal in real-time. Perfect for localhost development and debugging.
```

**Description:** (Copy from CHROME_WEB_STORE_LISTING.md)
```
Stream browser console logs directly to your terminal in real-time.

Perfect for developers working with localhost applications who want unified console output without switching between browser DevTools and terminal.

KEY FEATURES
• Real-time streaming: Console logs appear instantly in your terminal
• Comprehensive capture: Captures console.log, errors, warnings, network errors, exceptions
• Zero configuration: Install extension, run CLI, start coding
• Color-coded output: Easy-to-read terminal formatting with timestamps
• Localhost focus: Designed for local development (localhost, 127.0.0.1)
• Extension Mode: No Puppeteer required - works with your regular browser

HOW IT WORKS
1. Install Console Bridge extension from Chrome Web Store
2. Install Console Bridge CLI: npm install -g console-bridge
3. Run: console-bridge start --extension-mode
4. Open Chrome DevTools → "Console Bridge" tab
5. All console output now streams to your terminal in real-time

PERFECT FOR
• Frontend developers working with React, Vue, Angular, or vanilla JavaScript
• Full-stack developers running local API servers
• Anyone tired of switching between browser and terminal
• Developers who want unified console output in their IDE

100% FREE AND OPEN SOURCE
Source code: https://github.com/pelchers/console-bridge-v2
```

**Category:**
```
Developer Tools
```

**Language:**
```
English
```

#### Product Details Checklist:
- [ ] Name entered: "Console Bridge"
- [ ] Summary entered (132 chars max)
- [ ] Description entered (full description from CHROME_WEB_STORE_LISTING.md)
- [ ] Category set to "Developer Tools"
- [ ] Language set to "English"

---

#### Privacy Tab:

**Privacy Policy URL:**
```
https://github.com/pelchers/console-bridge-v2/blob/master/chrome-extension-poc/PRIVACY_POLICY.md
```

**Permissions Justification:**

This extension requires the following permissions:

1. **`devtools` permission:**
   - **Why needed:** Creates the "Console Bridge" DevTools panel
   - **Justification:** Required to add custom tab to Chrome DevTools for console streaming interface

2. **`http://localhost/*` and `http://127.0.0.1/*` host permissions:**
   - **Why needed:** Monitor console logs from localhost development servers
   - **Justification:** Extension is designed specifically for local development. Only requests access to localhost/127.0.0.1 domains (no access to external websites)

**Single Purpose:**
```
Stream browser console logs to terminal in real-time for localhost development and debugging.
```

#### Privacy Checklist:
- [ ] Privacy policy URL entered (GitHub link)
- [ ] devtools permission justified
- [ ] Host permissions justified (localhost only)
- [ ] Single purpose statement entered
- [ ] No collection of user data mentioned in policy

---

#### Store Listing Assets Tab:

**Icon (128x128):**
- File: `chrome-extension-poc/icons/icon128.png`
- Upload this as the main store listing icon

**Screenshots:** (Upload all 3)
1. `screenshots/01-real-time-streaming-demo.png` (476 KB)
   - Caption: "Real-time console log streaming from browser to terminal"

2. `screenshots/02-network-error-capture.png` (15 KB)
   - Caption: "Comprehensive error capture including network 404 errors"

3. `screenshots/03-extension-installed.png` (48 KB)
   - Caption: "Easy installation and setup - zero configuration required"

**Promotional Tile (440x280):** (Optional - can skip for now)
- Skip for initial submission
- Can be added later if desired

**Marquee (1400x560):** (Optional - can skip for now)
- Skip for initial submission
- Featured extensions only

#### Store Listing Assets Checklist:
- [ ] Main icon (128x128) uploaded from `icons/icon128.png`
- [ ] Screenshot 1 uploaded with caption
- [ ] Screenshot 2 uploaded with caption
- [ ] Screenshot 3 uploaded with caption
- [ ] All images verified and look professional

---

#### Pricing & Distribution Tab:

**Pricing:**
```
Free
```

**Regions:**
```
All regions
```

**Visibility:**
```
Public
```

**Target Audience:**
- Not intended for children
- No age restrictions

#### Pricing & Distribution Checklist:
- [ ] Price set to "Free"
- [ ] Distribution regions set to "All regions"
- [ ] Visibility set to "Public"
- [ ] Age restrictions: None (not for children)

---

### Step 3: Review and Submit

**Final Review Checklist:**
- [ ] All tabs completed (Product Details, Privacy, Store Listing Assets, Pricing & Distribution)
- [ ] Extension name is "Console Bridge"
- [ ] Version shows as "2.0.0" (from manifest.json)
- [ ] All 3 screenshots uploaded and displaying correctly
- [ ] Privacy policy link is working
- [ ] Permissions are justified
- [ ] Description has no typos or formatting issues
- [ ] Category is "Developer Tools"
- [ ] Pricing is "Free"
- [ ] Distribution is "Public" and "All regions"

**Submit:**
1. Click "Submit for Review" button
2. Confirm submission
3. Wait for confirmation email

#### Submission Checklist:
- [ ] Clicked "Submit for Review"
- [ ] Confirmation dialog accepted
- [ ] Confirmation email received
- [ ] Extension status shows "Pending Review"
- [ ] Submission timestamp recorded: __________

---

## ⏳ Subtask B.5: Wait for Google Approval (5-10 Business Days)

### What Happens Now:

**Google Review Process:**
- Automated checks run immediately (malware scan, policy compliance)
- Manual review by Google team (typically 5-10 business days)
- May be faster (1-3 days) or slower (up to 2 weeks) depending on queue

**Possible Outcomes:**

1. **✅ Approved** - Extension published automatically
   - Email notification: "Your item has been published"
   - Extension visible on Chrome Web Store
   - Public URL active: `https://chrome.google.com/webstore/detail/console-bridge/[EXTENSION_ID]`

2. **❌ Rejected** - Fix issues and resubmit
   - Email notification: "Your item was rejected"
   - Specific reasons provided
   - Fix issues, update package, resubmit

3. **❓ Additional Info Requested** - Respond to questions
   - Email notification: "Additional information required"
   - Respond within 7 days
   - Provide requested information

### During Waiting Period:

**Actions Required:**
- None - just wait and monitor email

**Recommended:**
- Check Developer Dashboard daily for status updates
- Monitor email for Google notifications
- Prepare for v2.0.0 GitHub release (Subtask B.6)

#### Waiting Period Checklist:
- [ ] Monitoring email daily for Google updates
- [ ] Checking Developer Dashboard for status changes
- [ ] Prepared to respond if Google requests changes
- [ ] GitHub release v2.0.0 draft prepared (optional)

---

## 📝 Subtask B.6: GitHub Release v2.0.0 (After Approval)

**Important:** Only proceed with this subtask AFTER Chrome Web Store approval email is received.

### Steps:

#### 1. Create Git Tag

```bash
cd console-bridge-v2
git checkout master
git tag -a v2.0.0 -m "Console Bridge v2.0.0 - Extension Mode Release"
git push origin v2.0.0
```

#### 2. Create GitHub Release

1. Go to GitHub repository: `https://github.com/pelchers/console-bridge-v2`
2. Navigate to "Releases" → "Create a new release"
3. **Tag:** v2.0.0
4. **Release title:** Console Bridge v2.0.0 - Extension Mode
5. **Description:** (Use release notes template from Phase B ADR)

#### 3. Attach Extension Package

- Upload `console-bridge-extension-v2.0.0.zip` as release asset
- Add Chrome Web Store link (from approval email)

#### 4. Publish Release

- Review all information
- Click "Publish release"
- Verify release appears on GitHub

#### GitHub Release Checklist:
- [ ] Git tag v2.0.0 created
- [ ] Tag pushed to GitHub
- [ ] GitHub release created
- [ ] Release title: "Console Bridge v2.0.0 - Extension Mode"
- [ ] Release notes added (with Chrome Web Store features)
- [ ] Extension .zip attached
- [ ] Chrome Web Store URL added
- [ ] Release published successfully
- [ ] Release visible on GitHub releases page

---

## ✅ Phase B Complete - Success Criteria

### All Subtasks Complete When:

- [x] **B.1 Screenshots:** 3 professional screenshots created and organized
- [x] **B.2 Package:** Extension packaged as `console-bridge-extension-v2.0.0.zip` (16 KB)
- [ ] **B.3 Developer Account:** Chrome Web Store developer account created
- [ ] **B.4 Submission:** Extension submitted to Chrome Web Store
- [ ] **B.5 Approval:** Google approves extension (email received)
- [ ] **B.6 GitHub Release:** v2.0.0 published on GitHub with Chrome Web Store link

### v2.0.0 Soft Launch Complete When:

- [ ] Extension live on Chrome Web Store
- [ ] Public listing URL active
- [ ] Users can install extension
- [ ] GitHub release v2.0.0 published
- [ ] Console Bridge v2.0.0 available to public

---

## 📞 Support & Resources

**If Submission is Rejected:**
1. Read rejection email carefully
2. Identify specific policy violations
3. Fix issues in code/listing
4. Re-package extension
5. Resubmit with explanation of changes

**Chrome Web Store Resources:**
- Developer Dashboard: https://chrome.google.com/webstore/devconsole
- Developer Program Policies: https://developer.chrome.com/docs/webstore/program-policies/
- Review Guidelines: https://developer.chrome.com/docs/webstore/review-guidelines/
- Support: https://support.google.com/chrome_webstore/

**Project Resources:**
- Phase B ADR: `.claude/adr/phase-b/phase-b-web-store-submission.md`
- Store Listing Content: `chrome-extension-poc/CHROME_WEB_STORE_LISTING.md`
- Privacy Policy: `chrome-extension-poc/PRIVACY_POLICY.md`
- Screenshot Guide: `chrome-extension-poc/SCREENSHOT_GUIDE.md`

---

## 🎯 Next Steps After Phase B

Once Phase B is complete and v2.0.0 is live on Chrome Web Store:

### v3.0.0 Planning (See `.claude/v3.0.0-IMPLEMENTATION_PLAN.md`)

**Phase 9: User Testing & Feedback Collection (2-4 weeks)**
- Monitor Chrome Web Store reviews
- Collect GitHub issues from real users
- Track user behavior and common questions

**Phase 10: Bug Fixes & Improvements (1-3 weeks)**
- Fix bugs found by users
- Implement high-demand features
- Subtask 10.7: Stack trace display configuration (toggle + --verbose flag)

**Phase 11: Public npm Launch & Marketing (1 week)**
- npm publish (after user validation via Chrome Web Store)
- Major announcement campaign (Twitter, Reddit, ProductHunt)
- Build npm reputation on battle-tested product

---

**Estimated Total Time:** 1-2 hours active work + 5-10 business days wait

**Target Launch Date:** October 29 - November 4, 2025

**Good luck with your Chrome Web Store submission!** 🚀
