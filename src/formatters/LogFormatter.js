/**
 * Log Formatter
 * Formats log entries for terminal output with colors
 */

const chalk = require('chalk');
const { getSourceColor, getLogLevelColor } = require('./colors');
const { getDisplayName } = require('../utils/url');

class LogFormatter {
  constructor(options = {}) {
    this.showTimestamp = options.showTimestamp !== false;
    this.showSource = options.showSource !== false;
    this.showLocation = options.showLocation || false;
    this.timestampFormat = options.timestampFormat || 'time'; // 'time' or 'iso'

    // Stateful tracking for console methods
    this.counters = new Map(); // label -> count
    this.timers = new Map();   // label -> start timestamp
    this.groupDepth = 0;       // current group nesting level
  }

  /**
   * Format a log entry
   * @param {Object} logData - Log data from LogCapturer
   * @param {string} logData.type - Log level (log, info, warn, error, debug)
   * @param {Array} logData.args - Log arguments
   * @param {string} logData.source - Source URL
   * @param {number} logData.timestamp - Timestamp
   * @param {Object} logData.location - Location info
   * @returns {string} Formatted log string
   */
  format(logData) {
    // Handle special console types with custom formatting
    switch (logData.type) {
      case 'count':
        return this.formatCount(logData);
      case 'timeEnd':
        return this.formatTimeEnd(logData);
      case 'table':
        return this.formatTable(logData);
      case 'startGroup':
        return this.formatStartGroup(logData);
      case 'startGroupCollapsed':
        return this.formatStartGroupCollapsed(logData);
      case 'endGroup':
        return this.formatEndGroup(logData);
      case 'assert':
        return this.formatAssert(logData);
      case 'clear':
        return this.formatClear(logData);
      case 'trace':
        return this.formatTrace(logData);
      default:
        return this.formatDefault(logData);
    }
  }

  /**
   * Format default log types (log, info, warning, error, debug, dir, dirxml, profile, profileEnd)
   */
  formatDefault(logData) {
    const parts = [];

    // Add indentation for group depth
    const indent = '  '.repeat(this.groupDepth);

    // Timestamp
    if (this.showTimestamp) {
      parts.push(this.formatTimestamp(logData.timestamp));
    }

    // Source
    if (this.showSource) {
      parts.push(this.formatSource(logData.source));
    }

    // Log level
    parts.push(this.formatLevel(logData.type));

    // Message with indentation
    const message = this.formatMessage(logData.args);
    parts.push(indent + message);

    // Location (optional)
    if (this.showLocation && logData.location && logData.location.url) {
      parts.push(this.formatLocation(logData.location));
    }

    return parts.join(' ');
  }

  /**
   * Format console.count()
   */
  formatCount(logData) {
    const label = logData.args[0] || 'default';
    const currentCount = (this.counters.get(label) || 0) + 1;
    this.counters.set(label, currentCount);

    const parts = [];
    if (this.showTimestamp) parts.push(this.formatTimestamp(logData.timestamp));
    if (this.showSource) parts.push(this.formatSource(logData.source));

    const indent = '  '.repeat(this.groupDepth);
    parts.push(chalk.green('count:'));
    parts.push(indent + `${label}: ${chalk.yellow(currentCount)}`);

    return parts.join(' ');
  }

  /**
   * Format console.timeEnd()
   */
  formatTimeEnd(logData) {
    const label = logData.args[0] || 'default';
    const endTime = logData.timestamp;
    const startTime = this.timers.get(label);

    let duration = 'unknown';
    if (startTime !== undefined) {
      duration = `${(endTime - startTime).toFixed(3)}ms`;
      this.timers.delete(label);
    } else {
      // If no start time, this might be console.time() call
      this.timers.set(label, endTime);
      return null; // Don't output anything for console.time()
    }

    const parts = [];
    if (this.showTimestamp) parts.push(this.formatTimestamp(logData.timestamp));
    if (this.showSource) parts.push(this.formatSource(logData.source));

    const indent = '  '.repeat(this.groupDepth);
    parts.push(chalk.green('timeEnd:'));
    parts.push(indent + `${label}: ${chalk.yellow(duration)}`);

    return parts.join(' ');
  }

  /**
   * Format console.table()
   */
  formatTable(logData) {
    const parts = [];
    if (this.showTimestamp) parts.push(this.formatTimestamp(logData.timestamp));
    if (this.showSource) parts.push(this.formatSource(logData.source));

    parts.push(chalk.green('table:'));

    const indent = '  '.repeat(this.groupDepth);
    const data = logData.args[0];

    // Try to format as ASCII table
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
      const table = this.createAsciiTable(data);
      parts.push('\n' + indent + table.split('\n').join('\n' + indent));
    } else {
      parts.push(indent + this.formatArg(data));
    }

    return parts.join(' ');
  }

  /**
   * Format console.group()
   */
  formatStartGroup(logData) {
    const parts = [];
    if (this.showTimestamp) parts.push(this.formatTimestamp(logData.timestamp));
    if (this.showSource) parts.push(this.formatSource(logData.source));

    const indent = '  '.repeat(this.groupDepth);
    parts.push(chalk.blue('group:'));
    parts.push(indent + this.formatMessage(logData.args));

    this.groupDepth++;

    return parts.join(' ');
  }

  /**
   * Format console.groupCollapsed()
   */
  formatStartGroupCollapsed(logData) {
    const parts = [];
    if (this.showTimestamp) parts.push(this.formatTimestamp(logData.timestamp));
    if (this.showSource) parts.push(this.formatSource(logData.source));

    const indent = '  '.repeat(this.groupDepth);
    parts.push(chalk.blue('groupCollapsed:'));
    parts.push(indent + this.formatMessage(logData.args));

    this.groupDepth++;

    return parts.join(' ');
  }

  /**
   * Format console.groupEnd()
   */
  formatEndGroup(logData) {
    if (this.groupDepth > 0) {
      this.groupDepth--;
    }

    const parts = [];
    if (this.showTimestamp) parts.push(this.formatTimestamp(logData.timestamp));
    if (this.showSource) parts.push(this.formatSource(logData.source));

    const indent = '  '.repeat(this.groupDepth);
    parts.push(chalk.blue('groupEnd:'));
    parts.push(indent);

    return parts.join(' ');
  }

  /**
   * Format console.assert()
   */
  formatAssert(logData) {
    const parts = [];
    if (this.showTimestamp) parts.push(this.formatTimestamp(logData.timestamp));
    if (this.showSource) parts.push(this.formatSource(logData.source));

    const indent = '  '.repeat(this.groupDepth);
    parts.push(chalk.red('assert:'));
    parts.push(indent + chalk.red('Assertion failed:'), this.formatMessage(logData.args));

    return parts.join(' ');
  }

  /**
   * Format console.clear()
   */
  formatClear(logData) {
    const parts = [];
    if (this.showTimestamp) parts.push(this.formatTimestamp(logData.timestamp));
    if (this.showSource) parts.push(this.formatSource(logData.source));

    parts.push(chalk.white('clear:'));
    parts.push(chalk.gray('─'.repeat(50)));

    return parts.join(' ');
  }

  /**
   * Format console.trace()
   */
  formatTrace(logData) {
    const parts = [];
    if (this.showTimestamp) parts.push(this.formatTimestamp(logData.timestamp));
    if (this.showSource) parts.push(this.formatSource(logData.source));

    const indent = '  '.repeat(this.groupDepth);
    parts.push(chalk.magenta('trace:'));
    parts.push(indent + this.formatMessage(logData.args));

    return parts.join(' ');
  }

  /**
   * Create ASCII table from array of objects
   */
  createAsciiTable(data) {
    if (!data || data.length === 0) return '';

    // Get all unique keys
    const keys = Array.from(new Set(data.flatMap(obj => Object.keys(obj))));

    // Calculate column widths
    const widths = {};
    keys.forEach(key => {
      widths[key] = Math.max(
        key.length,
        ...data.map(row => String(row[key] || '').length)
      );
    });

    // Create header
    const header = '│ ' + keys.map(k => k.padEnd(widths[k])).join(' │ ') + ' │';
    const separator = '├' + keys.map(k => '─'.repeat(widths[k] + 2)).join('┼') + '┤';
    const topBorder = '┌' + keys.map(k => '─'.repeat(widths[k] + 2)).join('┬') + '┐';
    const bottomBorder = '└' + keys.map(k => '─'.repeat(widths[k] + 2)).join('┴') + '┘';

    // Create rows
    const rows = data.map(row =>
      '│ ' + keys.map(k => String(row[k] || '').padEnd(widths[k])).join(' │ ') + ' │'
    );

    return [topBorder, header, separator, ...rows, bottomBorder].join('\n');
  }

  /**
   * Format timestamp
   * @param {number} timestamp - Unix timestamp
   * @returns {string} Formatted timestamp
   * @private
   */
  formatTimestamp(timestamp) {
    const date = new Date(timestamp);

    if (this.timestampFormat === 'iso') {
      return chalk.gray(`[${date.toISOString()}]`);
    }

    // Time format: [HH:MM:SS]
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return chalk.gray(`[${hours}:${minutes}:${seconds}]`);
  }

  /**
   * Format source URL
   * @param {string} source - Source URL
   * @returns {string} Formatted source
   * @private
   */
  formatSource(source) {
    const displayName = getDisplayName(source);
    const colorFn = getSourceColor(source);
    return colorFn(`[${displayName}]`);
  }

  /**
   * Format log level
   * @param {string} level - Log level
   * @returns {string} Formatted level
   * @private
   */
  formatLevel(level) {
    const colorFn = getLogLevelColor(level);
    return colorFn(`${level}:`);
  }

  /**
   * Format log message from arguments
   * @param {Array} args - Log arguments
   * @returns {string} Formatted message
   * @private
   */
  formatMessage(args) {
    if (!args || args.length === 0) {
      return '';
    }

    return args.map((arg) => this.formatArg(arg)).join(' ');
  }

  /**
   * Format a single argument
   * @param {*} arg - Log argument
   * @returns {string} Formatted argument
   * @private
   */
  formatArg(arg) {
    if (arg === null) {
      return chalk.gray('null');
    }

    if (arg === undefined) {
      return chalk.gray('undefined');
    }

    if (typeof arg === 'string') {
      return arg;
    }

    if (typeof arg === 'number') {
      return chalk.yellow(String(arg));
    }

    if (typeof arg === 'boolean') {
      return chalk.yellow(String(arg));
    }

    if (typeof arg === 'function') {
      return chalk.cyan('[Function]');
    }

    if (typeof arg === 'symbol') {
      return chalk.cyan(String(arg));
    }

    // Objects and arrays - pretty print
    if (typeof arg === 'object') {
      try {
        return chalk.gray(JSON.stringify(arg, null, 2));
      } catch {
        return chalk.gray('[Object]');
      }
    }

    return String(arg);
  }

  /**
   * Format location info
   * @param {Object} location - Location info
   * @returns {string} Formatted location
   * @private
   */
  formatLocation(location) {
    const { url, lineNumber, columnNumber } = location;
    const parts = [url];

    if (lineNumber !== undefined) {
      parts.push(`:${lineNumber}`);
    }

    if (columnNumber !== undefined) {
      parts.push(`:${columnNumber}`);
    }

    return chalk.gray(`(${parts.join('')})`);
  }
}

module.exports = LogFormatter;
