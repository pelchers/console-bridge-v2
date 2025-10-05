/**
 * Dynamic URL Management Example
 * Demonstrates adding and removing URLs dynamically
 */

const { BridgeManager } = require('console-bridge');

async function main() {
  const bridge = new BridgeManager({
    headless: true,
    formatterOptions: {
      showTimestamp: true,
    },
  });

  console.log('Dynamic URL Management Demo\n');

  try {
    // Start with one URL
    console.log('Adding localhost:3000...');
    await bridge.addUrl('localhost:3000');
    console.log('Currently monitoring:', bridge.getActiveUrls());

    // Add another URL after 5 seconds
    setTimeout(async () => {
      console.log('\nAdding localhost:8080...');
      try {
        await bridge.addUrl('localhost:8080');
        console.log('Currently monitoring:', bridge.getActiveUrls());
      } catch (error) {
        console.error('Failed to add localhost:8080:', error.message);
      }
    }, 5000);

    // Add third URL after 10 seconds
    setTimeout(async () => {
      console.log('\nAdding localhost:5000...');
      try {
        await bridge.addUrl('localhost:5000');
        console.log('Currently monitoring:', bridge.getActiveUrls());
      } catch (error) {
        console.error('Failed to add localhost:5000:', error.message);
      }
    }, 10000);

    // Remove first URL after 15 seconds
    setTimeout(async () => {
      console.log('\nRemoving localhost:3000...');
      await bridge.removeUrl('localhost:3000');
      console.log('Currently monitoring:', bridge.getActiveUrls());
    }, 15000);

    // Show status every 5 seconds
    setInterval(() => {
      const activeUrls = bridge.getActiveUrls();
      console.log(`\n[Status] Monitoring ${activeUrls.length} URL(s): ${activeUrls.join(', ')}`);
    }, 5000);

    console.log('\nPress Ctrl+C to stop.\n');

    // Keep process alive
    await new Promise(() => {});
  } catch (error) {
    console.error('Error:', error.message);
  }

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n\nShutting down...');
    await bridge.stop();
    console.log('All browsers closed.\n');
    process.exit(0);
  });
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
