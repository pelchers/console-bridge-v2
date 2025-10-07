/**
 * Tests for serialization utilities
 */

import { serializeConsoleArgs } from '../../src/utils/serialization';

describe('serializeConsoleArgs', () => {
  test('serializes primitives correctly', () => {
    const args = ['hello', 42, true, null, undefined];
    const result = serializeConsoleArgs(args);

    expect(result[0]).toEqual({ type: 'string', value: 'hello' });
    expect(result[1]).toEqual({ type: 'number', value: 42 });
    expect(result[2]).toEqual({ type: 'boolean', value: true });
    expect(result[3]).toEqual({ type: 'null', value: null });
    expect(result[4]).toEqual({ type: 'undefined', value: undefined });
  });

  test('serializes arrays correctly', () => {
    const args = [[1, 2, 3]];
    const result = serializeConsoleArgs(args);

    expect(result[0].type).toBe('array');
    expect(result[0].value).toHaveLength(3);
    expect(result[0].value[0]).toEqual({ type: 'number', value: 1 });
  });

  test('serializes objects correctly', () => {
    const args = [{ foo: 'bar', nested: { value: 42 } }];
    const result = serializeConsoleArgs(args);

    expect(result[0].type).toBe('object');
    expect(result[0].value.foo).toEqual({ type: 'string', value: 'bar' });
    expect(result[0].value.nested.type).toBe('object');
  });

  test('handles circular references', () => {
    const circular = {};
    circular.self = circular;

    const args = [circular];
    const result = serializeConsoleArgs(args);

    expect(result[0].type).toBe('object');
    expect(result[0].value.self.type).toBe('circular');
  });

  test('serializes functions correctly', () => {
    function testFunc() {
      return 'test';
    }

    const args = [testFunc];
    const result = serializeConsoleArgs(args);

    expect(result[0].type).toBe('function');
    expect(result[0].name).toBe('testFunc');
    expect(result[0].value).toContain('function testFunc()');
  });
});
