/**
 * Process Utilities
 * Cross-platform process discovery and management
 */

const { exec } = require('child_process');
const os = require('os');
const { promisify } = require('util');

const execAsync = promisify(exec);

/**
 * Get current platform
 * @returns {string} 'windows', 'darwin', or 'linux'
 */
function getPlatform() {
  const platform = os.platform();

  if (platform === 'win32') {
    return 'windows';
  } else if (platform === 'darwin') {
    return 'darwin';
  } else {
    return 'linux';
  }
}

/**
 * Find process ID (PID) listening on a specific port
 * @param {number} port - Port number to search
 * @returns {Promise<number|null>} PID if found, null if not found
 */
async function findProcessByPort(port) {
  const platform = getPlatform();

  try {
    if (platform === 'windows') {
      return await findProcessByPortWindows(port);
    } else {
      return await findProcessByPortUnix(port);
    }
  } catch (error) {
    // Process not found or command failed
    return null;
  }
}

/**
 * Find process on Unix-like systems (macOS, Linux) using lsof
 * @param {number} port - Port number
 * @returns {Promise<number|null>} PID or null
 * @private
 */
async function findProcessByPortUnix(port) {
  try {
    // lsof -t -i :PORT returns PIDs listening on that port
    // -t: terse output (PID only)
    // -i: internet connections
    const { stdout } = await execAsync(`lsof -t -i :${port}`);

    const pids = stdout
      .trim()
      .split('\n')
      .map(pid => parseInt(pid.trim(), 10))
      .filter(pid => !isNaN(pid));

    if (pids.length === 0) {
      return null;
    }

    // Return first PID (typically the main process)
    return pids[0];
  } catch (error) {
    // lsof not found or no process on port
    return null;
  }
}

/**
 * Find process on Windows using netstat
 * @param {number} port - Port number
 * @returns {Promise<number|null>} PID or null
 * @private
 */
async function findProcessByPortWindows(port) {
  try {
    // netstat -ano | findstr :PORT
    // -a: all connections
    // -n: numerical addresses
    // -o: show PID
    const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);

    // Parse netstat output
    // Format: TCP    0.0.0.0:3847    0.0.0.0:0    LISTENING    12345
    const lines = stdout.trim().split('\n');

    for (const line of lines) {
      const parts = line.trim().split(/\s+/);

      // Find LISTENING state
      if (parts.includes('LISTENING')) {
        const pidIndex = parts.length - 1;
        const pid = parseInt(parts[pidIndex], 10);

        if (!isNaN(pid)) {
          return pid;
        }
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Validate that a process exists
 * @param {number} pid - Process ID
 * @returns {Promise<boolean>} true if process exists
 */
async function processExists(pid) {
  if (!pid || isNaN(pid)) {
    return false;
  }

  const platform = getPlatform();

  try {
    if (platform === 'windows') {
      // Windows: tasklist /FI "PID eq {pid}"
      const { stdout } = await execAsync(`tasklist /FI "PID eq ${pid}"`);
      return stdout.includes(String(pid));
    } else {
      // Unix: ps -p {pid}
      const { stdout } = await execAsync(`ps -p ${pid}`);
      return stdout.includes(String(pid));
    }
  } catch (error) {
    return false;
  }
}

/**
 * Get process information
 * @param {number} pid - Process ID
 * @returns {Promise<{pid: number, command: string}|null>} Process info or null
 */
async function getProcessInfo(pid) {
  if (!pid || isNaN(pid)) {
    return null;
  }

  const platform = getPlatform();

  try {
    if (platform === 'windows') {
      const { stdout } = await execAsync(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`);

      // Parse CSV: "imagename","PID","Session Name","Session#","Mem Usage"
      const parts = stdout.trim().split(',');
      if (parts.length >= 2) {
        return {
          pid,
          command: parts[0].replace(/"/g, '').trim(),
        };
      }
    } else {
      // Unix: ps -p {pid} -o comm=
      const { stdout } = await execAsync(`ps -p ${pid} -o comm=`);
      return {
        pid,
        command: stdout.trim(),
      };
    }
  } catch (error) {
    return null;
  }

  return null;
}

/**
 * Check if current user has permission to access process
 * @param {number} pid - Process ID
 * @returns {Promise<boolean>} true if accessible
 */
async function hasProcessPermission(pid) {
  // If we can get process info, we have permission
  const info = await getProcessInfo(pid);
  return info !== null;
}

module.exports = {
  getPlatform,
  findProcessByPort,
  processExists,
  getProcessInfo,
  hasProcessPermission,
};
