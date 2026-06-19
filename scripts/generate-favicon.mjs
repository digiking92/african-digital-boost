import sharp from "sharp";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const logoPath = join(root, "public", "auditme-logo.png");
const outPath = join(root, "public", "auditme-favicon.png");
const applePath = join(root, "public", "apple-touch-icon.png");

const SIZE = 512;
const NAVY = { r: 13, g: 27, b: 42, alpha: 1 };

const meta = await sharp(logoPath).metadata();
const imgH = meta.height ?? SIZE;
const imgW = meta.width ?? SIZE;
// Crop to magnifying-glass icon only (left portion of the horizontal logo).
const cropWidth = Math.round(imgH * 0.48);
const iconCrop = await sharp(logoPath)
  .extract({ left: 0, top: 0, width: Math.min(cropWidth, imgW), height: imgH })
  .resize(Math.round(SIZE * 0.82), Math.round(SIZE * 0.82), {
    fit: "contain",
    background: NAVY,
  })
  .toBuffer();

const iconMeta = await sharp(iconCrop).metadata();
const iconW = iconMeta.width ?? SIZE;
const iconH = iconMeta.height ?? SIZE;

const square = await sharp({
  create: { width: SIZE, height: SIZE, channels: 4, background: NAVY },
})
  .composite([
    {
      input: iconCrop,
      left: Math.round((SIZE - iconW) / 2),
      top: Math.round((SIZE - iconH) / 2),
    },
  ])
  .png()
  .toBuffer();

const mask = Buffer.from(
  `<svg width="${SIZE}" height="${SIZE}"><circle cx="${SIZE / 2}" cy="${SIZE / 2}" r="${SIZE / 2}" fill="#fff"/></svg>`,
);

await sharp(square).composite([{ input: mask, blend: "dest-in" }]).png().toFile(outPath);

await sharp(outPath).resize(180, 180).png().toFile(applePath);

console.log("Wrote", outPath, applePath);
