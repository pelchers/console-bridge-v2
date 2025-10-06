/**
 * Advanced Example - Multi-Instance with Filters
 * Demonstrates monitoring multiple URLs with different log level filters
 */

const { BridgeManager } = require('console-bridge');
const fs = require('fs');
const path = require('path');

// Configuration for different services
const services = [
  {
    url: 'localhost:3000',
    name: 'Frontend',
    levels: ['error', 'warn'], // Only capture errors and warnings
  },
  {
    url: 'localhost:8080',
    name: 'API Server',
    levels: ['error'], // Only capture errors
  },
  {
    url: 'localhost:5000',
    name: 'Admin Panel',
    levels: ['log', 'info', 'warn', 'error'], // Capture everything
  },
];

async function main() {
  // Create output directory
  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  // Create master log file
  const masterLogFile = path.join(outputDir, 'master.log');
  const masterStream = fs.createWriteStream(masterLogFile, { flags: 'a' });

  console.log('Advanced Multi-Instance Monitoring\n');
  console.log('Services to monitor:');
  services.forEach((service) => {
    console.log(`  - ${service.name} (${service.url}) - Levels: ${service.levels.join(', ')}`);
  });
  console.log();

  // Create a bridge manager for each service with different filters
  const bridges = [];

  for (const service of services) {
    const serviceLogFile = path.join(outputDir, `${service.name.toLowerCase().replace(/\s/g, '-')}.log`);
    const serviceStream = fs.createWriteStream(serviceLogFile, { flags: 'a' });

    const bridge = new BridgeManager({
      headless: true,
      levels: service.levels,
      maxInstances: 1,
      output: (formattedLog) => {
        // Add service prefix
        const prefixed = `[${service.name}] ${formattedLog}`;
        console.log(prefixed);

        // Write to master log
        const plainText = prefixed.replace(/\x1b\[[0-9;]*m/g, '');
        masterStream.write(plainText + '\n');

        // Write to service-specific log
        const plainService = formattedLog.replace(/\x1b\[[0-9;]*m/g, '');
        serviceStream.write(plainService + '\n');
      },
      formatterOptions: {
        showTimestamp: true,
        showSource: false, // We're adding our own prefix
        timestampFormat: 'iso',
      },
    });

    try {
      await bridge.start(service.url);
      console.log(`✓ Started monitoring ${service.name}`);
      bridges.push({ bridge, stream: serviceStream, service });
    } catch (error) {
      console.error(`✗ Failed to start ${service.name}: ${error.message}`);
      serviceStream.end();
    }
  }

  console.log('\nMonitoring started. Press Ctrl+C to stop.\n');

  // Show stats every 30 seconds
  let totalLogs = 0;
  const logCounts = {};

  const originalOutput = bridges.map((b) => b.bridge.options.output);

  bridges.forEach(({ bridge, service }, index) => {
    const originalFn = originalOutput[index];
    bridge.options.output = (log) => {
      totalLogs++;
      logCounts[service.name] = (logCounts[service.name] || 0) + 1;
      originalFn(log);
    };
  });

  setInterval(() => {
    console.log('\n--- Stats ---');
    console.log(`Total logs: ${totalLogs}`);
    Object.entries(logCounts).forEach(([name, count]) => {
      console.log(`  ${name}: ${count}`);
    });
    console.log('-------------\n');
  }, 30000);

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n\nShutting down all services...');

    for (const { bridge, stream, service } of bridges) {
      try {
        await bridge.stop();
        stream.end();
        console.log(`✓ Stopped ${service.name}`);
      } catch (error) {
        console.error(`✗ Error stopping ${service.name}:`, error.message);
      }
    }

    masterStream.end(() => {
      console.log('\nAll services stopped.');
      console.log(`Master log: ${masterLogFile}\n`);
      process.exit(0);
    });
  });
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
