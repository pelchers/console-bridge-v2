/**
 * Console Bridge - DevTools Entry Point
 *
 * This script runs when DevTools opens and creates the Console Bridge panel.
 * It also handles injection of the console capture code into the inspected window.
 */

// Flag to track if we've injected already
let injected = false;

// Create Console Bridge panel
chrome.devtools.panels.create(
  'Console Bridge',
  'icons/icon-16.png',
  'devtools/panel/panel.html',
  (panel) => {
    if (chrome.runtime.lastError) {
      console.error('[Console Bridge] Failed to create panel:', chrome.runtime.lastError);
      return;
    }

    console.log('[Console Bridge] Panel created');

    // Inject console capture when panel is first shown
    panel.onShown.addListener(() => {
      if (!injected) {
        injectConsoleCapture();
        injected = true;
      }
    });
  }
);

/**
 * Inject console capture code into the inspected window
 */
function injectConsoleCapture() {
  console.log('[Console Bridge] Injecting console capture...');

  // Fetch the console capture script
  fetch(chrome.runtime.getURL('content/console-capture.js'))
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to load console-capture.js: ${response.status}`);
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
            console.error('[Console Bridge] Failed to inject console capture:', error);
            // TODO: Display error in panel UI (Subtask 2.4)
          } else {
            console.log('[Console Bridge] Console capture injected successfully');
          }
        }
      );
    })
    .catch(error => {
      console.error('[Console Bridge] Failed to fetch console-capture.js:', error);
      // TODO: Display error in panel UI (Subtask 2.4)
    });
}

console.log('[Console Bridge] DevTools script loaded');
