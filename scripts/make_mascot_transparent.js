const sharp = require('sharp');

async function removeWhiteBackground() {
  const { data, info } = await sharp('public/assets/robot_color_mascot.png')
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const threshold = 242; // white threshold

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // If pixel is near white
    if (r > threshold && g > threshold && b > threshold) {
      // Linear falloff for smooth anti-aliased edge
      const minVal = Math.min(r, g, b);
      const alpha = Math.max(0, Math.min(255, (255 - minVal) * (255 / (255 - threshold))));
      data[i + 3] = Math.round(alpha);
    }
  }

  await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  })
    .trim() // trim transparent edges
    .png()
    .toFile('public/assets/robot_mascot_transparent.png');

  console.log('Processed transparent mascot saved to public/assets/robot_mascot_transparent.png');
}

removeWhiteBackground().catch(console.error);
