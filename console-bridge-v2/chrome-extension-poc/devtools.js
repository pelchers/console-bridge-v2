/**
 * Console Bridge DevTools Entry Point
 *
 * This script creates a new panel in Chrome DevTools.
 * The panel appears alongside Console, Network, Elements, etc.
 */

chrome.devtools.panels.create(
  'Console Bridge',           // Panel title
  'icons/icon16.png',         // Icon path (optional)
  'panel.html',               // Panel HTML file
  function(panel) {
    console.log('Console Bridge panel created');
  }
);
