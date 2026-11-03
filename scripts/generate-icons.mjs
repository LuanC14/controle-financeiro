// Gera os ícones do PWA a partir de um SVG. Rode com: node scripts/generate-icons.mjs
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";

const bars = `
  <rect x="142" y="280" width="56" height="90" rx="14" fill="#fff"/>
  <rect x="228" y="220" width="56" height="150" rx="14" fill="#fff"/>
  <rect x="314" y="150" width="56" height="220" rx="14" fill="#fff"/>`;

const svg = (radius) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="${radius}" fill="#059669"/>${bars}
</svg>`;

mkdirSync("public/icons", { recursive: true });
writeFileSync("app/icon.svg", svg(112));

const rounded = Buffer.from(svg(112));
const full = Buffer.from(svg(0)); // maskable e apple-touch: o sistema aplica a máscara

await sharp(rounded).resize(192, 192).png().toFile("public/icons/icon-192.png");
await sharp(rounded).resize(512, 512).png().toFile("public/icons/icon-512.png");
await sharp(full).resize(512, 512).png().toFile("public/icons/maskable-512.png");
await sharp(full).resize(180, 180).png().toFile("public/icons/apple-touch-icon.png");
console.log("ícones gerados");
