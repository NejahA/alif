#!/usr/bin/env node

/**
 * Icon conversion script for 313rifts
 * Converts SVG icon to PNG for Electron packaging
 * 
 * Requirements:
 * - Install sharp: npm install sharp
 * - Run: node scripts/convert-icon.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function convertIcon() {
  const svgPath = path.join(__dirname, '../build/icon.svg');
  const pngPath = path.join(__dirname, '../build/icon.png');

  try {
    // Read SVG content
    const svgContent = fs.readFileSync(svgPath, 'utf-8');

    // Convert to PNG with different sizes
    const sizes = [16, 32, 64, 128, 256, 512];

    for (const size of sizes) {
      const outputPath = path.join(__dirname, `../build/icon-${size}x${size}.png`);
      await sharp(Buffer.from(svgContent))
        .resize(size, size)
        .png()
        .toFile(outputPath);
      console.log(`✓ Created ${size}x${size} icon`);
    }

    // Create main icon (256x256)
    await sharp(Buffer.from(svgContent))
      .resize(256, 256)
      .png()
      .toFile(pngPath);

    console.log('✓ Icon conversion complete!');
    console.log('✓ Main icon: build/icon.png');
    console.log('✓ Multi-size icons: build/icon-*.png');

  } catch (error) {
    console.error('Error converting icon:', error.message);
    console.log('\nNote: If sharp is not installed, run: npm install sharp');
  }
}

convertIcon();