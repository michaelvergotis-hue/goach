const sharp = require('sharp');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '../public');
const SOURCE = path.join(PUBLIC_DIR, 'goachicon.png');

async function generateIcons() {
  // Icon sizes needed - no padding, full size
  const sizes = [
    { name: 'icon-192.png', size: 192 },
    { name: 'icon-512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 },
  ];

  // First, trim the whitespace from source image
  const trimmed = await sharp(SOURCE)
    .trim() // Remove whitespace/transparent edges
    .toBuffer();

  for (const { name, size } of sizes) {
    // Resize trimmed image to fill icon with white background
    await sharp(trimmed)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .flatten({ background: { r: 255, g: 255, b: 255 } }) // Flatten transparency to white
      .png()
      .toFile(path.join(PUBLIC_DIR, name));

    console.log(`Generated ${name} (${size}x${size})`);
  }
}

generateIcons().catch(console.error);
