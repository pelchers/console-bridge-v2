/**
 * E2E Test Helpers
 * Utilities for end-to-end testing with real Puppeteer instances
 */

const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

/**
 * Start console-bridge CLI process
 * @param {string[]} args - CLI arguments
 * @returns {{child: ChildProcess, output: string[], getOutput: Function, waitForOutput: Function}}
 */
function startConsoleBridge(args = []) {
  const child = spawn('console-bridge', args);
  const output = [];

  child.stdout.on('data', (data) => {
    output.push(data.toString());
  });

  child.stderr.on('data', (data) => {
    output.push(data.toString());
  });

  /**
   * Get combined output as single string
   */
  const getOutput = () => output.join('');

  /**
   * Wait for specific text in output
   * @param {string} searchString - Text to wait for
   * @param {number} timeout - Timeout in ms
   * @returns {Promise<string>} Combined output when found
   */
  const waitForOutput = async (searchString, timeout = 5000) => {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const combined = output.join('');
      if (combined.includes(searchString)) {
        return combined;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    throw new Error(`Timeout waiting for: "${searchString}" in output:\n${output.join('')}`);
  };

  return { child, output, getOutput, waitForOutput };
}

/**
 * Start test HTTP server
 * @param {number} port - Port to listen on
 * @param {string} htmlFile - Path to HTML file to serve
 * @returns {http.Server}
 */
function startTestServer(port, htmlFile) {
  const html = fs.readFileSync(htmlFile, 'utf8');

  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  });

  server.listen(port);
  return server;
}

/**
 * Wait for server to be ready
 * @param {number} port - Port to check
 * @param {number} timeout - Timeout in ms
 */
async function waitForServer(port, timeout = 5000) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:${port}`, resolve);
        req.on('error', reject);
        req.end();
      });
      return true;
    } catch (error) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  throw new Error(`Server on port ${port} did not start within ${timeout}ms`);
}

/**
 * Kill all console-bridge processes
 */
async function killConsoleBridgeProcesses() {
  const isWindows = process.platform === 'win32';

  if (isWindows) {
    spawn('taskkill', ['/F', '/IM', 'node.exe', '/FI', 'WINDOWTITLE eq console-bridge*']);
  } else {
    spawn('pkill', ['-f', 'console-bridge']);
  }

  await new Promise(resolve => setTimeout(resolve, 1000));
}

/**
 * Get fixture file path
 * @param {string} filename - Fixture filename
 * @returns {string} Absolute path to fixture
 */
function getFixturePath(filename) {
  return path.join(__dirname, 'fixtures', filename);
}

module.exports = {
  startConsoleBridge,
  startTestServer,
  waitForServer,
  killConsoleBridgeProcesses,
  getFixturePath,
};
