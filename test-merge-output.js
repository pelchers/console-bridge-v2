/**
 * Test --merge-output flag
 * This simulates what the CLI does when --merge-output is enabled
 */

const BridgeManager = require('./src/core/BridgeManager');

async function testMergeOutput() {
  console.log('🧪 Testing --merge-output functionality\n');

  // Create BridgeManager with mergeOutput enabled
  const manager = new BridgeManager({
    output: console.log,
    mergeOutput: true,
    headless: true,
  });

  console.log('Starting bridge with --merge-output enabled...\n');

  try {
    await manager.start('localhost:3847');

    console.log('\n✓ Bridge started successfully!');
    console.log(`Active URLs: ${manager.getActiveUrls().join(', ')}`);

    // Wait a few seconds to capture some logs
    console.log('\nWaiting 5 seconds to capture logs...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Stop the bridge
    console.log('\n\nStopping bridge...');
    await manager.stop();
    console.log('✓ Bridge stopped\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testMergeOutput();
