#!/usr/bin/env node

/**
 * Icon Generator Script
 *
 * This script generates PWA icons in various sizes from an SVG source.
 * For production, use a proper icon generator or design tool.
 *
 * To generate icons:
 * 1. Create a high-quality icon (512x512 PNG) in /public/icons/source.png
 * 2. Use online tools like:
 *    - https://realfavicongenerator.net/
 *    - https://www.pwabuilder.com/imageGenerator
 *    - https://favicon.io/
 *
 * Or install sharp and uncomment the code below:
 * npm install --save-dev sharp
 */

const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../public/icons');

console.log('📱 PWA Icon Generation Guide');
console.log('================================\n');
console.log('For now, we\'ll create placeholder icons.');
console.log('For production, please generate proper icons using:\n');
console.log('1. Visit: https://www.pwabuilder.com/imageGenerator');
console.log('2. Upload your logo/icon (512x512 recommended)');
console.log('3. Download the generated icon pack');
console.log('4. Replace files in /public/icons/\n');

// Create simple placeholder message
const placeholderSvg = `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#6B46C1"/>
  <text x="256" y="256" font-size="200" fill="white" text-anchor="middle" dy=".3em">✈️</text>
</svg>`;

// Save SVG as reference
fs.writeFileSync(path.join(iconsDir, 'placeholder.svg'), placeholderSvg);

console.log('✅ Created placeholder SVG in /public/icons/');
console.log('\n🎨 Next steps:');
console.log('1. Design your app icon (512x512px)');
console.log('2. Use PWA Builder Image Generator (link above)');
console.log('3. Replace placeholder icons with generated ones\n');
