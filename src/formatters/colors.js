/**
 * Color Definitions
 * Defines color schemes for log levels and source URLs
 */

const chalk = require('chalk');

// Log level colors
const LOG_LEVEL_COLORS = {
  log: chalk.white,
  info: chalk.blue,
  warning: chalk.yellow,
  error: chalk.red,
  debug: chalk.gray,
};

// Source colors (cycling through these for different URLs)
const SOURCE_COLORS = [
  chalk.cyan,
  chalk.magenta,
  chalk.green,
  chalk.yellow,
  chalk.blue,
  chalk.red,
  chalk.white,
];

/**
 * Get a consistent color for a given source URL
 * Uses simple hash to ensure same URL always gets same color
 * @param {string} source - The source URL
 * @returns {Function} Chalk color function
 */
function getSourceColor(source) {
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < source.length; i++) {
    hash = (hash << 5) - hash + source.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }

  const index = Math.abs(hash) % SOURCE_COLORS.length;
  return SOURCE_COLORS[index];
}

/**
 * Get color function for a log level
 * @param {string} level - The log level
 * @returns {Function} Chalk color function
 */
function getLogLevelColor(level) {
  return LOG_LEVEL_COLORS[level] || chalk.white;
}

module.exports = {
  LOG_LEVEL_COLORS,
  SOURCE_COLORS,
  getSourceColor,
  getLogLevelColor,
};
