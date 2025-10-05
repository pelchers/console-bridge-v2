/**
 * File Export Example - Multiple Files
 * Demonstrates saving different log levels to separate files
 */

const { BridgeManager } = require('console-bridge');
const fs = require('fs');
const path = require('path');

// Strip ANSI codes
function stripAnsi(str) {
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

async function main() {
  // Create output directory
  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  // Create separate files for different log levels
  const allLogsFile = path.join(outputDir, 'all-logs.txt');
  const errorsFile = path.join(outputDir, 'errors.txt');
  const warningsFile = path.join(outputDir, 'warnings.txt');
  const infoFile = path.join(outputDir, 'info.txt');

  // Create write streams
  const allLogsStream = fs.createWriteStream(allLogsFile, { flags: 'a' });
  const errorsStream = fs.createWriteStream(errorsFile, { flags: 'a' });
  const warningsStream = fs.createWriteStream(warningsFile, { flags: 'a' });
  const infoStream = fs.createWriteStream(infoFile, { flags: 'a' });

  console.log('Logs will be saved to:');
  console.log(`  - All logs: ${allLogsFile}`);
  console.log(`  - Errors:   ${errorsFile}`);
  console.log(`  - Warnings: ${warningsFile}`);
  console.log(`  - Info:     ${infoFile}\n`);

  const bridge = new BridgeManager({
    headless: true,
    output: (formattedLog) => {
      // Output to console
      console.log(formattedLog);

      // Strip ANSI codes
      const plainText = stripAnsi(formattedLog);

      // Write to all logs file
      allLogsStream.write(plainText + '\n');

      // Write to level-specific files
      if (formattedLog.includes('error:')) {
        errorsStream.write(plainText + '\n');
      } else if (formattedLog.includes('warn:')) {
        warningsStream.write(plainText + '\n');
      } else if (formattedLog.includes('info:')) {
        infoStream.write(plainText + '\n');
      }
    },
  });

  try {
    await bridge.start(['localhost:3000', 'localhost:8080']);
    console.log('Monitoring started. Press Ctrl+C to stop.\n');

    // Keep process alive
    await new Promise(() => {});
  } catch (error) {
    console.error('Error:', error.message);
    closeAllStreams();
    process.exit(1);
  }

  function closeAllStreams() {
    allLogsStream.end();
    errorsStream.end();
    warningsStream.end();
    infoStream.end();
  }

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n\nShutting down...');
    await bridge.stop();

    closeAllStreams();
    console.log('\nAll logs saved.\n');
    process.exit(0);
  });
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
