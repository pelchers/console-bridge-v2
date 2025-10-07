/**
 * Validation script for Chrome Extension POC
 *
 * This script validates the Chrome DevTools API POC structure and code
 * without launching a browser. It checks:
 * 1. Extension manifest structure
 * 2. Required files exist
 * 3. DevTools API usage in code
 * 4. WebSocket connection logic
 */

const fs = require('fs');
const path = require('path');

function validatePOC() {
  console.log('🔍 Validating Chrome Extension POC\n');

  const results = {
    passed: [],
    failed: [],
    warnings: []
  };

  // Test 1: Manifest validation
  console.log('📋 Test 1: Manifest Validation');
  try {
    const manifestPath = path.join(__dirname, 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    // Check manifest version
    if (manifest.manifest_version === 3) {
      results.passed.push('✅ Manifest v3 format');
    } else {
      results.failed.push('❌ Invalid manifest version');
    }

    // Check permissions
    if (manifest.permissions && manifest.permissions.includes('devtools')) {
      results.passed.push('✅ DevTools permission declared');
    } else {
      results.failed.push('❌ Missing devtools permission');
    }

    // Check host permissions
    if (manifest.host_permissions) {
      results.passed.push('✅ Host permissions configured');
    } else {
      results.warnings.push('⚠️  No host permissions (optional)');
    }

    // Check devtools page
    if (manifest.devtools_page === 'devtools.html') {
      results.passed.push('✅ DevTools page configured');
    } else {
      results.failed.push('❌ DevTools page not configured');
    }

  } catch (error) {
    results.failed.push(`❌ Manifest error: ${error.message}`);
  }
  console.log();

  // Test 2: Required files
  console.log('📁 Test 2: Required Files');
  const requiredFiles = [
    'devtools.html',
    'devtools.js',
    'panel.html',
    'panel.js',
    'README.md'
  ];

  requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      results.passed.push(`✅ ${file} exists (${stats.size} bytes)`);
    } else {
      results.failed.push(`❌ Missing required file: ${file}`);
    }
  });
  console.log();

  // Test 3: DevTools API usage
  console.log('🔌 Test 3: DevTools API Usage');
  try {
    const devtoolsJs = fs.readFileSync(path.join(__dirname, 'devtools.js'), 'utf8');
    const panelJs = fs.readFileSync(path.join(__dirname, 'panel.js'), 'utf8');

    // Check for DevTools API calls
    if (devtoolsJs.includes('chrome.devtools.panels.create')) {
      results.passed.push('✅ DevTools panel creation API used');
    } else {
      results.failed.push('❌ Missing DevTools panel creation');
    }

    if (panelJs.includes('chrome.devtools.inspectedWindow.eval')) {
      results.passed.push('✅ DevTools inspectedWindow API used');
    } else {
      results.failed.push('❌ Missing inspectedWindow.eval usage');
    }

    // Check for console method overrides
    const consoleMethods = ['log', 'info', 'warn', 'error', 'debug'];
    let foundMethods = 0;
    consoleMethods.forEach(method => {
      if (panelJs.includes(`console.${method}`)) {
        foundMethods++;
      }
    });

    if (foundMethods >= 5) {
      results.passed.push(`✅ Console methods captured (${foundMethods}/5)`);
    } else {
      results.warnings.push(`⚠️  Only ${foundMethods}/5 console methods found`);
    }

  } catch (error) {
    results.failed.push(`❌ Code analysis error: ${error.message}`);
  }
  console.log();

  // Test 4: WebSocket connection logic
  console.log('🌐 Test 4: WebSocket Connection Logic');
  try {
    const panelJs = fs.readFileSync(path.join(__dirname, 'panel.js'), 'utf8');

    if (panelJs.includes('new WebSocket')) {
      results.passed.push('✅ WebSocket client initialization');
    } else {
      results.failed.push('❌ Missing WebSocket initialization');
    }

    if (panelJs.includes('ws://localhost:9223')) {
      results.passed.push('✅ WebSocket URL configured (ws://localhost:9223)');
    } else {
      results.warnings.push('⚠️  WebSocket URL may not match specification');
    }

    // Check for connection handlers
    const handlers = ['onopen', 'onclose', 'onerror', 'onmessage'];
    let foundHandlers = 0;
    handlers.forEach(handler => {
      if (panelJs.includes(handler)) {
        foundHandlers++;
      }
    });

    if (foundHandlers >= 3) {
      results.passed.push(`✅ WebSocket event handlers (${foundHandlers}/4)`);
    } else {
      results.warnings.push(`⚠️  Missing WebSocket handlers (${foundHandlers}/4)`);
    }

  } catch (error) {
    results.failed.push(`❌ WebSocket analysis error: ${error.message}`);
  }
  console.log();

  // Test 5: Object serialization
  console.log('📦 Test 5: Object Serialization');
  try {
    const panelJs = fs.readFileSync(path.join(__dirname, 'panel.js'), 'utf8');

    if (panelJs.includes('serializeConsoleArgs') || panelJs.includes('serialize')) {
      results.passed.push('✅ Object serialization function exists');
    } else {
      results.warnings.push('⚠️  No explicit serialization function');
    }

    // Check for circular reference handling
    if (panelJs.includes('circular') || panelJs.includes('WeakSet') || panelJs.includes('seen')) {
      results.passed.push('✅ Circular reference handling');
    } else {
      results.warnings.push('⚠️  Circular reference handling may be missing');
    }

  } catch (error) {
    results.failed.push(`❌ Serialization analysis error: ${error.message}`);
  }
  console.log();

  // Print summary
  console.log('=' .repeat(60));
  console.log('📊 VALIDATION SUMMARY\n');

  console.log('✅ Passed Tests:');
  results.passed.forEach(msg => console.log(`   ${msg}`));
  console.log();

  if (results.warnings.length > 0) {
    console.log('⚠️  Warnings:');
    results.warnings.forEach(msg => console.log(`   ${msg}`));
    console.log();
  }

  if (results.failed.length > 0) {
    console.log('❌ Failed Tests:');
    results.failed.forEach(msg => console.log(`   ${msg}`));
    console.log();
  }

  console.log('=' .repeat(60));
  console.log();

  const totalTests = results.passed.length + results.failed.length;
  const passRate = ((results.passed.length / totalTests) * 100).toFixed(1);

  console.log(`📈 Pass Rate: ${results.passed.length}/${totalTests} (${passRate}%)`);
  console.log(`⚠️  Warnings: ${results.warnings.length}`);
  console.log();

  if (results.failed.length === 0) {
    console.log('✅ POC VALIDATION PASSED!');
    console.log();
    console.log('📝 Next Steps:');
    console.log('   1. Manual testing required - load extension in Chrome');
    console.log('   2. Verify DevTools panel appears');
    console.log('   3. Test WebSocket connection to CLI');
    console.log('   4. Validate console capture functionality');
    console.log();
    return 0;
  } else {
    console.log('❌ POC VALIDATION FAILED');
    console.log('   Please fix the errors above before proceeding.');
    console.log();
    return 1;
  }
}

// Run validation
const exitCode = validatePOC();
process.exit(exitCode);
