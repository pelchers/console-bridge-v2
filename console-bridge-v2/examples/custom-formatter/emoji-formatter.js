/**
 * Custom Formatter Example - Emoji Formatter
 * Demonstrates creating a custom log formatter
 */

const { BridgeManager, LogFormatter } = require('console-bridge');
const chalk = require('chalk');

/**
 * Custom formatter that adds emojis to log levels
 */
class EmojiFormatter extends LogFormatter {
  constructor(options) {
    super(options);
  }

  /**
   * Override formatLevel to add emojis
   */
  formatLevel(level) {
    const emojis = {
      log: '📝',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      debug: '🐛',
    };

    const colors = {
      log: chalk.white,
      info: chalk.blue,
      warn: chalk.yellow,
      error: chalk.red,
      debug: chalk.magenta,
    };

    const emoji = emojis[level] || '📋';
    const colorFn = colors[level] || chalk.white;

    return `${emoji} ${colorFn(level)}:`;
  }

  /**
   * Override format to add custom header/footer
   */
  format(logData) {
    // Use parent formatting
    const formatted = super.format(logData);

    // Add special marker for errors
    if (logData.type === 'error') {
      return chalk.red.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━') + '\n' + formatted;
    }

    return formatted;
  }
}

async function main() {
  // Create bridge with custom formatter
  const bridge = new BridgeManager({
    headless: true,
    formatterOptions: {
      showTimestamp: true,
      showSource: true,
      timestampFormat: 'time',
    },
  });

  // Replace default formatter with custom one
  bridge.formatter = new EmojiFormatter({
    showTimestamp: true,
    showSource: true,
    timestampFormat: 'time',
  });

  console.log('🎨 Starting Console Bridge with Emoji Formatter\n');

  try {
    await bridge.start('localhost:3000');

    const activeUrls = bridge.getActiveUrls();
    console.log(`✅ Monitoring: ${activeUrls.join(', ')}`);
    console.log('\nPress Ctrl+C to stop.\n');

    // Keep process alive
    await new Promise(() => {});
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n\n👋 Shutting down...');
    await bridge.stop();
    console.log('✅ Console Bridge stopped.\n');
    process.exit(0);
  });
}

main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
