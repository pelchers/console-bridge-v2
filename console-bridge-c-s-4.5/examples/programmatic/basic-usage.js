/**
 * Basic Programmatic Usage Example
 * Demonstrates using Console Bridge as a library
 */

const { BridgeManager } = require('console-bridge');

async function main() {
  // Create bridge manager with options
  const bridge = new BridgeManager({
    headless: true,
    levels: ['log', 'info', 'warn', 'error'],
    formatterOptions: {
      showTimestamp: true,
      showSource: true,
      timestampFormat: 'time',
    },
  });

  console.log('Starting Console Bridge...\n');

  try {
    // Start monitoring one or more URLs
    await bridge.start(['localhost:3000', 'localhost:8080']);

    const activeUrls = bridge.getActiveUrls();
    console.log(`Monitoring ${activeUrls.length} URL(s):`);
    activeUrls.forEach((url) => console.log(`  - ${url}`));
    console.log('\nPress Ctrl+C to stop.\n');

    // Keep process alive
    await new Promise(() => {});
  } catch (error) {
    console.error('Error:', error.message);
  }

  // Graceful shutdown on Ctrl+C
  process.on('SIGINT', async () => {
    console.log('\n\nShutting down...');
    await bridge.stop();
    console.log('Console Bridge stopped.\n');
    process.exit(0);
  });
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
