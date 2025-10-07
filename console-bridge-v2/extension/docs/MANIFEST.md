# Manifest v3 Documentation - Console Bridge Extension

**Version:** 2.0.0
**Format:** Manifest v3
**Chrome Minimum:** 110

---

## Overview

The `manifest.json` file defines the Console Bridge extension's configuration, permissions, and behavior. This document explains every field and the rationale behind each choice.

---

## Complete Manifest

```json
{
  "manifest_version": 3,
  "name": "Console Bridge",
  "version": "2.0.0",
  "description": "Bridge browser console logs from localhost applications to your terminal in real-time. Monitor multiple tabs with color-coded output.",
  "permissions": ["devtools"],
  "host_permissions": ["http://localhost/*", "http://127.0.0.1/*"],
  "devtools_page": "devtools/devtools.html",
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  },
  "icons": {
    "16": "icons/icon-16.png",
    "48": "icons/icon-48.png",
    "128": "icons/icon-128.png"
  },
  "author": "Console Bridge Team",
  "homepage_url": "https://github.com/pelchers/console-bridge-v2",
  "minimum_chrome_version": "110"
}
```

---

## Field Descriptions

### `manifest_version`

**Value:** `3`
**Required:** Yes
**Type:** Integer

**Description:** Specifies Manifest v3 format.

**Why v3:**
- Manifest v2 is deprecated (Chrome 127+ won't support it)
- Required for new Chrome Web Store submissions
- Modern security model

---

### `name`

**Value:** `"Console Bridge"`
**Required:** Yes
**Type:** String (3-45 characters)

**Description:** Extension name displayed in Chrome.

**Guidelines:**
- Keep it short and descriptive
- No excessive capitalization
- No version numbers in name

---

### `version`

**Value:** `"2.0.0"`
**Required:** Yes
**Type:** String (semver format)

**Description:** Extension version number.

**Versioning Rules:**
- **MAJOR (2.x.x):** Breaking changes
- **MINOR (x.1.x):** New features, backward compatible
- **PATCH (x.x.1):** Bug fixes only

**Update Strategy:**
- Bump PATCH for bug fixes
- Bump MINOR for new features
- Bump MAJOR for protocol changes

---

### `description`

**Value:** `"Bridge browser console logs from localhost applications to your terminal in real-time. Monitor multiple tabs with color-coded output."`
**Required:** Yes
**Type:** String (< 132 characters)

**Description:** Short extension description.

**Character Count:** 130 characters (within 132 limit)

**Guidelines:**
- Clear value proposition
- Mention key features
- Under 132 characters
- No marketing fluff

---

### `permissions`

**Value:** `["devtools"]`
**Required:** Yes (for DevTools extensions)
**Type:** Array of strings

**Description:** API permissions required by extension.

#### `devtools` Permission

**Why Needed:**
- Create DevTools panel (`chrome.devtools.panels.create()`)
- Access inspected window (`chrome.devtools.inspectedWindow.eval()`)
- Listen to DevTools events

**User Impact:** Low - Standard for DevTools extensions

**Alternatives Rejected:**
- `chrome.debugger` - Too intrusive, conflicts with DevTools
- Content scripts only - Cannot create DevTools panels

---

### `host_permissions`

**Value:** `["http://localhost/*", "http://127.0.0.1/*"]`
**Required:** Yes (for WebSocket connection)
**Type:** Array of match patterns

**Description:** Hosts the extension can access.

#### Localhost-Only Access

**Why Needed:**
- WebSocket connection to CLI (`ws://localhost:9223`)
- Access localhost applications for console capture

**Why Localhost Only:**
- Minimize permission scope (security)
- Extension only works with localhost apps anyway
- No need for broader access

**Alternatives Rejected:**
- `<all_urls>` - Too broad, security risk
- No host permissions - WebSocket fails

**User Impact:** Low - Only affects localhost, not browsing

---

### `devtools_page`

**Value:** `"devtools/devtools.html"`
**Required:** Yes (for DevTools extensions)
**Type:** String (relative path)

**Description:** Entry point for DevTools integration.

**What It Does:**
- Loads when DevTools opens
- Creates "Console Bridge" panel
- Sets up extension infrastructure

---

### `content_security_policy`

**Value:**
```json
{
  "extension_pages": "script-src 'self'; object-src 'self'"
}
```
**Required:** Recommended
**Type:** Object

**Description:** Security policy for extension pages.

#### Policy Breakdown

**`script-src 'self'`**
- Only load scripts from extension itself
- No external scripts
- No inline scripts
- No `eval()`

**`object-src 'self'`**
- Only load objects from extension itself
- No external plugins

#### What This Prevents

- ❌ Inline event handlers (`<button onclick="...">`)
- ❌ Inline scripts (`<script>...</script>`)
- ❌ External script loading
- ❌ `eval()` and `new Function()`

#### Compliance

✅ **Chrome Web Store Compliant:**
- No `unsafe-inline`
- No `unsafe-eval`
- No external script sources

#### Migration Notes

**If you have inline handlers:**
```javascript
// Before (CSP violation):
<button onclick="handleClick()">Click</button>

// After (CSP compliant):
<button id="myBtn">Click</button>
<script>
  document.getElementById('myBtn').addEventListener('click', handleClick);
</script>
```

---

### `icons`

**Value:**
```json
{
  "16": "icons/icon-16.png",
  "48": "icons/icon-48.png",
  "128": "icons/icon-128.png"
}
```
**Required:** Recommended
**Type:** Object

**Description:** Extension icons for different contexts.

#### Icon Sizes

| Size | Usage |
|------|-------|
| 16x16 | Toolbar icon |
| 48x48 | Extension management page |
| 128x128 | Chrome Web Store listing |

#### Icon Requirements

- **Format:** PNG (preferred) or JPEG
- **Background:** Transparent or solid color
- **Design:** Simple, recognizable at 16x16
- **Colors:** Match brand (cyan/blue theme)

#### Placeholder Icons

**Current Status:** Placeholder README.md in `src/icons/`

**Before Production:**
- Design professional icons
- Export as PNG
- Place in `src/icons/` directory
- Test in Chrome to verify appearance

---

### `author`

**Value:** `"Console Bridge Team"`
**Required:** No
**Type:** String

**Description:** Extension author attribution.

**Purpose:**
- Attribution in Chrome Web Store
- Contact information for users
- Developer identification

---

### `homepage_url`

**Value:** `"https://github.com/pelchers/console-bridge-v2"`
**Required:** No
**Type:** String (URL)

**Description:** Extension homepage for support/documentation.

**User Benefits:**
- Find documentation
- Report issues
- Check for updates
- View source code

---

### `minimum_chrome_version`

**Value:** `"110"`
**Required:** No
**Type:** String

**Description:** Minimum Chrome version required.

**Why Chrome 110:**
- Manifest v3 full support
- Modern DevTools APIs
- WebSocket stability
- Released January 2023

**Compatibility:**
- Chrome 110+ ✅
- Chrome 109 and below ❌

---

## Permission Justifications

### For Chrome Web Store Listing

When submitting to Chrome Web Store, provide these justifications:

#### `devtools` Permission

> **Justification:** This extension creates a DevTools panel to display console logs from localhost applications. The devtools permission is required to use the chrome.devtools.panels.create() API and access the inspected window.

#### `host_permissions` for localhost

> **Justification:** This extension connects to a local CLI tool via WebSocket (ws://localhost:9223). Localhost host permissions are required for the WebSocket connection. The extension only accesses localhost URLs and does not interact with external websites.

---

## Chrome Web Store Compliance

### Checklist

- ✅ Manifest v3 format
- ✅ Description under 132 characters
- ✅ Minimal permissions (2 only)
- ✅ Strict CSP (no unsafe directives)
- ✅ Localhost-only host permissions
- ✅ Icons provided (16, 48, 128)
- ✅ Author and homepage specified
- ✅ Minimum Chrome version specified

### Common Rejection Reasons (Avoided)

- ❌ Too many permissions → ✅ Only 2 permissions
- ❌ Broad host permissions (`<all_urls>`) → ✅ Localhost only
- ❌ Unsafe CSP → ✅ Strict CSP, no unsafe directives
- ❌ Missing icons → ✅ Icons specified (placeholders for now)
- ❌ Vague description → ✅ Clear, specific description

---

## Updating the Manifest

### Version Bumps

**Bug Fix (2.0.0 → 2.0.1):**
```json
{
  "version": "2.0.1"
}
```

**New Feature (2.0.0 → 2.1.0):**
```json
{
  "version": "2.1.0"
}
```

**Breaking Change (2.0.0 → 3.0.0):**
```json
{
  "version": "3.0.0"
}
```

### Adding Permissions

**If you need a new permission:**
1. Document why it's needed (this file)
2. Add to manifest.json
3. Provide justification for Chrome Web Store
4. Test that it works
5. Update documentation

**Warning:** Adding permissions triggers re-review in Chrome Web Store

---

## Testing the Manifest

### Validation

```bash
# 1. Load extension in Chrome
chrome://extensions → Load unpacked → Select extension/src/

# 2. Check for errors
- Look for red error badges
- Check console for manifest errors

# 3. Test functionality
- Open DevTools → "Console Bridge" tab should appear
- No permission warnings
- Extension loads without errors
```

### Common Errors

**"Invalid manifest":**
- Check JSON syntax
- Validate with JSON validator
- Check field types

**"Permission warnings":**
- Review host_permissions
- May need to adjust patterns

**"CSP violations":**
- Check for inline scripts
- Use addEventListener instead of onclick
- No eval() usage

---

## Future Considerations

### Manifest v4 (Future)

**Timeline:** Unknown (Chrome team hasn't announced)

**Migration Plan:**
- Monitor Chrome extension platform blog
- Subscribe to chrome-extensions-dev mailing list
- Plan migration 6+ months before v3 sunset

### Optional Permissions (v2.1.0+)

**Potential Future Permissions:**
- `storage` - For extension settings
- `notifications` - For error alerts
- `tabs` - For multi-tab management

**Strategy:** Add only when needed, always justify

---

## Resources

- [Chrome Manifest v3 Documentation](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Manifest File Format](https://developer.chrome.com/docs/extensions/mv3/manifest/)
- [Content Security Policy](https://developer.chrome.com/docs/extensions/mv3/manifest/content_security_policy/)
- [Chrome Web Store Publishing](https://developer.chrome.com/docs/webstore/publish/)

---

**Last Updated:** October 7, 2025
**Next Review:** Before Chrome Web Store submission
