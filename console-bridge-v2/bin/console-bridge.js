#!/usr/bin/env node

/**
 * Console Bridge CLI
 * Command-line interface for browser console bridging
 */

const { Command } = require('commander');
const fs = require('fs');
const stripAnsi = require('strip-ansi');
const BridgeManager = require('../src/core/BridgeManager');
const WebSocketServer = require('../src/core/WebSocketServer');
const { validateUrl } = require('../src/utils/url');
const packageJson = require('../package.json');

const program = new Command();

// Track active bridge manager, WebSocket server, and file stream
let activeBridge = null;
let activeWebSocketServer = null;
let logFileStream = null;
let isShuttingDown = false;

/**
 * Setup signal handlers for graceful shutdown
 */
function setupSignalHandlers() {
  const shutdown = async (signal) => {
    if (isShuttingDown) {
      return;
    }

    isShuttingDown = true;
    console.log('\n\nShutting down gracefully...');

    if (activeBridge) {
      try {
        await activeBridge.stop();
        console.log('✓ Console Bridge stopped.\n');
      } catch (error) {
        console.error('Error during shutdown:', error.message);
      }
    }

    if (activeWebSocketServer) {
      try {
        await activeWebSocketServer.stop();
        console.log('✓ WebSocket server stopped.\n');
      } catch (error) {
        console.error('Error stopping WebSocket server:', error.message);
      }
    }

    // Close log file stream if open
    if (logFileStream) {
      try {
        logFileStream.end();
        console.log('✓ Log file closed.\n');
      } catch (error) {
        console.error('Error closing log file:', error.message);
      }
    }

    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

/**
 * Parse comma-separated log levels
 */
function parseLevels(value) {
  return value.split(',').map((level) => level.trim());
}

/**
 * Start extension mode (WebSocket server)
 */
async function startExtensionMode(options) {
  try {
    // Setup file output if specified
    if (options.output) {
      try {
        logFileStream = fs.createWriteStream(options.output, { flags: 'a' });

        // Handle stream errors
        logFileStream.on('error', (error) => {
          console.error(`❌ Failed to create log file: ${error.message}\n`);
          process.exit(1);
        });

        console.log(`📝 Logging to file: ${options.output}\n`);
      } catch (error) {
        console.error(`❌ Failed to create log file: ${error.message}\n`);
        process.exit(1);
      }
    }

    // Create custom output function that handles both console and file
    const customOutput = (formattedLog) => {
      // Always output to console
      console.log(formattedLog);

      // Also write to file if stream is open
      if (logFileStream) {
        try {
          // Strip ANSI codes for file output
          const plainText = stripAnsi(formattedLog);
          logFileStream.write(plainText + '\n');
        } catch (error) {
          console.error(`⚠️  Warning: Failed to write to log file: ${error.message}`);
        }
      }
    };

    // Create WebSocket server
    activeWebSocketServer = new WebSocketServer({
      port: 9223,
      output: customOutput,
      formatterOptions: {
        showTimestamp: options.showTimestamp,
        showSource: options.showSource,
        showLocation: options.showLocation,
        timestampFormat: options.timestampFormat,
      },
    });

    // Setup shutdown handlers
    setupSignalHandlers();

    // Start server
    console.log('📡 Starting WebSocket server...');
    await activeWebSocketServer.start();

    console.log(`✓ Listening for extension on ws://localhost:${activeWebSocketServer.getPort()}`);
    console.log('\nWaiting for Chrome extension to connect...');
    console.log('Press Ctrl+C to stop.\n');

  } catch (error) {
    console.error(`❌ Error: ${error.message}\n`);
    process.exit(1);
  }
}

/**
 * Start monitoring URLs or WebSocket server
 */
async function startCommand(urls, options) {
  try {
    // Show header
    const modeText = options.extensionMode ? '(Extension Mode)' : '';
    console.log(`🌉 Console Bridge v${packageJson.version} ${modeText}\n`);

    // Extension mode: Start WebSocket server
    if (options.extensionMode) {
      return await startExtensionMode(options);
    }

    // Puppeteer mode: Validate URLs and start monitoring
    if (!urls || urls.length === 0) {
      console.error('❌ Error: No URLs provided.');
      console.log('Usage: console-bridge start <url> [url...]');
      console.log('Example: console-bridge start localhost:3000\n');
      process.exit(1);
    }

    // Validate each URL
    const invalidUrls = [];
    for (const url of urls) {
      const result = validateUrl(url);
      if (!result.valid) {
        invalidUrls.push({ url, error: result.error });
      }
    }

    if (invalidUrls.length > 0) {
      console.error('❌ Invalid URLs:\n');
      invalidUrls.forEach(({ url, error }) => {
        console.error(`   ${url}: ${error}`);
      });
      console.log();
      process.exit(1);
    }

    // Setup file output if specified
    if (options.output) {
      try {
        logFileStream = fs.createWriteStream(options.output, { flags: 'a' });

        // Handle stream errors
        logFileStream.on('error', (error) => {
          console.error(`❌ Failed to create log file: ${error.message}\n`);
          process.exit(1);
        });

        console.log(`📝 Logging to file: ${options.output}\n`);
      } catch (error) {
        console.error(`❌ Failed to create log file: ${error.message}\n`);
        process.exit(1);
      }
    }

    // Create custom output function that handles both console and file
    const customOutput = (formattedLog) => {
      // Always output to console
      console.log(formattedLog);

      // Also write to file if stream is open
      if (logFileStream) {
        try {
          // Strip ANSI codes for file output
          const plainText = stripAnsi(formattedLog);
          logFileStream.write(plainText + '\n');
        } catch (error) {
          console.error(`⚠️  Warning: Failed to write to log file: ${error.message}`);
        }
      }
    };

    // Create bridge manager
    activeBridge = new BridgeManager({
      maxInstances: options.maxInstances,
      headless: options.headless,
      levels: options.levels,
      output: customOutput,
      mergeOutput: options.mergeOutput,
      formatterOptions: {
        showTimestamp: options.showTimestamp,
        showSource: options.showSource,
        showLocation: options.showLocation,
        timestampFormat: options.timestampFormat,
      },
    });

    // Setup shutdown handlers
    setupSignalHandlers();

    // Start monitoring
    console.log('Starting monitors...');
    await activeBridge.start(urls);

    // Show success message
    const activeUrls = activeBridge.getActiveUrls();
    if (activeUrls.length > 0) {
      activeUrls.forEach((url) => {
        console.log(`✓ ${url}`);
      });
      console.log(`\nMonitoring ${activeUrls.length} URL${activeUrls.length > 1 ? 's' : ''}. Press Ctrl+C to stop.\n`);
    } else {
      console.error('❌ Failed to start monitoring any URLs.\n');
      process.exit(1);
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}\n`);
    process.exit(1);
  }
}

// Configure CLI
program
  .name('console-bridge')
  .description('Bridge browser console logs from localhost to your terminal')
  .version(packageJson.version);

// Start command
program
  .command('start [urls...]')
  .description('Start monitoring one or more localhost URLs (or use --extension-mode)')
  .option(
    '-e, --extension-mode',
    'Start WebSocket server for Chrome extension (port 9223)'
  )
  .option(
    '-l, --levels <levels>',
    'Comma-separated log levels to capture',
    parseLevels,
    [
      'log', 'info', 'warning', 'error', 'debug',
      'dir', 'dirxml', 'table', 'trace', 'clear',
      'startGroup', 'startGroupCollapsed', 'endGroup',
      'assert', 'profile', 'profileEnd', 'count', 'timeEnd'
    ]
  )
  .option('--no-headless', 'Show browser windows (default: headless)')
  .option(
    '-m, --max-instances <number>',
    'Maximum concurrent browser instances',
    parseInt,
    10
  )
  .option('--no-timestamp', 'Hide timestamps in output')
  .option('--no-source', 'Hide source URLs in output')
  .option('--location', 'Show file location for each log')
  .option(
    '--timestamp-format <format>',
    'Timestamp format: "time" or "iso"',
    'time'
  )
  .option(
    '-o, --output <file>',
    'Save logs to file (appends if file exists)'
  )
  .option(
    '--merge-output',
    'Merge Console Bridge logs with dev server terminal (use with concurrently)'
  )
  .action(startCommand);

// Show help if no command
if (process.argv.length === 2) {
  program.help();
}

// Parse arguments
program.parse(process.argv);
