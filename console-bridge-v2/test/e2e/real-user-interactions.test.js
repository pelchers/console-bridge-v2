/**
 * E2E Test: Real User Interactions
 * Validates that console-bridge captures logs from pages with interactive elements
 * Note: This test validates page load and readiness for interactions
 * Button clicks would require a separate Puppeteer instance to control
 */

const { startConsoleBridge, startTestServer, getFixturePath } = require('./helpers');

const TIMEOUT = 15000;

describe('E2E - Real User Interactions', () => {
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

  test('captures logs from interactive page on load', async () => {
    // Start test server
    server = startTestServer(8087, getFixturePath('test-interactions.html'));
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Start console-bridge
    consoleBridge = startConsoleBridge(['start', 'localhost:8087']);

    // Wait for monitoring
    await consoleBridge.waitForOutput('Monitoring 1 URL', 5000);

    // Wait for page ready log
    await consoleBridge.waitForOutput('[Interactions] Page ready for user interactions', 8000);

    const output = consoleBridge.getOutput();

    // Verify: Page loaded and ready
    expect(output).toContain('[localhost:8087] log:');
    expect(output).toContain('[Interactions] Page ready for user interactions');

    // Verify: No crash
    expect(output).not.toContain('Page crashed!');
  }, TIMEOUT);

  test('works with pages containing event listeners', async () => {
    // This test verifies console-bridge doesn't interfere with page event listeners
    // The page has buttons with click handlers - we verify the page loads correctly

    server = startTestServer(8088, getFixturePath('test-interactions.html'));
    await new Promise(resolve => setTimeout(resolve, 1000));

    consoleBridge = startConsoleBridge(['start', 'localhost:8088']);

    await consoleBridge.waitForOutput('Monitoring 1 URL', 5000);
    await consoleBridge.waitForOutput('[Interactions] Page ready', 8000);

    const output = consoleBridge.getOutput();

    // Verify: Page with event listeners works normally
    expect(output).toContain('[Interactions] Page ready for user interactions');
    expect(output).not.toContain('error');
    expect(output).not.toContain('Failed');
  }, TIMEOUT);

  test('handles pages with forms and inputs', async () => {
    // Verify console-bridge doesn't break pages with form elements

    server = startTestServer(8089, getFixturePath('test-interactions.html'));
    await new Promise(resolve => setTimeout(resolve, 1000));

    consoleBridge = startConsoleBridge(['start', 'localhost:8089']);

    await consoleBridge.waitForOutput('Monitoring 1 URL', 5000);
    await consoleBridge.waitForOutput('[Interactions] Page ready', 8000);

    const output = consoleBridge.getOutput();

    // Verify: Page loads successfully
    expect(output).toContain('[localhost:8089] log:');
    expect(output).toContain('[Interactions] Page ready for user interactions');
  }, TIMEOUT);
});
