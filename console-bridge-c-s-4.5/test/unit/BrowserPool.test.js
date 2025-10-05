/**
 * BrowserPool Tests
 */

const BrowserPool = require('../../src/core/BrowserPool');

describe('BrowserPool', () => {
  let pool;

  beforeEach(() => {
    pool = new BrowserPool({ maxInstances: 3 });
  });

  afterEach(async () => {
    if (pool) {
      await pool.destroyAll();
    }
  });

  describe('constructor', () => {
    test('creates pool with default maxInstances', () => {
      const defaultPool = new BrowserPool();
      expect(defaultPool.maxInstances).toBe(10);
    });

    test('creates pool with custom maxInstances', () => {
      expect(pool.maxInstances).toBe(3);
    });

    test('defaults to headless mode', () => {
      expect(pool.headless).toBe(true);
    });
  });

  describe('create', () => {
    test('creates a new browser instance', async () => {
      const instance = await pool.create('http://localhost:3000');
      
      expect(instance).toHaveProperty('browser');
      expect(instance).toHaveProperty('page');
      expect(instance).toHaveProperty('url');
      expect(instance.url).toBe('http://localhost:3000');
    }, 30000);

    test('returns existing instance if URL already exists', async () => {
      const instance1 = await pool.create('http://localhost:3000');
      const instance2 = await pool.create('http://localhost:3000');
      
      expect(instance1).toBe(instance2);
    }, 30000);

    test('throws error when max instances reached', async () => {
      await pool.create('http://localhost:3001');
      await pool.create('http://localhost:3002');
      await pool.create('http://localhost:3003');
      
      await expect(pool.create('http://localhost:3004')).rejects.toThrow(
        'Maximum instances reached'
      );
    }, 30000);
  });

  describe('get', () => {
    test('returns existing instance', async () => {
      const created = await pool.create('http://localhost:3000');
      const retrieved = pool.get('http://localhost:3000');
      
      expect(retrieved).toBe(created);
    }, 30000);

    test('returns undefined for non-existent URL', () => {
      const retrieved = pool.get('http://localhost:9999');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('has', () => {
    test('returns true for existing URL', async () => {
      await pool.create('http://localhost:3000');
      expect(pool.has('http://localhost:3000')).toBe(true);
    }, 30000);

    test('returns false for non-existent URL', () => {
      expect(pool.has('http://localhost:9999')).toBe(false);
    });
  });

  describe('count', () => {
    test('returns 0 initially', () => {
      expect(pool.count()).toBe(0);
    });

    test('returns correct count after creating instances', async () => {
      await pool.create('http://localhost:3001');
      expect(pool.count()).toBe(1);
      
      await pool.create('http://localhost:3002');
      expect(pool.count()).toBe(2);
    }, 30000);
  });

  describe('getUrls', () => {
    test('returns empty array initially', () => {
      expect(pool.getUrls()).toEqual([]);
    });

    test('returns all URLs', async () => {
      await pool.create('http://localhost:3001');
      await pool.create('http://localhost:3002');
      
      const urls = pool.getUrls();
      expect(urls).toHaveLength(2);
      expect(urls).toContain('http://localhost:3001');
      expect(urls).toContain('http://localhost:3002');
    }, 30000);
  });

  describe('destroy', () => {
    test('destroys specific instance', async () => {
      await pool.create('http://localhost:3000');
      expect(pool.count()).toBe(1);
      
      await pool.destroy('http://localhost:3000');
      expect(pool.count()).toBe(0);
      expect(pool.has('http://localhost:3000')).toBe(false);
    }, 30000);

    test('does nothing for non-existent URL', async () => {
      await expect(pool.destroy('http://localhost:9999')).resolves.not.toThrow();
    });
  });

  describe('destroyAll', () => {
    test('destroys all instances', async () => {
      await pool.create('http://localhost:3001');
      await pool.create('http://localhost:3002');
      expect(pool.count()).toBe(2);
      
      await pool.destroyAll();
      expect(pool.count()).toBe(0);
    }, 30000);

    test('does nothing when no instances exist', async () => {
      await expect(pool.destroyAll()).resolves.not.toThrow();
    });
  });
});
