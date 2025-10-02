/**
 * Custom Formatter Example - JSON Formatter
 * Demonstrates formatting logs as JSON for structured logging
 */

const { BridgeManager, LogFormatter } = require('console-bridge');

/**
 * JSON formatter for structured logging
 */
class JSONFormatter extends LogFormatter {
  constructor(options) {
    super(options);
  }

  /**
   * Override format to output JSON
   */
  format(logData) {
    const jsonLog = {
      timestamp: new Date(logData.timestamp).toISOString(),
      level: logData.type,
      source: logData.source,
      message: this.formatMessage(logData.args),
    };

    // Add location if available
    if (logData.location && logData.location.url) {
      jsonLog.location = {
        file: logData.location.url,
        line: logData.location.lineNumber,
        column: logData.location.columnNumber,
      };
    }

    // Add raw args
    jsonLog.args = logData.args;

    return JSON.stringify(jsonLog);
  }

  /**
   * Format message without colors
   */
  formatMessage(args) {
    if (!args || args.length === 0) {
      return '';
    }

    return args
      .map((arg) => {
        if (arg === null) return 'null';
        if (arg === undefined) return 'undefined';
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg);
          } catch {
            return '[Object]';
          }
        }
        return String(arg);
      })
      .join(' ');
  }
}

async function main() {
  const bridge = new BridgeManager({
    headless: true,
  });

  // Use JSON formatter
  bridge.formatter = new JSONFormatter({
    showTimestamp: true,
    showSource: true,
  });

  console.log('Starting Console Bridge with JSON Formatter\n');

  try {
    await bridge.start('localhost:3000');
    console.log(`Monitoring: ${bridge.getActiveUrls().join(', ')}\n`);
    console.log('Logs will be output as JSON (one per line)\n');

    // Keep process alive
    await new Promise(() => {});
  } catch (error) {
    console.error(JSON.stringify({ error: error.message }));
  }

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\nShutting down...');
    await bridge.stop();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error(JSON.stringify({ fatal: error.message }));
  process.exit(1);
});
