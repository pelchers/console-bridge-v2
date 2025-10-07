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
 * - Advanced serialization with circular reference detection
 * - Depth and size limiting
 * - Special type support (Symbol, BigInt, Map, Set, Date, RegExp, etc.)
 * - Sends events to DevTools via postMessage
 */

(function() {
  'use strict';

  // Serialization configuration
  const SERIALIZATION_CONFIG = {
    MAX_DEPTH: 10,
    MAX_STRING_LENGTH: 10240, // 10KB
    MAX_OBJECT_KEYS: 1000,
    MAX_ARRAY_LENGTH: 1000,
    MAX_MAP_ENTRIES: 100,
    MAX_SET_VALUES: 100,
  };

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
   * @param {number} depth - Current nesting depth
   * @param {WeakSet} visited - Set of visited objects (circular detection)
   * @param {string} path - Path to current value (for circular reference messages)
   * @returns {Object} Serialized value with type information
   */
  function serializeValue(value, depth = 0, visited = new WeakSet(), path = 'root') {
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
      if (value.length > SERIALIZATION_CONFIG.MAX_STRING_LENGTH) {
        const truncated = value.substring(0, SERIALIZATION_CONFIG.MAX_STRING_LENGTH);
        return {
          type: 'string',
          value: truncated,
          truncated: true,
          originalLength: value.length,
          displayValue: truncated + `... [${value.length - SERIALIZATION_CONFIG.MAX_STRING_LENGTH} more characters]`
        };
      }
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

    // Symbol
    if (type === 'symbol') {
      return {
        type: 'symbol',
        value: value.toString()
      };
    }

    // BigInt
    if (type === 'bigint') {
      return {
        type: 'bigint',
        value: value.toString() + 'n'
      };
    }

    // Function
    if (type === 'function') {
      return {
        type: 'function',
        name: value.name || 'anonymous',
        value: `function ${value.name || 'anonymous'}()`
      };
    }

    // Check depth limit before processing complex types
    if (depth >= SERIALIZATION_CONFIG.MAX_DEPTH) {
      if (Array.isArray(value)) {
        return {
          type: 'max-depth',
          value: '[Array - max depth exceeded]'
        };
      }
      if (type === 'object') {
        return {
          type: 'max-depth',
          value: '[Object - max depth exceeded]'
        };
      }
    }

    // Date
    if (value instanceof Date) {
      return {
        type: 'date',
        value: value.toISOString()
      };
    }

    // RegExp
    if (value instanceof RegExp) {
      return {
        type: 'regexp',
        value: value.toString()
      };
    }

    // Error object
    if (value instanceof Error) {
      return {
        type: 'error',
        value: value.message,
        stack: value.stack,
        name: value.name
      };
    }

    // Promise
    if (value instanceof Promise) {
      return {
        type: 'promise',
        value: '[Promise]'
      };
    }

    // WeakMap
    if (typeof WeakMap !== 'undefined' && value instanceof WeakMap) {
      return {
        type: 'weakmap',
        value: '[WeakMap]'
      };
    }

    // WeakSet
    if (typeof WeakSet !== 'undefined' && value instanceof WeakSet) {
      return {
        type: 'weakset',
        value: '[WeakSet]'
      };
    }

    // Map
    if (value instanceof Map) {
      // Check for circular reference
      if (visited.has(value)) {
        return {
          type: 'circular',
          value: `[Circular: ${path}]`
        };
      }
      visited.add(value);

      const entries = Array.from(value.entries()).slice(0, SERIALIZATION_CONFIG.MAX_MAP_ENTRIES);
      return {
        type: 'map',
        size: value.size,
        entries: entries.map(([k, v], i) => ({
          key: serializeValue(k, depth + 1, visited, `${path}.key[${i}]`),
          value: serializeValue(v, depth + 1, visited, `${path}.value[${i}]`)
        })),
        truncated: value.size > SERIALIZATION_CONFIG.MAX_MAP_ENTRIES,
        displayedEntries: entries.length
      };
    }

    // Set
    if (value instanceof Set) {
      // Check for circular reference
      if (visited.has(value)) {
        return {
          type: 'circular',
          value: `[Circular: ${path}]`
        };
      }
      visited.add(value);

      const values = Array.from(value).slice(0, SERIALIZATION_CONFIG.MAX_SET_VALUES);
      return {
        type: 'set',
        size: value.size,
        values: values.map((v, i) => serializeValue(v, depth + 1, visited, `${path}[${i}]`)),
        truncated: value.size > SERIALIZATION_CONFIG.MAX_SET_VALUES,
        displayedValues: values.length
      };
    }

    // ArrayBuffer
    if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
      return {
        type: 'arraybuffer',
        byteLength: value.byteLength,
        value: `[ArrayBuffer ${value.byteLength} bytes]`
      };
    }

    // TypedArray
    if (typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView && ArrayBuffer.isView(value) && !(value instanceof DataView)) {
      return {
        type: 'typedarray',
        arrayType: value.constructor.name,
        length: value.length,
        value: `[${value.constructor.name}(${value.length})]`
      };
    }

    // DataView
    if (typeof DataView !== 'undefined' && value instanceof DataView) {
      return {
        type: 'dataview',
        byteLength: value.byteLength,
        value: `[DataView ${value.byteLength} bytes]`
      };
    }

    // DOM Element
    if (typeof HTMLElement !== 'undefined' && value instanceof HTMLElement) {
      return {
        type: 'dom',
        tagName: value.tagName,
        id: value.id || null,
        className: value.className || null,
        value: `<${value.tagName.toLowerCase()}${value.id ? '#' + value.id : ''}${value.className ? '.' + value.className.split(' ').join('.') : ''}>`
      };
    }

    // Array
    if (Array.isArray(value)) {
      // Check for circular reference
      if (visited.has(value)) {
        return {
          type: 'circular',
          value: `[Circular: ${path}]`
        };
      }
      visited.add(value);

      if (value.length > SERIALIZATION_CONFIG.MAX_ARRAY_LENGTH) {
        const truncated = value.slice(0, SERIALIZATION_CONFIG.MAX_ARRAY_LENGTH);
        return {
          type: 'array',
          value: truncated.map((item, i) => serializeValue(item, depth + 1, visited, `${path}[${i}]`)),
          truncated: true,
          totalLength: value.length,
          displayedLength: SERIALIZATION_CONFIG.MAX_ARRAY_LENGTH
        };
      }

      return {
        type: 'array',
        value: value.map((item, i) => serializeValue(item, depth + 1, visited, `${path}[${i}]`))
      };
    }

    // Object (must be last since many types are objects)
    if (type === 'object') {
      // Check for circular reference
      if (visited.has(value)) {
        return {
          type: 'circular',
          value: `[Circular: ${path}]`
        };
      }
      visited.add(value);

      try {
        const keys = Object.keys(value);
        const serialized = {};

        // Check if we need to truncate
        if (keys.length > SERIALIZATION_CONFIG.MAX_OBJECT_KEYS) {
          const truncatedKeys = keys.slice(0, SERIALIZATION_CONFIG.MAX_OBJECT_KEYS);

          for (const key of truncatedKeys) {
            try {
              serialized[key] = serializeValue(value[key], depth + 1, visited, `${path}.${key}`);
            } catch (error) {
              // Property access threw error (getter, etc.)
              serialized[key] = {
                type: 'error',
                value: `[Error accessing property: ${error.message}]`
              };
            }
          }

          return {
            type: 'object',
            className: value.constructor?.name,
            value: serialized,
            truncated: true,
            totalKeys: keys.length,
            displayedKeys: SERIALIZATION_CONFIG.MAX_OBJECT_KEYS
          };
        }

        // Serialize all keys
        for (const key of keys) {
          try {
            serialized[key] = serializeValue(value[key], depth + 1, visited, `${path}.${key}`);
          } catch (error) {
            // Property access threw error (getter, etc.)
            serialized[key] = {
              type: 'error',
              value: `[Error accessing property: ${error.message}]`
            };
          }
        }

        return {
          type: 'object',
          className: value.constructor?.name,
          value: serialized
        };
      } catch (error) {
        // Serialization failed
        return {
          type: 'object',
          value: `[Object - serialization failed: ${error.message}]`
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
    // Create a fresh WeakSet for each serialization
    // This allows circular references within a single console call
    // but prevents cross-argument circular tracking
    return Array.from(args).map((arg, index) => {
      return serializeValue(arg, 0, new WeakSet(), `arg[${index}]`);
    });
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
