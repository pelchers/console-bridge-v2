/**
 * Console Bridge - Programmatic API
 * Expose main classes for library usage
 */

module.exports = {
  // Core classes
  BridgeManager: require('./core/BridgeManager'),
  BrowserPool: require('./core/BrowserPool'),
  LogCapturer: require('./core/LogCapturer'),

  // Formatters
  LogFormatter: require('./formatters/LogFormatter'),

  // Utilities
  utils: {
    url: require('./utils/url'),
    colors: require('./formatters/colors'),
  },
};
