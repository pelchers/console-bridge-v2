/**
 * Jest setup file
 * Runs before each test suite
 */

// Mock Chrome APIs using sinon-chrome
import sinonChrome from 'sinon-chrome/index.js';

// Make chrome API available globally
global.chrome = sinonChrome;

// Reset mocks before each test
beforeEach(() => {
  sinonChrome.reset();
});

// Clean up after each test
afterEach(() => {
  sinonChrome.flush();
});
