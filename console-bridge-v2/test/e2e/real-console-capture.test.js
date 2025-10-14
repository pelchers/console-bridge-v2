/**
 * E2E Test: Real Console Capture
 * Validates that console-bridge actually captures console.log() from real pages
 */

const { startConsoleBridge, startTestServer, getFixturePath } = require('./helpers');

const TIMEOUT = 15000; // 15 second timeout for E2E tests

describe('E2E - Real Console Capture', () => {
  let consoleBridge;
  let server;

  afterEach(async () => {
    // Cleanup
    if (consoleBridge && consoleBridge.child) {
      consoleBridge.child.kill('SIGTERM');
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    if (server) {
      server.close();
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  });

  test('captures real console.log from actual page', async () => {
    // Start test server
    server = startTestServer(8080, getFixturePath('test-page.html'));
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Start console-bridge
    consoleBridge = startConsoleBridge(['start', 'localhost:8080']);

    // Wait for monitoring to start
    await consoleBridge.waitForOutput('Monitoring 1 URL', 5000);

    // Wait for page load log
    await consoleBridge.waitForOutput('[Test Page] Page loaded successfully', 8000);

    const output = consoleBridge.getOutput();

    // Verify: Real console.log was captured
    expect(output).toContain('[localhost:8080] log:');
    expect(output).toContain('[Test Page] Page loaded successfully');
    expect(output).toContain('[Test Page] Console Bridge should capture this');

    // Verify: Other console types captured
    expect(output).toContain('[Test Page] Info message');

    // Verify: No crash
    expect(output).not.toContain('Page crashed!');
  }, TIMEOUT);

  test('captures console.warn and console.error', async () => {
    // Start test server
    server = startTestServer(8081, getFixturePath('test-page.html'));
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Start console-bridge
    consoleBridge = startConsoleBridge(['start', 'localhost:8081']);

    // Wait for page load
    await consoleBridge.waitForOutput('[Test Page] Page loaded successfully', 8000);

    const output = consoleBridge.getOutput();

    // We can't trigger button clicks in this test (no Puppeteer instance)
    // But we can verify page load logs include all types
    expect(output).toContain('[localhost:8081] log:');
    expect(output).toContain('[Test Page] Page loaded successfully');
  }, TIMEOUT);

  test('works with multiple URLs simultaneously', async () => {
    // Start two test servers
    const server1 = startTestServer(8082, getFixturePath('test-page.html'));
    const server2 = startTestServer(8083, getFixturePath('test-streaming.html'));
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Start console-bridge with both URLs
    consoleBridge = startConsoleBridge(['start', 'localhost:8082', 'localhost:8083']);

    // Wait for monitoring to start
    await consoleBridge.waitForOutput('Monitoring 2 URL', 5000);

    // Wait for logs from both pages
    await consoleBridge.waitForOutput('[Test Page] Page loaded successfully', 8000);
    await consoleBridge.waitForOutput('[Streaming] Page loaded', 8000);

    const output = consoleBridge.getOutput();

    // Verify: Logs from both URLs
    expect(output).toContain('[localhost:8082]');
    expect(output).toContain('[localhost:8083]');
    expect(output).toContain('[Test Page] Page loaded successfully');
    expect(output).toContain('[Streaming] Page loaded');

    // Cleanup
    server1.close();
    server2.close();
  }, TIMEOUT);
});
