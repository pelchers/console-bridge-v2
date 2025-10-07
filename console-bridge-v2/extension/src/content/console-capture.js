/**
 * Console Bridge - Console Capture Script
 *
 * This script is injected into the inspected window to intercept console method calls.
 * It runs in an IIFE to avoid polluting the global scope.
 *
 * Features:
 * - Intercepts all 18 console methods
 * - Preserves original console behavior
 * - Tracks source code location (file, line, column)
 * - Basic serialization of arguments
 * - Sends events to DevTools via postMessage
 */

(function() {
  'use strict';

  // Store original console methods
  const originalConsole = {};
  const consoleMethods = [
    'log', 'info', 'warn', 'error', 'debug',
    'trace', 'table', 'group', 'groupCollapsed', 'groupEnd',
    'clear', 'count', 'countReset',
    'time', 'timeEnd', 'timeLog',
    'assert', 'dir', 'dirxml'
  ];

  // Store original methods before we modify them
  consoleMethods.forEach(method => {
    if (typeof console[method] === 'function') {
      originalConsole[method] = console[method].bind(console);
    }
  });

  /**
   * Get the call location from stack trace
   * @returns {Object|null} { url, line, column } or null if unavailable
   */
  function getCallLocation() {
    try {
      const stack = new Error().stack;
      if (!stack) return null;

      const lines = stack.split('\n');

      // Skip first few lines (Error, getCallLocation, console wrapper, serializeAndSend)
      for (let i = 4; i < lines.length; i++) {
        const line = lines[i];

        // Match patterns like:
        // "at functionName (http://localhost:3000/app.js:42:15)"
        // "at http://localhost:3000/app.js:42:15"
        const match = line.match(/at\s+(?:.*?\s+\()?(.+?):(\d+):(\d+)/);

        if (match) {
          const url = match[1];

          // Skip chrome-extension:// URLs (our extension code)
          if (url.includes('chrome-extension://')) {
            continue;
          }

          // Skip chrome:// URLs (browser internals)
          if (url.includes('chrome://')) {
            continue;
          }

          // Found a valid location
          return {
            url: url,
            line: parseInt(match[2], 10),
            column: parseInt(match[3], 10)
          };
        }
      }

      // No valid location found
      return null;
    } catch (error) {
      // Stack trace parsing failed
      return null;
    }
  }

  /**
   * Serialize a single value for transmission
   * @param {*} value - The value to serialize
   * @returns {Object} Serialized value with type information
   */
  function serializeValue(value) {
    // Null
    if (value === null) {
      return { type: 'null', value: null };
    }

    // Undefined
    if (value === undefined) {
      return { type: 'undefined' };
    }

    const type = typeof value;

    // String
    if (type === 'string') {
      // TODO: Truncate large strings in Subtask 2.2
      return { type: 'string', value: value };
    }

    // Number
    if (type === 'number') {
      return { type: 'number', value: value };
    }

    // Boolean
    if (type === 'boolean') {
      return { type: 'boolean', value: value };
    }

    // Function
    if (type === 'function') {
      return {
        type: 'function',
        name: value.name || 'anonymous',
        value: `function ${value.name || 'anonymous'}()`
      };
    }

    // Error object
    if (value instanceof Error) {
      return {
        type: 'error',
        value: value.message,
        stack: value.stack
      };
    }

    // DOM Element
    if (typeof HTMLElement !== 'undefined' && value instanceof HTMLElement) {
      return {
        type: 'dom',
        tagName: value.tagName,
        value: `<${value.tagName.toLowerCase()}>`
      };
    }

    // Array
    if (Array.isArray(value)) {
      // TODO: Add depth/size limits in Subtask 2.2
      return {
        type: 'array',
        value: value.map(item => serializeValue(item))
      };
    }

    // Object
    if (type === 'object') {
      // TODO: Add circular reference detection in Subtask 2.2
      // TODO: Add depth/size limits in Subtask 2.2
      try {
        const serialized = {};
        for (const key in value) {
          if (value.hasOwnProperty(key)) {
            serialized[key] = serializeValue(value[key]);
          }
        }

        return {
          type: 'object',
          className: value.constructor?.name,
          value: serialized
        };
      } catch (error) {
        // Serialization failed (circular reference, etc.)
        return {
          type: 'object',
          value: '[Object - serialization failed]'
        };
      }
    }

    // Fallback for unknown types
    return {
      type: 'unknown',
      value: String(value)
    };
  }

  /**
   * Serialize all arguments passed to a console method
   * @param {Array} args - Arguments from console method
   * @returns {Array} Array of serialized arguments
   */
  function serializeArguments(args) {
    return Array.from(args).map(arg => serializeValue(arg));
  }

  /**
   * Send a console event to the DevTools page
   * @param {string} method - Console method name
   * @param {Array} args - Original arguments
   * @param {Object|null} location - Source location
   */
  function sendEvent(method, args, location) {
    try {
      window.postMessage({
        type: 'console-bridge-event',
        data: {
          method,
          args: serializeArguments(args),
          location,
          timestamp: new Date().toISOString()
        }
      }, '*');
    } catch (error) {
      // Sending failed - don't break the console
      originalConsole.error('[Console Bridge] Failed to send event:', error);
    }
  }

  /**
   * Create a wrapper function for a console method
   * @param {string} method - Console method name
   * @returns {Function} Wrapper function
   */
  function createConsoleWrapper(method) {
    return function(...args) {
      try {
        // Capture event data
        const location = getCallLocation();
        sendEvent(method, args, location);
      } catch (error) {
        // Capture failed - don't break the console
        originalConsole.error('[Console Bridge] Capture error:', error);
      }

      // Always call the original console method
      return originalConsole[method].apply(console, args);
    };
  }

  // Intercept all console methods
  consoleMethods.forEach(method => {
    if (originalConsole[method]) {
      console[method] = createConsoleWrapper(method);
    }
  });

  // Signal successful injection
  originalConsole.info('[Console Bridge] Console capture active - monitoring all console calls');

})();
