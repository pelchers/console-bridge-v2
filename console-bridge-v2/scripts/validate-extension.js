#!/usr/bin/env node

/**
 * Extension Validation Script
 *
 * Validates that the Console Bridge Chrome extension is ready for deployment:
 * - manifest.json is valid JSON
 * - All required files exist
 * - Icons are present and correctly sized
 * - File paths match manifest references
 */

const fs = require('fs');
const path = require('path');

// Extension directory
const EXTENSION_DIR = path.join(__dirname, '..', 'chrome-extension-poc');

// Validation results
const results = {
  passed: [],
  failed: [],
  warnings: []
};

/**
 * Log test result
 */
function test(description, condition, errorMessage = null) {
  if (condition) {
    results.passed.push(description);
    console.log(`✓ ${description}`);
  } else {
    results.failed.push(description);
    console.log(`✗ ${description}`);
    if (errorMessage) {
      console.log(`  ${errorMessage}`);
    }
  }
}

/**
 * Log warning
 */
function warn(description) {
  results.warnings.push(description);
  console.log(`⚠ ${description}`);
}

/**
 * Check if file exists
 */
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * Get file size in bytes
 */
function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  return stats.size;
}

/**
 * Format file size
 */
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

/**
 * Main validation
 */
function validate() {
  console.log('🔍 Validating Console Bridge Extension...\n');

  // 1. Check manifest.json exists and is valid JSON
  console.log('📋 Checking manifest.json...');
  const manifestPath = path.join(EXTENSION_DIR, 'manifest.json');
  test(
    'manifest.json exists',
    fileExists(manifestPath),
    `File not found: ${manifestPath}`
  );

  let manifest = null;
  try {
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    manifest = JSON.parse(manifestContent);
    test('manifest.json is valid JSON', true);
  } catch (error) {
    test('manifest.json is valid JSON', false, error.message);
    return; // Can't continue without valid manifest
  }

  // 2. Check manifest fields
  console.log('\n📝 Checking manifest fields...');
  test('manifest has name', !!manifest.name, 'Missing "name" field');
  test('manifest has version', !!manifest.version, 'Missing "version" field');
  test('manifest has description', !!manifest.description, 'Missing "description" field');
  test('manifest has manifest_version', manifest.manifest_version === 3, 'Should be Manifest V3');

  // Check production-ready values
  test(
    'name is production-ready',
    manifest.name === 'Console Bridge',
    `Name should be "Console Bridge", got "${manifest.name}"`
  );
  test(
    'version is production-ready',
    manifest.version !== '2.0.0-poc',
    'Version should not be "-poc" suffix'
  );

  // 3. Check icon files
  console.log('\n🎨 Checking icon files...');
  if (manifest.icons) {
    const requiredSizes = ['16', '48', '128'];
    requiredSizes.forEach(size => {
      if (manifest.icons[size]) {
        const iconPath = path.join(EXTENSION_DIR, manifest.icons[size]);
        test(
          `Icon ${size}x${size} exists`,
          fileExists(iconPath),
          `File not found: ${iconPath}`
        );

        if (fileExists(iconPath)) {
          const fileSize = getFileSize(iconPath);
          console.log(`  Size: ${formatSize(fileSize)}`);

          // Warn if icon is too large
          if (fileSize > 100 * 1024) {
            warn(`Icon ${size}x${size} is large (${formatSize(fileSize)}), consider optimizing`);
          }
        }
      } else {
        test(`Icon ${size}x${size} defined in manifest`, false, `Missing icons.${size} in manifest`);
      }
    });
  } else {
    test('manifest has icons', false, 'Missing "icons" field in manifest');
  }

  // 4. Check required extension files
  console.log('\n📂 Checking extension files...');
  const requiredFiles = [
    'devtools.html',
    'devtools.js',
    'panel.html',
    'panel.js'
  ];

  requiredFiles.forEach(file => {
    const filePath = path.join(EXTENSION_DIR, file);
    test(
      `${file} exists`,
      fileExists(filePath),
      `File not found: ${filePath}`
    );
  });

  // 5. Check optional but important files
  console.log('\n📄 Checking documentation files...');
  const optionalFiles = [
    'README.md',
    'PRIVACY_POLICY.md',
    'CHROME_WEB_STORE_LISTING.md',
    'icons/ICONS_NEEDED.md',
    'SCREENSHOT_GUIDE.md'
  ];

  optionalFiles.forEach(file => {
    const filePath = path.join(EXTENSION_DIR, file);
    const exists = fileExists(filePath);
    if (exists) {
      console.log(`✓ ${file} exists`);
    } else {
      warn(`${file} not found (optional but recommended)`);
    }
  });

  // 6. Check permissions
  console.log('\n🔒 Checking permissions...');
  if (manifest.permissions) {
    console.log(`  Permissions: ${manifest.permissions.join(', ')}`);
    test('Has devtools permission', manifest.permissions.includes('devtools'));
  } else {
    test('Has permissions defined', false, 'Missing "permissions" field');
  }

  if (manifest.host_permissions) {
    console.log(`  Host permissions: ${manifest.host_permissions.join(', ')}`);
    test(
      'Host permissions are localhost-only',
      manifest.host_permissions.every(p =>
        p.includes('localhost') || p.includes('127.0.0.1')
      ),
      'Extension should only request localhost permissions'
    );
  }

  // 7. Check for common issues
  console.log('\n🔍 Checking for common issues...');
  const description = manifest.description || '';
  test(
    'Description length is valid',
    description.length <= 132,
    `Description is ${description.length} chars (max 132 for Chrome Web Store)`
  );

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Validation Summary:');
  console.log(`  ✓ Passed: ${results.passed.length}`);
  console.log(`  ✗ Failed: ${results.failed.length}`);
  console.log(`  ⚠ Warnings: ${results.warnings.length}`);
  console.log('='.repeat(60));

  if (results.failed.length === 0) {
    console.log('\n✅ Extension validation passed!');
    console.log('\nNext steps:');
    console.log('1. Load extension in Chrome: chrome://extensions → Load unpacked');
    console.log('2. Test all functionality');
    console.log('3. Capture screenshots for Chrome Web Store');
    console.log('4. Submit to Chrome Web Store');
    return 0;
  } else {
    console.log('\n❌ Extension validation failed!');
    console.log('\nFailed tests:');
    results.failed.forEach(failure => {
      console.log(`  - ${failure}`);
    });
    return 1;
  }
}

// Run validation
if (require.main === module) {
  const exitCode = validate();
  process.exit(exitCode);
}

module.exports = { validate };
