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
    const parts = [];

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

    // Message
    const message = this.formatMessage(logData.args);
    parts.push(message);

    // Location (optional)
    if (this.showLocation && logData.location && logData.location.url) {
      parts.push(this.formatLocation(logData.location));
    }

    return parts.join(' ');
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
