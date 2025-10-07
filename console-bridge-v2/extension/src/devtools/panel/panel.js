/**
 * Console Bridge DevTools Panel
 *
 * This is the main UI for the Console Bridge extension.
 * Development environment version - basic functionality for Sprint 1.
 */

// State
const state = {
  eventsCount: 0,
  messagesCount: 0,
  errorsCount: 0,
  connectionStatus: 'disconnected',
};

// DOM Elements
const statusLight = document.getElementById('statusLight');
const statusText = document.getElementById('statusText');
const eventsCountEl = document.getElementById('eventsCount');
const messagesCountEl = document.getElementById('messagesCount');
const errorsCountEl = document.getElementById('errorsCount');

/**
 * Update UI with current state
 */
function updateUI() {
  // Update status indicator
  statusLight.className = 'status-light ' + state.connectionStatus;

  // Update status text
  const statusMessages = {
    connected: 'Connected to CLI',
    disconnected: 'Disconnected (CLI not running)',
    connecting: 'Connecting...',
  };
  statusText.textContent = statusMessages[state.connectionStatus] || 'Unknown';

  // Update statistics
  eventsCountEl.textContent = state.eventsCount;
  messagesCountEl.textContent = state.messagesCount;
  errorsCountEl.textContent = state.errorsCount;
}

/**
 * Initialize panel
 */
function init() {
  console.log('Console Bridge panel initialized (Development Mode)');

  // Set initial status
  state.connectionStatus = 'disconnected';
  updateUI();

  // Simulate connection attempt (development mode)
  setTimeout(() => {
    console.log('Development mode: WebSocket connection not implemented yet');
    console.log('This will be implemented in Sprint 2');
  }, 1000);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
