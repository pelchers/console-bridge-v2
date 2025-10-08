# ADR: Subtask 2.2 - Advanced Object Serialization (PRELIMINARY)

**Date:** 2025-10-07
**Status:** 🚧 In Progress
**Branch:** `phase-2-subtask-2.2`
**Depends on:** Subtask 2.1 (✅ Completed)

---

## Context

Subtask 2.1 implemented basic console capture with primitive type serialization. However, it has several known limitations:

1. **No circular reference detection** - Circular objects cause stack overflow
2. **No depth limiting** - Deep nested structures can crash the extension
3. **No size limiting** - Large strings/objects not truncated, causing performance issues
4. **Missing special types** - Symbol, BigInt, WeakMap, WeakSet, Proxy not handled
5. **Basic error messages** - Serialization failures provide limited context

Subtask 2.2 addresses these limitations by implementing production-ready object serialization.

---

## Goals

### Primary Objectives

1. **Circular Reference Detection**
   - Detect and handle circular references in objects and arrays
   - Return `[Circular: path.to.object]` indicator
   - Track visited objects using WeakSet

2. **Depth Limiting**
   - Set maximum nesting depth (default: 10 levels)
   - Return `[Object - max depth exceeded]` / `[Array - max depth exceeded]` indicators
   - Make depth limit configurable

3. **Size Limiting**
   - Limit string length (default: 10KB = 10,240 characters)
   - Limit object key count (default: 1000 keys)
   - Limit array length (default: 1000 items)
   - Return truncation indicators with actual sizes

4. **Special Type Support**
   - Symbol: `Symbol(description)`
   - BigInt: Preserve value with 'n' suffix
   - WeakMap / WeakSet: `[WeakMap]` / `[WeakSet]`
   - Map: Serialize entries as array of [key, value] pairs
   - Set: Serialize values as array
   - Typed Arrays: `[TypedArray Int32Array(100)]`
   - ArrayBuffer: `[ArrayBuffer 1024 bytes]`
   - Proxy: Detect and indicate `[Proxy]`
   - Promise: `[Promise <pending/fulfilled/rejected>]`
   - Date: ISO 8601 string
   - RegExp: `/pattern/flags`

5. **Enhanced Error Handling**
   - Provide context for serialization failures
   - Indicate where truncation occurred
   - Add statistics (depth reached, items truncated, etc.)

---

## Proposed Architecture

### 1. Enhanced serializeValue() Function

**Current signature:**
```javascript
function serializeValue(value)
```

**New signature:**
```javascript
function serializeValue(value, depth = 0, visited = new WeakSet(), path = 'root')
```

**Parameters:**
- `value` - The value to serialize
- `depth` - Current nesting depth (starts at 0)
- `visited` - WeakSet tracking already-visited objects (circular detection)
- `path` - String representing path to current value (for circular reference messages)

### 2. Configuration Constants

Add configurable limits at the top of `console-capture.js`:

```javascript
const SERIALIZATION_CONFIG = {
  MAX_DEPTH: 10,
  MAX_STRING_LENGTH: 10240, // 10KB
  MAX_OBJECT_KEYS: 1000,
  MAX_ARRAY_LENGTH: 1000,
  MAX_MAP_ENTRIES: 100,
  MAX_SET_VALUES: 100,
};
```

### 3. Circular Reference Detection Strategy

**Use WeakSet for tracking visited objects:**

```javascript
// Check if object was already visited (circular reference)
if (visited.has(value)) {
  return {
    type: 'circular',
    value: `[Circular: ${path}]`
  };
}

// Add to visited set before recursing
visited.add(value);

// Recurse into object properties
for (const key in value) {
  if (value.hasOwnProperty(key)) {
    serialized[key] = serializeValue(
      value[key],
      depth + 1,
      visited,
      `${path}.${key}`
    );
  }
}
```

### 4. Depth Limiting Strategy

**Check depth before recursing:**

```javascript
if (depth >= SERIALIZATION_CONFIG.MAX_DEPTH) {
  return {
    type: 'max-depth',
    value: Array.isArray(value)
      ? '[Array - max depth exceeded]'
      : '[Object - max depth exceeded]'
  };
}
```

### 5. Size Limiting Strategy

**Strings:**
```javascript
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
```

**Objects:**
```javascript
const keys = Object.keys(value);
if (keys.length > SERIALIZATION_CONFIG.MAX_OBJECT_KEYS) {
  // Serialize first N keys, add truncation indicator
  const serialized = {};
  const truncatedKeys = keys.slice(0, SERIALIZATION_CONFIG.MAX_OBJECT_KEYS);

  for (const key of truncatedKeys) {
    serialized[key] = serializeValue(value[key], depth + 1, visited, `${path}.${key}`);
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
```

**Arrays:**
```javascript
if (Array.isArray(value)) {
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
```

### 6. Special Type Handling

**Symbol:**
```javascript
if (type === 'symbol') {
  return {
    type: 'symbol',
    value: value.toString() // "Symbol(description)"
  };
}
```

**BigInt:**
```javascript
if (type === 'bigint') {
  return {
    type: 'bigint',
    value: value.toString() + 'n'
  };
}
```

**Map:**
```javascript
if (value instanceof Map) {
  const entries = Array.from(value.entries()).slice(0, SERIALIZATION_CONFIG.MAX_MAP_ENTRIES);
  return {
    type: 'map',
    size: value.size,
    entries: entries.map(([k, v], i) => ({
      key: serializeValue(k, depth + 1, visited, `${path}.key[${i}]`),
      value: serializeValue(v, depth + 1, visited, `${path}.value[${i}]`)
    })),
    truncated: value.size > SERIALIZATION_CONFIG.MAX_MAP_ENTRIES
  };
}
```

**Set:**
```javascript
if (value instanceof Set) {
  const values = Array.from(value).slice(0, SERIALIZATION_CONFIG.MAX_SET_VALUES);
  return {
    type: 'set',
    size: value.size,
    values: values.map((v, i) => serializeValue(v, depth + 1, visited, `${path}[${i}]`)),
    truncated: value.size > SERIALIZATION_CONFIG.MAX_SET_VALUES
  };
}
```

**WeakMap / WeakSet:**
```javascript
if (value instanceof WeakMap) {
  return { type: 'weakmap', value: '[WeakMap]' };
}
if (value instanceof WeakSet) {
  return { type: 'weakset', value: '[WeakSet]' };
}
```

**Date:**
```javascript
if (value instanceof Date) {
  return {
    type: 'date',
    value: value.toISOString()
  };
}
```

**RegExp:**
```javascript
if (value instanceof RegExp) {
  return {
    type: 'regexp',
    value: value.toString() // "/pattern/flags"
  };
}
```

**Typed Arrays:**
```javascript
if (ArrayBuffer.isView(value) && !(value instanceof DataView)) {
  return {
    type: 'typedarray',
    arrayType: value.constructor.name,
    length: value.length,
    value: `[${value.constructor.name}(${value.length})]`
  };
}
```

**ArrayBuffer:**
```javascript
if (value instanceof ArrayBuffer) {
  return {
    type: 'arraybuffer',
    byteLength: value.byteLength,
    value: `[ArrayBuffer ${value.byteLength} bytes]`
  };
}
```

**Promise:**
```javascript
if (value instanceof Promise) {
  return {
    type: 'promise',
    value: '[Promise]'
  };
}
```

**Proxy Detection (Best Effort):**
```javascript
// Check if value is likely a Proxy (no reliable detection method)
try {
  const descriptor = Object.getOwnPropertyDescriptor(value, '__isProxy__');
  if (descriptor) {
    return { type: 'proxy', value: '[Proxy]' };
  }
} catch (e) {
  // Proxy may throw on property access
  return { type: 'proxy', value: '[Proxy]' };
}
```

---

## Implementation Plan

### Phase 1: Circular Reference Detection (30 min)
1. Add `visited` WeakSet parameter to `serializeValue()`
2. Add circular reference check at start of object/array serialization
3. Pass `visited` set to recursive calls
4. Test with circular objects

### Phase 2: Depth Limiting (20 min)
1. Add `depth` parameter to `serializeValue()`
2. Add depth check before recursing into objects/arrays
3. Increment depth for recursive calls
4. Add `MAX_DEPTH` configuration constant
5. Test with deeply nested structures

### Phase 3: Size Limiting (45 min)
1. Add string truncation with length indicator
2. Add object key limiting with count indicator
3. Add array length limiting with count indicator
4. Add Map/Set size limiting
5. Add configuration constants
6. Test with large strings, objects, arrays

### Phase 4: Special Type Support (60 min)
1. Add Symbol handling
2. Add BigInt handling
3. Add Map/Set serialization
4. Add WeakMap/WeakSet indicators
5. Add Date/RegExp serialization
6. Add TypedArray/ArrayBuffer handling
7. Add Promise indicator
8. Add Proxy detection (best effort)
9. Test each special type

### Phase 5: Enhanced Error Handling (15 min)
1. Add try-catch blocks around property access
2. Add descriptive error messages
3. Include path context in error messages
4. Test with objects that throw on property access

### Phase 6: Testing (90 min)
1. Create comprehensive test page
2. Test circular references (simple, complex, nested)
3. Test depth limits (exactly at limit, over limit)
4. Test size limits (strings, objects, arrays, Maps, Sets)
5. Test all special types
6. Test edge cases (null prototype, getters that throw, etc.)
7. Performance testing (large objects)

---

## Testing Strategy

### Test Scenarios

**Circular References:**
- Simple circular: `obj.self = obj`
- Mutual circular: `obj1.ref = obj2; obj2.ref = obj1`
- Array circular: `arr[0] = arr`
- Nested circular: `obj.a.b.c.ref = obj`

**Depth Limiting:**
- Exactly 10 levels deep
- 11+ levels deep
- Mixed arrays and objects

**Size Limiting:**
- String: 10KB, 20KB, 100KB
- Object: 500 keys, 1000 keys, 2000 keys
- Array: 500 items, 1000 items, 2000 items
- Map/Set: 50 entries, 100 entries, 200 entries

**Special Types:**
- Symbol (with and without description)
- BigInt (small and large values)
- Map (empty, small, large)
- Set (empty, small, large)
- WeakMap / WeakSet
- Date (valid, invalid)
- RegExp (simple, complex)
- TypedArray (Int8Array, Uint32Array, Float64Array)
- ArrayBuffer (small, large)
- Promise (pending, resolved, rejected)
- Proxy (basic, with traps)

**Edge Cases:**
- Object with null prototype
- Getter that throws error
- Non-enumerable properties
- Symbol keys
- Frozen/sealed objects
- Mixed nested types

---

## Success Criteria

### SC-2.2.1: Circular Reference Detection
- ✅ Circular references detected and indicated with `[Circular: path]`
- ✅ No stack overflow errors
- ✅ Path indicates where circular reference points

### SC-2.2.2: Depth Limiting
- ✅ Objects deeper than MAX_DEPTH return `[Object - max depth exceeded]`
- ✅ Arrays deeper than MAX_DEPTH return `[Array - max depth exceeded]`
- ✅ Configurable depth limit works correctly

### SC-2.2.3: Size Limiting
- ✅ Strings longer than 10KB truncated with indicator
- ✅ Objects with >1000 keys truncated with count
- ✅ Arrays with >1000 items truncated with count
- ✅ Maps/Sets with too many entries truncated
- ✅ Truncation indicators show actual sizes

### SC-2.2.4: Special Type Support
- ✅ Symbol serializes to `Symbol(description)`
- ✅ BigInt serializes with 'n' suffix
- ✅ Map serializes entries correctly
- ✅ Set serializes values correctly
- ✅ WeakMap/WeakSet show indicators
- ✅ Date serializes to ISO 8601
- ✅ RegExp serializes with pattern and flags
- ✅ TypedArray shows type and length
- ✅ ArrayBuffer shows byte length
- ✅ Promise shows indicator
- ✅ Proxy detected (best effort)

### SC-2.2.5: Performance
- ✅ No noticeable slowdown for normal console usage
- ✅ Large objects handled gracefully (no freezing)
- ✅ Serialization completes in <100ms for typical objects

### SC-2.2.6: Error Handling
- ✅ Serialization failures don't break console
- ✅ Error messages provide useful context
- ✅ Getters that throw don't crash serialization

---

## Risks & Mitigations

### Risk 1: WeakSet Performance for Large Object Graphs
**Impact:** Medium
**Mitigation:** WeakSet operations are O(1), should be fine. Monitor performance during testing.

### Risk 2: Path String Memory Usage
**Impact:** Low
**Mitigation:** Paths are short-lived strings, GC will clean up. Could optimize by passing depth only if needed.

### Risk 3: Special Type Detection Edge Cases
**Impact:** Low
**Mitigation:** Use defensive coding, test thoroughly. Some types may not be perfectly detected (e.g., Proxy).

### Risk 4: Truncation May Hide Important Data
**Impact:** Low
**Mitigation:** Limits are generous (10KB, 1000 items). Users can see full data in browser console. Consider adding "expand" feature in future.

---

## Dependencies

- ✅ Subtask 2.1 (Console Capture) - Completed
- ❌ None other - Fully independent

---

## Estimated Time

- Implementation: 3 hours
- Testing: 1.5 hours
- Documentation: 0.5 hour
- **Total: 5 hours**

---

## Future Enhancements (Out of Scope)

1. Configurable limits via extension settings panel
2. "Expand" button to fetch full object data on demand
3. Lazy serialization (only serialize when needed)
4. Binary data preview (hex dump for ArrayBuffers)
5. Custom serialization for framework-specific types (React components, Vue instances, etc.)

---

## References

- MDN: WeakSet - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet
- MDN: Symbol - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol
- MDN: BigInt - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt
- MDN: Map - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
- MDN: Set - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
- MDN: TypedArray - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray
- V8 Blog: Fast properties - https://v8.dev/blog/fast-properties

---

**Status:** Ready for implementation
**Next Step:** Implement circular reference detection (Phase 1)
