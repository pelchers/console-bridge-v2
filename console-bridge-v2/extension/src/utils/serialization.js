/**
 * Object Serialization Utilities
 *
 * Handles serialization of complex objects for transmission via WebSocket.
 * Deals with circular references, DOM elements, functions, etc.
 */

/**
 * Serialize console arguments for transmission
 * @param {Array} args - Console method arguments
 * @returns {Array} Serialized arguments
 */
export function serializeConsoleArgs(args) {
  const seen = new WeakSet();

  function serialize(value) {
    // Handle primitives
    if (value === null) {
      return { type: 'null', value: null };
    }
    if (value === undefined) {
      return { type: 'undefined', value: undefined };
    }

    const type = typeof value;

    if (type === 'string') {
      return { type: 'string', value };
    }
    if (type === 'number') {
      return { type: 'number', value };
    }
    if (type === 'boolean') {
      return { type: 'boolean', value };
    }

    // Handle functions
    if (type === 'function') {
      return {
        type: 'function',
        value: value.toString(),
        name: value.name || '(anonymous)',
      };
    }

    // Handle objects (arrays, plain objects, etc.)
    if (type === 'object') {
      // Check for circular reference
      if (seen.has(value)) {
        return { type: 'circular', value: '[Circular Reference]' };
      }
      seen.add(value);

      // Handle arrays
      if (Array.isArray(value)) {
        return {
          type: 'array',
          value: value.map(item => serialize(item)),
        };
      }

      // Handle DOM elements
      if (value instanceof Element) {
        return {
          type: 'dom',
          value: value.outerHTML || value.toString(),
          tagName: value.tagName,
        };
      }

      // Handle plain objects
      try {
        const serialized = {};
        for (const key in value) {
          if (Object.prototype.hasOwnProperty.call(value, key)) {
            serialized[key] = serialize(value[key]);
          }
        }
        return { type: 'object', value: serialized };
      } catch (error) {
        return { type: 'error', value: `[Serialization Error: ${error.message}]` };
      }
    }

    // Fallback
    return { type: 'unknown', value: String(value) };
  }

  return args.map(arg => serialize(arg));
}
