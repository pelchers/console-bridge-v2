/**
 * File Export Example - Basic Usage
 * Demonstrates saving logs to files
 */

const { BridgeManager } = require('console-bridge');
const fs = require('fs');
const path = require('path');

// Strip ANSI codes from formatted logs
function stripAnsi(str) {
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

async function main() {
  // Create output directory if it doesn't exist
  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  const logFile = path.join(outputDir, 'console-logs.txt');
  const logStream = fs.createWriteStream(logFile, { flags: 'a' });

  console.log(`Logs will be saved to: ${logFile}\n`);

  const bridge = new BridgeManager({
    headless: true,
    output: (formattedLog) => {
      // Output to console
      console.log(formattedLog);

      // Write to file without ANSI codes
      const plainText = stripAnsi(formattedLog);
      logStream.write(plainText + '\n');
    },
  });

  try {
    await bridge.start('localhost:3000');
    console.log('Monitoring started. Press Ctrl+C to stop.\n');

    // Keep process alive
    await new Promise(() => {});
  } catch (error) {
    console.error('Error:', error.message);
    logStream.end();
    process.exit(1);
  }

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n\nShutting down...');
    await bridge.stop();

    // Close file stream
    logStream.end(() => {
      console.log(`\nLogs saved to: ${logFile}\n`);
      process.exit(0);
    });
  });
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
