/**
 * Console Bridge DevTools Entry Point
 *
 * This script creates a new panel in Chrome DevTools.
 * The panel appears alongside Console, Network, Elements, etc.
 */

chrome.devtools.panels.create(
  'Console Bridge', // Panel title
  '', // Icon path (empty for now)
  'devtools/panel/panel.html', // Panel HTML file
  _panel => {
    if (chrome.runtime.lastError) {
      console.error('Failed to create Console Bridge panel:', chrome.runtime.lastError);
    } else {
      console.log('Console Bridge panel created successfully');
    }
  },
);
