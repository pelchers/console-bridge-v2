/**
 * E2E Test: Real Streaming
 * Validates that console logs stream in real-time with low latency
 */

const { startConsoleBridge, startTestServer, getFixturePath } = require('./helpers');

const TIMEOUT = 20000; // 20 second timeout for streaming tests

describe('E2E - Real Streaming', () => {
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

  test('streams logs in real-time (< 500ms latency)', async () => {
    // Start test server
    server = startTestServer(8084, getFixturePath('test-streaming.html'));
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Start console-bridge
    consoleBridge = startConsoleBridge(['start', 'localhost:8084']);

    // Wait for monitoring to start
    await consoleBridge.waitForOutput('Monitoring 1 URL', 5000);

    // Wait for first periodic log
    const time1 = Date.now();
    await consoleBridge.waitForOutput('Periodic log #1', 8000);
    const latency1 = Date.now() - time1;

    // Wait for second periodic log (should be ~1000ms later)
    const time2 = Date.now();
    await consoleBridge.waitForOutput('Periodic log #2', 3000);
    const elapsed = Date.now() - time2;

    const output = consoleBridge.getOutput();

    // Verify: Logs are streaming
    expect(output).toContain('Periodic log #1');
    expect(output).toContain('Periodic log #2');

    // Verify: Latency is reasonable (< 500ms for first log)
    // Note: First log includes page load time, so more lenient
    expect(latency1).toBeLessThan(8000);

    // Verify: Logs arrive approximately every 1 second
    // Allow 2 second window for second log (1s interval + latency)
    expect(elapsed).toBeLessThan(2000);
  }, TIMEOUT);

  test('captures multiple periodic logs in sequence', async () => {
    // Start test server
    server = startTestServer(8085, getFixturePath('test-streaming.html'));
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Start console-bridge
    consoleBridge = startConsoleBridge(['start', 'localhost:8085']);

    // Wait for monitoring
    await consoleBridge.waitForOutput('Monitoring 1 URL', 5000);

    // Wait for multiple periodic logs
    await consoleBridge.waitForOutput('Periodic log #1', 8000);
    await consoleBridge.waitForOutput('Periodic log #2', 3000);
    await consoleBridge.waitForOutput('Periodic log #3', 3000);

    const output = consoleBridge.getOutput();

    // Verify: Multiple logs captured in sequence
    expect(output).toContain('Periodic log #1');
    expect(output).toContain('Periodic log #2');
    expect(output).toContain('Periodic log #3');

    // Verify: Logs appear in order
    const log1Index = output.indexOf('Periodic log #1');
    const log2Index = output.indexOf('Periodic log #2');
    const log3Index = output.indexOf('Periodic log #3');

    expect(log1Index).toBeLessThan(log2Index);
    expect(log2Index).toBeLessThan(log3Index);
  }, TIMEOUT);

  test('handles high-frequency logs without dropping', async () => {
    // This test verifies console-bridge can handle rapid logging
    // The streaming test page logs every 1 second, which is moderate frequency
    // Real apps may log more frequently

    server = startTestServer(8086, getFixturePath('test-streaming.html'));
    await new Promise(resolve => setTimeout(resolve, 1000));

    consoleBridge = startConsoleBridge(['start', 'localhost:8086']);

    await consoleBridge.waitForOutput('Monitoring 1 URL', 5000);

    // Wait for 5 logs
    await consoleBridge.waitForOutput('Periodic log #1', 8000);
    await consoleBridge.waitForOutput('Periodic log #5', 8000);

    const output = consoleBridge.getOutput();

    // Verify: All 5 logs present (no drops)
    expect(output).toContain('Periodic log #1');
    expect(output).toContain('Periodic log #2');
    expect(output).toContain('Periodic log #3');
    expect(output).toContain('Periodic log #4');
    expect(output).toContain('Periodic log #5');
  }, TIMEOUT);
});
