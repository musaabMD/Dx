#!/usr/bin/env node

/**
 * Simple script to generate PWA icons
 * Run: node scripts/generate-icons.js
 * 
 * Requirements: You can use any image editor or online tool to create:
 * - icon-192.png (192x192px)
 * - icon-512.png (512x512px)
 * 
 * Or use this online tool: https://www.pwabuilder.com/imageGenerator
 */

const fs = require('fs');
const path = require('path');

console.log(`
PWA Icon Generator
==================

To create your app icons, you have several options:

1. Use an online tool:
   - Visit: https://www.pwabuilder.com/imageGenerator
   - Upload your logo/image
   - Download the generated icons
   - Place icon-192.png and icon-512.png in the public/ folder

2. Use an image editor:
   - Create two square images (192x192 and 512x512 pixels)
   - Save them as PNG files
   - Place them in the public/ folder as icon-192.png and icon-512.png

3. Use a design tool:
   - Figma, Canva, or any design tool
   - Export as PNG with the correct dimensions
   - Place in public/ folder

For now, creating placeholder files...
`);

// Create placeholder SVG files that can be converted to PNG
const icon192SVG = `<svg width="192" height="192" xmlns="http://www.w3.org/2000/svg">
  <rect width="192" height="192" fill="#ffffff"/>
  <text x="96" y="120" font-family="Arial, sans-serif" font-size="120" font-weight="bold" text-anchor="middle" fill="#000000">✓</text>
</svg>`;

const icon512SVG = `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#ffffff"/>
  <text x="256" y="320" font-family="Arial, sans-serif" font-size="320" font-weight="bold" text-anchor="middle" fill="#000000">✓</text>
</svg>`;

const publicDir = path.join(__dirname, '..', 'public');

// Create SVG placeholders
fs.writeFileSync(path.join(publicDir, 'icon-192.svg'), icon192SVG);
fs.writeFileSync(path.join(publicDir, 'icon-512.svg'), icon512SVG);

console.log('✓ Created SVG placeholder files:');
console.log('  - public/icon-192.svg');
console.log('  - public/icon-512.svg');
console.log('');
console.log('To convert SVG to PNG, you can:');
console.log('  1. Open the SVG files in a browser');
console.log('  2. Take a screenshot or use an online converter');
console.log('  3. Or use ImageMagick: convert icon-192.svg icon-192.png');
console.log('');
console.log('Once you have PNG files, replace the SVG files with PNG versions.');
