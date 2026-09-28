const sharp = require('sharp');

async function main() {
  const mask = Buffer.from(
    '<svg width="1024" height="1024"><circle cx="512" cy="512" r="486" fill="#ffffff" /></svg>'
  );

  await sharp('public/assets/edueme_e_logo.png')
    .ensureAlpha()
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toFile('public/assets/edueme_e_clean.png');

  console.log('Clean circular transparent logo saved to public/assets/edueme_e_clean.png');
}

main().catch(console.error);
