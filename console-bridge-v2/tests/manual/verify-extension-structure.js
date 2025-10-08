/**
 * Extension Structure Verification Script
 *
 * Verifies that all required files exist and have valid structure
 * for Console Bridge v2.0.0 extension.
 *
 * This doesn't test runtime behavior, but validates:
 * - All required files present
 * - manifest.json is valid JSON
 * - JavaScript files have no syntax errors
 * - Protocol message builders are properly exported
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '../..');
const EXT_SRC = path.join(ROOT, 'extension/src');

let errors = 0;
let warnings = 0;

function log(emoji, message) {
  console.log(`${emoji} ${message}`);
}

function error(message) {
  log('❌', `ERROR: ${message}`);
  errors++;
}

function warn(message) {
  log('⚠️ ', `WARNING: ${message}`);
  warnings++;
}

function success(message) {
  log('✅', message);
}

function info(message) {
  log('ℹ️ ', message);
}

function checkFileExists(relativePath, required = true) {
  const fullPath = path.join(EXT_SRC, relativePath);
  if (fs.existsSync(fullPath)) {
    success(`File exists: ${relativePath}`);
    return true;
  } else {
    if (required) {
      error(`Missing required file: ${relativePath}`);
    } else {
      warn(`Missing optional file: ${relativePath}`);
    }
    return false;
  }
}

function validateJSON(relativePath) {
  const fullPath = path.join(EXT_SRC, relativePath);
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    const parsed = JSON.parse(content);
    success(`Valid JSON: ${relativePath}`);
    return parsed;
  } catch (err) {
    error(`Invalid JSON in ${relativePath}: ${err.message}`);
    return null;
  }
}

function validateJavaScript(relativePath) {
  const fullPath = path.join(EXT_SRC, relativePath);
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    // Basic syntax check - try to parse as function
    new Function(content);
    success(`Valid JavaScript: ${relativePath}`);
    return true;
  } catch (err) {
    error(`Syntax error in ${relativePath}: ${err.message}`);
    return false;
  }
}

function checkConsoleCapture() {
  info('\n📋 Checking console-capture.js...');
  const fullPath = path.join(EXT_SRC, 'content/console-capture.js');
  const content = fs.readFileSync(fullPath, 'utf8');

  // Check for IIFE wrapper
  if (content.includes('(function()') || content.includes('(function ()')) {
    success('IIFE wrapper found');
  } else {
    warn('IIFE wrapper not detected');
  }

  // Check for all 18 console methods
  const methods = [
    'log', 'info', 'warn', 'error', 'debug',
    'trace', 'table', 'group', 'groupCollapsed', 'groupEnd',
    'clear', 'count', 'countReset',
    'time', 'timeEnd', 'timeLog',
    'assert', 'dir', 'dirxml'
  ];

  methods.forEach(method => {
    if (content.includes(`'${method}'`)) {
      success(`Console method referenced: ${method}`);
    } else {
      warn(`Console method not found: ${method}`);
    }
  });

  // Check for key functions
  if (content.includes('function getCallLocation')) {
    success('getCallLocation function found');
  } else {
    error('getCallLocation function missing');
  }

  if (content.includes('function serializeValue')) {
    success('serializeValue function found');
  } else {
    error('serializeValue function missing');
  }

  if (content.includes('window.postMessage')) {
    success('postMessage communication found');
  } else {
    error('postMessage communication missing');
  }
}

function checkProtocol() {
  info('\n📋 Checking protocol.js...');
  const fullPath = path.join(EXT_SRC, 'lib/protocol.js');
  const content = fs.readFileSync(fullPath, 'utf8');

  // Check for exports
  const exports = [
    'buildConsoleEvent',
    'buildConnectionStatus',
    'buildError',
    'buildPing',
    'buildPong',
    'getSourceInfo',
    'getClientInfo',
    'validateMessage'
  ];

  exports.forEach(func => {
    if (content.includes(`export function ${func}`) || content.includes(`function ${func}`)) {
      success(`Protocol function found: ${func}`);
    } else {
      warn(`Protocol function not found: ${func}`);
    }
  });

  // Check for protocol version
  if (content.includes("PROTOCOL_VERSION = '1.0.0'")) {
    success('Protocol version 1.0.0 declared');
  } else {
    warn('Protocol version declaration not found or incorrect');
  }
}

function checkManifest() {
  info('\n📋 Checking manifest.json...');
  const manifest = validateJSON('manifest.json');

  if (!manifest) return;

  // Check required fields
  if (manifest.manifest_version === 3) {
    success('Manifest v3 format');
  } else {
    error('Not using Manifest v3');
  }

  if (manifest.name === 'Console Bridge') {
    success('Extension name correct');
  }

  if (manifest.version === '2.0.0') {
    success('Version 2.0.0');
  }

  if (manifest.permissions && manifest.permissions.includes('devtools')) {
    success('devtools permission declared');
  } else {
    error('devtools permission missing');
  }

  if (manifest.host_permissions && manifest.host_permissions.length > 0) {
    success('host_permissions declared');
  } else {
    warn('host_permissions missing (may cause issues)');
  }

  if (manifest.devtools_page === 'devtools/devtools.html') {
    success('devtools_page configured correctly');
  } else {
    error('devtools_page not configured');
  }

  if (manifest.web_accessible_resources) {
    success('web_accessible_resources configured');
    const resources = manifest.web_accessible_resources[0]?.resources || [];
    if (resources.includes('content/console-capture.js')) {
      success('console-capture.js is web accessible');
    } else {
      error('console-capture.js not in web_accessible_resources');
    }
  } else {
    error('web_accessible_resources missing');
  }
}

// Run all checks
console.log('🔍 Console Bridge v2.0.0 Extension Structure Verification\n');
console.log('=' .repeat(60));

info('\n📁 Checking required files...\n');

// Core files
checkFileExists('manifest.json');
checkFileExists('devtools/devtools.html');
checkFileExists('devtools/devtools.js');
checkFileExists('content/console-capture.js');
checkFileExists('lib/protocol.js');

// Panel files
checkFileExists('devtools/panel/panel.html');
checkFileExists('devtools/panel/panel.js');
checkFileExists('devtools/panel/panel.css');

// Icons (optional for now)
checkFileExists('icons/icon-16.png', false);
checkFileExists('icons/icon-48.png', false);
checkFileExists('icons/icon-128.png', false);

info('\n📝 Validating file contents...\n');

// Validate JSON
checkManifest();

// Validate JavaScript
validateJavaScript('devtools/devtools.js');
validateJavaScript('content/console-capture.js');
validateJavaScript('lib/protocol.js');

// Deep checks
checkConsoleCapture();
checkProtocol();

// Summary
console.log('\n' + '='.repeat(60));
console.log('\n📊 Verification Summary:\n');

if (errors === 0 && warnings === 0) {
  success('✨ Perfect! All checks passed.');
  success('Extension structure is complete and valid.');
  console.log('\n✅ Ready for manual testing!');
  console.log('   1. Load extension in Chrome: chrome://extensions');
  console.log('   2. Open test page: http://127.0.0.1:8000/test-page.html');
  console.log('   3. Open DevTools → Console Bridge tab');
  console.log('   4. Run tests and verify capture\n');
  process.exit(0);
} else if (errors === 0) {
  warn(`⚠️  ${warnings} warning(s) found - extension may still work`);
  console.log('\n✅ Proceed with manual testing (warnings are non-critical)\n');
  process.exit(0);
} else {
  error(`\n❌ ${errors} error(s) and ${warnings} warning(s) found`);
  console.log('\n🔧 Please fix errors before testing\n');
  process.exit(1);
}
