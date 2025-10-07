/**
 * Console Bridge - Protocol Message Builder
 *
 * This module provides functions to build WebSocket protocol v1.0.0 compliant messages.
 * All messages follow the standard envelope structure with version, type, timestamp, and payload.
 *
 * Protocol Specification: docs/v2.0.0-spec/websocket-protocol-v1.0.0.md
 *
 * Note: Using window.ConsoleBridgeProtocol namespace to avoid global pollution
 * while maintaining compatibility with Chrome extension context.
 */

(function() {
  'use strict';

  const PROTOCOL_VERSION = '1.0.0';

  /**
   * Build a console_event message per protocol v1.0.0
   *
   * @param {string} method - Console method name (log, info, warn, error, etc.)
   * @param {Array} args - Serialized console arguments
   * @param {Object|null} location - Source location { url, line, column }
   * @param {Object} sourceInfo - Tab/page information { tabId, url, title }
   * @returns {Object} Protocol v1.0.0 console_event message
   */
  function buildConsoleEvent(method, args, location, sourceInfo) {
  const message = {
    version: PROTOCOL_VERSION,
    type: 'console_event',
    timestamp: new Date().toISOString(),
    source: sourceInfo,
    payload: {
      method,
      args
    }
  };

  // Include location only if available
  if (location) {
    message.payload.location = location;
  }

  return message;
}

  /**
   * Build a connection_status message
   *
   * @param {string} status - Connection status: 'connected', 'disconnected', 'reconnecting'
   * @param {string} reason - Human-readable reason for status change
   * @param {Object} clientInfo - Client information { extensionVersion, browser, browserVersion }
   * @param {Object|null} sourceInfo - Optional source info for extension->CLI messages
   * @returns {Object} Protocol v1.0.0 connection_status message
   */
  function buildConnectionStatus(status, reason, clientInfo, sourceInfo = null) {
  const message = {
    version: PROTOCOL_VERSION,
    type: 'connection_status',
    timestamp: new Date().toISOString(),
    payload: {
      status,
      reason,
      clientInfo
    }
  };

  // Include source info if provided (extension->CLI messages)
  if (sourceInfo) {
    message.source = sourceInfo;
  }

  return message;
}

  /**
   * Build an error message
   *
   * @param {string} code - Error code (INVALID_MESSAGE, UNSUPPORTED_VERSION, etc.)
   * @param {string} message - Human-readable error message
   * @param {Object} details - Additional error context
   * @returns {Object} Protocol v1.0.0 error message
   */
  function buildError(code, message, details = {}) {
  return {
    version: PROTOCOL_VERSION,
    type: 'error',
    timestamp: new Date().toISOString(),
    payload: {
      code,
      message,
      details
    }
  };
}

  /**
   * Build a ping message
   *
   * @param {string} id - Unique ping identifier
   * @returns {Object} Protocol v1.0.0 ping message
   */
  function buildPing(id) {
  return {
    version: PROTOCOL_VERSION,
    type: 'ping',
    timestamp: new Date().toISOString(),
    payload: {
      id
    }
  };
}

  /**
   * Build a pong message (response to ping)
   *
   * @param {string} id - Ping identifier to respond to
   * @returns {Object} Protocol v1.0.0 pong message
   */
  function buildPong(id) {
  return {
    version: PROTOCOL_VERSION,
    type: 'pong',
    timestamp: new Date().toISOString(),
    payload: {
      id
    }
  };
}

  /**
   * Get source info for the current inspected window
   *
   * Note: This function must be called from a DevTools context where
   * chrome.devtools.inspectedWindow is available.
   *
   * @returns {Object} Source info { tabId, url, title }
   */
  function getSourceInfo() {
  return {
    tabId: chrome.devtools.inspectedWindow.tabId,
    // Note: url and title will need to be obtained from the inspected window
    // This is a placeholder - will be enhanced when we have full DevTools integration
    url: 'http://localhost:3000', // TODO: Get from inspected window
    title: 'Inspected Page' // TODO: Get from inspected window
  };
}

  /**
   * Get extension client info
   *
   * @returns {Object} Client info { extensionVersion, browser, browserVersion }
   */
  function getClientInfo() {
  const manifest = chrome.runtime.getManifest();

  return {
    extensionVersion: manifest.version,
    browser: 'Chrome', // TODO: Detect actual browser (Chrome/Edge/Brave)
    browserVersion: navigator.userAgent.match(/Chrome\/(\d+)/)?.[1] || 'unknown'
  };
}

  /**
   * Validate a message structure against protocol v1.0.0
   *
   * @param {Object} message - Message to validate
   * @returns {boolean} True if valid, false otherwise
   */
  function validateMessage(message) {
  // Must have version
  if (!message.version) return false;

  // Must have type
  if (!message.type) return false;

  // Must have timestamp
  if (!message.timestamp) return false;

  // Must have payload
  if (!message.payload) return false;

  // Type-specific validation
  switch (message.type) {
    case 'console_event':
      if (!message.source) return false;
      if (!message.payload.method) return false;
      if (!message.payload.args) return false;
      break;

    case 'connection_status':
      if (!message.payload.status) return false;
      break;

    case 'error':
      if (!message.payload.code) return false;
      if (!message.payload.message) return false;
      break;

    case 'ping':
    case 'pong':
      if (!message.payload.id) return false;
      break;

    default:
      // Unknown message type
      return false;
  }

  return true;
  }

  // Export all functions to window.ConsoleBridgeProtocol namespace
  window.ConsoleBridgeProtocol = {
    PROTOCOL_VERSION,
    buildConsoleEvent,
    buildConnectionStatus,
    buildError,
    buildPing,
    buildPong,
    getSourceInfo,
    getClientInfo,
    validateMessage
  };

})();
