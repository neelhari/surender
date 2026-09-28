const sharp = require('sharp');

async function floodFillRemoveBackground() {
  const { data, info } = await sharp('public/assets/robot_color_mascot.png')
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;
  const visited = new Uint8Array(w * h);
  const queue = [];

  // Seed with all border pixels
  for (let x = 0; x < w; x++) {
    queue.push(x, 0);
    queue.push(x, h - 1);
    visited[x] = 1;
    visited[(h - 1) * w + x] = 1;
  }
  for (let y = 0; y < h; y++) {
    queue.push(0, y);
    queue.push(w - 1, y);
    visited[y * w] = 1;
    visited[y * w + (w - 1)] = 1;
  }

  const threshold = 230;

  let head = 0;
  while (head < queue.length) {
    const x = queue[head++];
    const y = queue[head++];
    const idx = (y * w + x) * 4;

    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];

    // If it is background white
    if (r >= threshold && g >= threshold && b >= threshold) {
      data[idx + 3] = 0; // make transparent

      // Check 4 neighbors
      const neighbors = [
        [x + 1, y],
        [x - 1, y],
        [x, y + 1],
        [x, y - 1]
      ];

      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
          const nPos = ny * w + nx;
          if (!visited[nPos]) {
            visited[nPos] = 1;
            queue.push(nx, ny);
          }
        }
      }
    } else {
      // Near edge smoothing
      const minVal = Math.min(r, g, b);
      if (minVal > 210) {
        data[idx + 3] = Math.round(((255 - minVal) / 45) * 255);
      }
    }
  }

  await sharp(data, {
    raw: {
      width: w,
      height: h,
      channels: 4
    }
  })
    .trim()
    .png()
    .toFile('public/assets/robot_mascot_transparent.png');

  console.log('Flood-fill transparent mascot saved perfectly to public/assets/robot_mascot_transparent.png');
}

floodFillRemoveBackground().catch(console.error);
