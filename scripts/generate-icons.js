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
    const padding = Math.round(size * 0.12); // 12% padding
    const imageSize = size - (padding * 2);

    // Resize trimmed image with some padding
    await sharp(trimmed)
      .resize(imageSize, imageSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .flatten({ background: { r: 255, g: 255, b: 255 } }) // Flatten transparency to white
      .png()
      .toFile(path.join(PUBLIC_DIR, name));

    console.log(`Generated ${name} (${size}x${size})`);
  }
}

generateIcons().catch(console.error);
