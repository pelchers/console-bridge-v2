/**
 * Custom Output Handler Example
 * Demonstrates processing logs with a custom handler
 */

const { BridgeManager } = require('console-bridge');
const fs = require('fs');
const path = require('path');

// Track error count
let errorCount = 0;
const MAX_ERRORS = 10;

// Create log files
const allLogsStream = fs.createWriteStream(
  path.join(__dirname, 'all-logs.txt'),
  { flags: 'a' }
);

const errorLogsStream = fs.createWriteStream(
  path.join(__dirname, 'errors-only.txt'),
  { flags: 'a' }
);

// Custom output handler
function customOutputHandler(formattedLog) {
  // Always output to console
  console.log(formattedLog);

  // Write all logs to file (strip ANSI codes if needed)
  const plainLog = formattedLog.replace(/\x1b\[[0-9;]*m/g, '');
  allLogsStream.write(plainLog + '\n');

  // Write errors to separate file
  if (formattedLog.includes('error:')) {
    errorLogsStream.write(plainLog + '\n');
    errorCount++;

    // Safety check: too many errors
    if (errorCount >= MAX_ERRORS) {
      console.error(`\n❌ Too many errors detected (${errorCount}). Shutting down.\n`);
      cleanup();
      process.exit(1);
    }
  }

  // Send critical errors to external service (simulated)
  if (formattedLog.includes('CRITICAL') || formattedLog.includes('Fatal')) {
    sendAlert(plainLog);
  }
}

// Simulated alert function
function sendAlert(message) {
  console.log('🚨 ALERT:', message);
  // In real app: send to Slack, PagerDuty, email, etc.
}

// Cleanup function
function cleanup() {
  allLogsStream.end();
  errorLogsStream.end();
}

async function main() {
  const bridge = new BridgeManager({
    headless: true,
    levels: ['log', 'info', 'warn', 'error'],
    output: customOutputHandler,
  });

  console.log('Starting Console Bridge with custom output handler...\n');
  console.log('Logs will be saved to:');
  console.log(`  - all-logs.txt (all logs)`);
  console.log(`  - errors-only.txt (errors only)`);
  console.log(`\nPress Ctrl+C to stop.\n`);

  try {
    await bridge.start('localhost:3000');
  } catch (error) {
    console.error('Error:', error.message);
    cleanup();
    process.exit(1);
  }

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n\nShutting down...');
    await bridge.stop();
    cleanup();
    console.log(`\nFinal stats: ${errorCount} errors captured\n`);
    process.exit(0);
  });
}

main().catch((error) => {
  console.error('Fatal error:', error);
  cleanup();
  process.exit(1);
});
