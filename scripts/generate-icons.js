const sharp = require('sharp');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '../public');
const SOURCE = path.join(PUBLIC_DIR, 'goachicon.png');

async function generateIcons() {
  // Icon sizes needed - minimal padding for bigger image
  const sizes = [
    { name: 'icon-192.png', size: 192, padding: 8 },
    { name: 'icon-512.png', size: 512, padding: 20 },
    { name: 'apple-touch-icon.png', size: 180, padding: 8 },
  ];

  for (const { name, size, padding } of sizes) {
    const iconSize = size - (padding * 2); // Image size after padding

    // Create white background and composite the resized icon on top
    await sharp(SOURCE)
      .resize(iconSize, iconSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: { r: 255, g: 255, b: 255, alpha: 1 } // White background
      })
      .flatten({ background: { r: 255, g: 255, b: 255 } }) // Flatten transparency to white
      .png()
      .toFile(path.join(PUBLIC_DIR, name));

    console.log(`Generated ${name} (${size}x${size})`);
  }
}

generateIcons().catch(console.error);
