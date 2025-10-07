/**
 * Console Bridge - DevTools Entry Point
 *
 * This script runs when DevTools opens and creates the Console Bridge panel.
 * It also handles injection of the console capture code into the inspected window.
 */

// Inject console capture immediately when DevTools opens
injectConsoleCapture();

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
  logToInspectedConsole('log', '[Console Bridge] DevTools extension loaded, injecting console capture...');

  // Fetch the console capture script
  fetch(chrome.runtime.getURL('content/console-capture.js'))
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to load console-capture.js: HTTP ${response.status}`);
      }
      return response.text();
    })
    .then(code => {
      // Inject the code into the inspected window
      // The code is an IIFE so we execute it immediately
      chrome.devtools.inspectedWindow.eval(
        code,
        { useContentScriptContext: false },
        (result, error) => {
          if (error) {
            logToInspectedConsole('error', '[Console Bridge] ❌ Injection failed: ' + JSON.stringify(error));
          } else {
            logToInspectedConsole('log', '[Console Bridge] ✅ Console capture injected successfully');
            // Set up listener for captured console events
            setupEventListener();
          }
        }
      );
    })
    .catch(error => {
      logToInspectedConsole('error', '[Console Bridge] ❌ Failed to fetch console-capture.js: ' + error.message);
    });
}

/**
 * Set up listener for console events from the injected code
 */
function setupEventListener() {
  // Inject a message listener into the inspected window
  // This will listen for postMessage events from console-capture.js
  // and log them to the console so we can see them during testing
  chrome.devtools.inspectedWindow.eval(`
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'console-bridge-event') {
        console.log('%c[Console Bridge Event]', 'color: #0066cc; font-weight: bold;', event.data);
      }
    });
    console.log('[Console Bridge] ✅ Event listener active - will display captured events');
  `);
}
