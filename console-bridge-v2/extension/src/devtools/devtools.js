/**
 * Console Bridge - DevTools Entry Point
 *
 * This script runs when DevTools opens and creates the Console Bridge panel.
 * It also handles injection of the console capture code into the inspected window.
 */

// Inject console capture immediately when DevTools opens
setTimeout(() => {
  injectConsoleCapture();
}, 100);

// Create Console Bridge panel
chrome.devtools.panels.create(
  'Console Bridge',
  '', // No icon for now (will add in future)
  'devtools/panel/panel.html',
  (panel) => {
    if (chrome.runtime.lastError) {
      // Log error to inspected window console so user can see it
      logToInspectedConsole('error', '[Console Bridge] Failed to create panel: ' + chrome.runtime.lastError.message);
      return;
    }

    logToInspectedConsole('log', '[Console Bridge] Panel created successfully');
  }
);

/**
 * Log a message to the inspected window's console (so user can see it)
 */
function logToInspectedConsole(level, message) {
  chrome.devtools.inspectedWindow.eval(
    `console.${level}(${JSON.stringify(message)});`
  );
}

/**
 * Inject console capture code into the inspected window
 */
function injectConsoleCapture() {
  logToInspectedConsole('log', '[Console Bridge] Injecting console capture...');

  // Fetch the console capture script
  const scriptURL = chrome.runtime.getURL('content/console-capture.js');

  fetch(scriptURL)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to load console-capture.js: HTTP ${response.status}`);
      }
      return response.text();
    })
    .then(code => {
      // Inject the code into the inspected window
      chrome.devtools.inspectedWindow.eval(
        code,
        { useContentScriptContext: false },
        (result, error) => {
          if (error) {
            logToInspectedConsole('error', '[Console Bridge] ❌ Injection failed: ' + JSON.stringify(error));
          } else {
            logToInspectedConsole('log', '[Console Bridge] ✅ Console capture active');
            setupEventListener();
          }
        }
      );
    })
    .catch(error => {
      logToInspectedConsole('error', '[Console Bridge] ❌ Failed to load extension: ' + error.message);
    });
}

/**
 * Set up listener for console events from the injected code
 */
function setupEventListener() {
  // Inject a message listener into the inspected window
  // This will listen for postMessage events from console-capture.js
  // In the future (Subtask 2.3), this will forward events to WebSocket client
  chrome.devtools.inspectedWindow.eval(`
    let capturedEventCount = 0;
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'console-bridge-event') {
        capturedEventCount++;
        // TODO: In Subtask 2.3, forward event.data to WebSocket client
        // For now, we just count them silently to avoid infinite loops
      }
    });
    console.log('[Console Bridge] ✅ Event listener active - capturing console events');
    console.log('[Console Bridge] Events will be sent to CLI via WebSocket (coming in Subtask 2.3)');
  `);
}
