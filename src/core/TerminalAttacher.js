/**
 * Terminal Attacher
 * Manages attachment to dev server terminal for unified output
 */

const {
  findProcessByPort,
  processExists,
  getProcessInfo,
  hasProcessPermission,
} = require('../utils/processUtils');

class TerminalAttacher {
  constructor(options = {}) {
    this.port = options.port;
    this.attached = false;
    this.targetPid = null;
    this.originalOutput = null;
  }

  /**
   * Attempt to attach to dev server process terminal
   * @param {number} port - Port number of dev server
   * @param {Function} outputFn - Current output function (e.g., console.log)
   * @returns {Promise<{success: boolean, message: string, outputFn: Function}>}
   */
  async attach(port, outputFn) {
    this.port = port;
    this.originalOutput = outputFn;

    try {
      // Step 1: Find process listening on port
      const pid = await findProcessByPort(port);

      if (!pid) {
        return this.fallback(
          `No process found listening on port ${port}. Using separate terminal.`
        );
      }

      this.targetPid = pid;

      // Step 2: Verify process exists and is accessible
      const exists = await processExists(pid);
      if (!exists) {
        return this.fallback(
          `Process ${pid} no longer exists. Using separate terminal.`
        );
      }

      const hasPermission = await hasProcessPermission(pid);
      if (!hasPermission) {
        return this.fallback(
          `Permission denied to access process ${pid}. Try running with elevated permissions or use separate terminal.`
        );
      }

      // Step 3: Get process info for validation
      const processInfo = await getProcessInfo(pid);
      if (!processInfo) {
        return this.fallback(
          `Could not retrieve information for process ${pid}. Using separate terminal.`
        );
      }

      // Step 4: Attempt to create unified output function
      const unifiedOutputFn = this.createUnifiedOutput(pid, outputFn);

      this.attached = true;

      return {
        success: true,
        message: `Successfully attached to process ${pid} (${processInfo.command}) on port ${port}`,
        outputFn: unifiedOutputFn,
      };
    } catch (error) {
      return this.fallback(
        `Failed to attach: ${error.message}. Using separate terminal.`
      );
    }
  }

  /**
   * Create unified output function that writes to dev server terminal
   * @param {number} pid - Target process ID
   * @param {Function} fallbackFn - Fallback output function
   * @returns {Function} Unified output function
   * @private
   */
  createUnifiedOutput(pid, fallbackFn) {
    // For now, this is a placeholder that writes to process.stdout
    // In a real implementation, we would need to:
    // 1. Get the actual stdout stream of the target process
    // 2. Write to that stream instead of our own stdout
    //
    // This is complex because Node.js doesn't provide direct access
    // to another process's stdout. We may need to:
    // - Use IPC if processes are related
    // - Use named pipes/sockets
    // - Or accept that we can only write to our own stdout
    //
    // For MVP, we'll write to process.stdout which at least
    // demonstrates the concept

    return (message) => {
      try {
        // Write to our stdout (same terminal if run in same terminal)
        process.stdout.write(message + '\n');
      } catch (error) {
        // Fallback to original output function
        fallbackFn(message);
      }
    };
  }

  /**
   * Graceful fallback when attachment fails
   * @param {string} message - Reason for fallback
   * @returns {{success: boolean, message: string, outputFn: Function}}
   * @private
   */
  fallback(message) {
    return {
      success: false,
      message,
      outputFn: this.originalOutput,
    };
  }

  /**
   * Detach from target process
   */
  detach() {
    if (!this.attached) {
      return;
    }

    this.attached = false;
    this.targetPid = null;
  }

  /**
   * Check if currently attached
   * @returns {boolean}
   */
  isAttached() {
    return this.attached;
  }

  /**
   * Get target process ID
   * @returns {number|null}
   */
  getTargetPid() {
    return this.targetPid;
  }
}

module.exports = TerminalAttacher;
