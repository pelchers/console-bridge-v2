#!/usr/bin/env node

/**
 * Icon Generator for Console Bridge Chrome Extension
 *
 * Generates three PNG icons (16x16, 48x48, 128x128) following design guidelines:
 * - Concept: Terminal bridge symbol with ">_" prompt
 * - Colors: Blue background (#2196F3), White foreground (#FFFFFF), Green accent (#4CAF50)
 * - Style: Flat, high contrast, professional
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Color palette
const COLORS = {
  blue: '#2196F3',      // Primary background
  white: '#FFFFFF',     // Foreground symbols
  green: '#4CAF50',     // Accent/connection
  dark: '#263238'       // Terminal dark
};

/**
 * Draw icon at specified size
 * Design: Circle with terminal ">_" and bridge connection symbol
 */
function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Anti-aliasing for smooth edges
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Background: Blue circle
  ctx.fillStyle = COLORS.blue;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();

  // Calculate scaling factor
  const scale = size / 128; // Base design on 128px

  // Draw terminal prompt ">_" symbol
  ctx.fillStyle = COLORS.white;
  ctx.font = `bold ${Math.floor(size * 0.5)}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (size === 16) {
    // Simplified for 16px: just ">_"
    ctx.font = `bold ${Math.floor(size * 0.6)}px monospace`;
    ctx.fillText('>_', size / 2, size / 2);
  } else if (size === 48) {
    // Medium: ">_" with small connection line
    ctx.fillText('>_', size / 2, size / 2);

    // Small green dot (connection indicator)
    ctx.fillStyle = COLORS.green;
    ctx.beginPath();
    ctx.arc(size * 0.75, size * 0.25, size * 0.08, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // 128px: Full design with connection bridge
    ctx.fillText('>_', size / 2, size / 2);

    // Green connection arc (bridge symbol)
    ctx.strokeStyle = COLORS.green;
    ctx.lineWidth = size * 0.04;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(size / 2, size * 0.25, size * 0.15, 0, Math.PI);
    ctx.stroke();

    // Connection dots
    ctx.fillStyle = COLORS.green;
    ctx.beginPath();
    ctx.arc(size * 0.35, size * 0.25, size * 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(size * 0.65, size * 0.25, size * 0.05, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas;
}

/**
 * Generate and save icon
 */
function generateIcon(size, outputPath) {
  console.log(`Generating ${size}x${size} icon...`);
  const canvas = drawIcon(size);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`✓ Saved: ${outputPath}`);
}

/**
 * Main execution
 */
function main() {
  const iconsDir = path.join(__dirname, '..', 'chrome-extension-poc', 'icons');

  // Ensure icons directory exists
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  console.log('🎨 Generating Console Bridge extension icons...\n');

  // Generate all three sizes
  generateIcon(16, path.join(iconsDir, 'icon16.png'));
  generateIcon(48, path.join(iconsDir, 'icon48.png'));
  generateIcon(128, path.join(iconsDir, 'icon128.png'));

  console.log('\n✅ All icons generated successfully!');
  console.log('\nIcon specifications:');
  console.log('- Design: Terminal prompt (>_) with bridge connection');
  console.log('- Colors: Blue (#2196F3), White (#FFFFFF), Green (#4CAF50)');
  console.log('- Style: Flat, high contrast, professional');
  console.log('\nNext steps:');
  console.log('1. Load extension in Chrome to test icons');
  console.log('2. Verify visibility on light/dark backgrounds');
  console.log('3. Check icon quality at all sizes');
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { drawIcon, generateIcon };
