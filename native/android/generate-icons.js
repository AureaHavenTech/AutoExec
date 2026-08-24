// Generate Android adaptive icons and splash screen for Axel AI
// Uses brand colors: champagne gold #c9a96e on dark gray #12121a
// No external dependencies needed — generates PNGs as base64 blobs using Canvas
const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const BRAND = {
  dark: '#12121a',
  gold: '#c9a96e',
  cream: '#e8e0d4',
};

function generateIcon(size, outputPath) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background: dark gray
  ctx.fillStyle = BRAND.dark;
  ctx.beginPath();
  // Rounded rect with ~18% corner radius
  const radius = size * 0.18;
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fill();

  // Gold steering wheel / circle icon
  const cx = size / 2;
  const cy = size / 2;
  const wheelRadius = size * 0.28;
  const ringWidth = size * 0.06;

  // Outer ring
  ctx.strokeStyle = BRAND.gold;
  ctx.lineWidth = ringWidth;
  ctx.beginPath();
  ctx.arc(cx, cy, wheelRadius, 0, Math.PI * 2);
  ctx.stroke();

  // Inner spokes (3 lines radiating outward)
  ctx.lineWidth = ringWidth * 0.6;
  for (let i = 0; i < 3; i++) {
    const angle = (i * Math.PI * 2) / 3 - Math.PI / 2;
    const innerR = wheelRadius * 0.2;
    const outerR = wheelRadius;
    ctx.beginPath();
    ctx.moveTo(cx + innerR * Math.cos(angle), cy + innerR * Math.sin(angle));
    ctx.lineTo(cx + outerR * Math.cos(angle), cy + outerR * Math.sin(angle));
    ctx.stroke();
  }

  // Center hub
  ctx.fillStyle = BRAND.gold;
  ctx.beginPath();
  ctx.arc(cx, cy, wheelRadius * 0.15, 0, Math.PI * 2);
  ctx.fill();

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`  ${outputPath} (${size}x${size})`);
}

function generateSplash(outputPath) {
  // 1280x720 — standard Android splash
  const w = 1280, h = 720;
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = BRAND.dark;
  ctx.fillRect(0, 0, w, h);

  // Large gold steering wheel in center
  const cx = w / 2;
  const cy = h / 2;
  const wheelRadius = 120;
  const ringWidth = 18;

  ctx.strokeStyle = BRAND.gold;
  ctx.lineWidth = ringWidth;
  ctx.beginPath();
  ctx.arc(cx, cy, wheelRadius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = ringWidth * 0.6;
  for (let i = 0; i < 3; i++) {
    const angle = (i * Math.PI * 2) / 3 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx + 20 * Math.cos(angle), cy + 20 * Math.sin(angle));
    ctx.lineTo(cx + wheelRadius * Math.cos(angle), cy + wheelRadius * Math.sin(angle));
    ctx.stroke();
  }

  ctx.fillStyle = BRAND.gold;
  ctx.beginPath();
  ctx.arc(cx, cy, 24, 0, Math.PI * 2);
  ctx.fill();

  // App name text
  ctx.fillStyle = BRAND.cream;
  ctx.font = 'bold 64px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Axel AI', cx, cy + wheelRadius + 80);

  // Tagline
  ctx.fillStyle = BRAND.gold;
  ctx.font = '28px sans-serif';
  ctx.fillText('Tell it what to do. It does the rest.', cx, cy + wheelRadius + 130);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`  ${outputPath} (${w}x${h})`);
}

// Main
const androidResDir = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');

// Standard launcher icons (mipmap)
const mipmapSizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

console.log('Generating launcher icons...');
for (const [dir, size] of Object.entries(mipmapSizes)) {
  const dirPath = path.join(androidResDir, dir);
  fs.mkdirSync(dirPath, { recursive: true });
  generateIcon(size, path.join(dirPath, 'ic_launcher.png'));
}

// Adaptive icon foreground
const adaptiveForegroundDir = path.join(androidResDir, 'mipmap-anydpi-v26');
fs.mkdirSync(adaptiveForegroundDir, { recursive: true });
generateIcon(432, path.join(androidResDir, 'mipmap-xxxhdpi', 'ic_launcher_foreground.png'));

// Splash
console.log('Generating splash screen...');
const drawableDir = path.join(androidResDir, 'drawable');
fs.mkdirSync(drawableDir, { recursive: true });
generateSplash(path.join(drawableDir, 'splash.png'));

console.log('\nAll icon assets generated!');