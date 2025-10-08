/**
 * Automated test for Console Bridge extension
 *
 * This script uses Puppeteer to:
 * 1. Launch Chrome with the extension loaded
 * 2. Navigate to the test page
 * 3. Execute console commands
 * 4. Verify capture works
 */

const puppeteer = require('puppeteer');
const path = require('path');

async function testExtension() {
  console.log('🚀 Starting Console Bridge extension test...\n');

  // Path to extension
  const extensionPath = path.join(__dirname, 'extension', 'src');
  console.log('📁 Extension path:', extensionPath);

  // Launch Chrome with extension
  console.log('🌐 Launching Chrome with extension...');
  const browser = await puppeteer.launch({
    headless: false, // Must be false to load extensions
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  const page = await browser.newPage();

  // Set up console listener
  const capturedEvents = [];
  page.on('console', msg => {
    const text = msg.text();
    console.log(`📝 Console [${msg.type()}]:`, text);

    // Check for Console Bridge events
    if (text.includes('[Console Bridge]')) {
      capturedEvents.push(text);
    }
  });

  // Navigate to test page
  console.log('\n📄 Navigating to test page...');
  await page.goto('http://127.0.0.1:8000/test-page.html', {
    waitUntil: 'networkidle0'
  });

  // Wait a bit for extension to inject
  await page.waitForTimeout(2000);

  console.log('\n🧪 Running console method tests...\n');

  // Test 1: Basic console.log
  console.log('Test 1: console.log with string');
  await page.evaluate(() => {
    console.log('Test message from automated test');
  });
  await page.waitForTimeout(500);

  // Test 2: Multiple arguments
  console.log('Test 2: console.log with multiple arguments');
  await page.evaluate(() => {
    console.log('String:', 42, true, { test: 'object' });
  });
  await page.waitForTimeout(500);

  // Test 3: console.warn
  console.log('Test 3: console.warn');
  await page.evaluate(() => {
    console.warn('This is a warning');
  });
  await page.waitForTimeout(500);

  // Test 4: console.error
  console.log('Test 4: console.error');
  await page.evaluate(() => {
    console.error('This is an error');
  });
  await page.waitForTimeout(500);

  // Test 5: Object serialization
  console.log('Test 5: Object serialization');
  await page.evaluate(() => {
    console.log('Object:', { name: 'Test', nested: { value: 123 } });
  });
  await page.waitForTimeout(500);

  // Test 6: Array serialization
  console.log('Test 6: Array serialization');
  await page.evaluate(() => {
    console.log('Array:', [1, 2, 3, 'four', { five: 5 }]);
  });
  await page.waitForTimeout(500);

  // Test 7: Error object
  console.log('Test 7: Error object');
  await page.evaluate(() => {
    try {
      throw new Error('Test error message');
    } catch (error) {
      console.error('Caught error:', error);
    }
  });
  await page.waitForTimeout(500);

  // Test 8: Function
  console.log('Test 8: Function');
  await page.evaluate(() => {
    function testFunction() {}
    console.log('Function:', testFunction);
  });
  await page.waitForTimeout(500);

  // Test 9: DOM element
  console.log('Test 9: DOM element');
  await page.evaluate(() => {
    console.log('DOM element:', document.body);
  });
  await page.waitForTimeout(500);

  // Test 10: Null and undefined
  console.log('Test 10: Null and undefined');
  await page.evaluate(() => {
    console.log('Null:', null, 'Undefined:', undefined);
  });
  await page.waitForTimeout(500);

  // Check for Console Bridge initialization
  console.log('\n📊 Test Results:\n');
  console.log('Captured Console Bridge events:', capturedEvents.length);
  capturedEvents.forEach((event, i) => {
    console.log(`  ${i + 1}. ${event}`);
  });

  // Check if extension injected
  const injected = capturedEvents.some(e => e.includes('Console capture active'));
  console.log('\n✅ Extension injected:', injected ? 'YES' : 'NO');

  if (injected) {
    console.log('✅ Console Bridge extension is working!');
  } else {
    console.log('❌ Console Bridge extension may not have injected properly');
  }

  console.log('\n⏳ Keeping browser open for manual inspection...');
  console.log('   Press Ctrl+C to close when done.\n');

  // Keep browser open for manual inspection
  // Don't close automatically
  // await browser.close();
}

// Run tests
testExtension().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
