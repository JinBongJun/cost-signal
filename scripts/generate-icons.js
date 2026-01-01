// Simple script to generate placeholder icons
// For production, use a proper icon generator or design tool

const fs = require('fs');
const path = require('path');

// Create a simple SVG icon
function createSVGIcon(size, text) {
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#2563eb" rx="${size * 0.2}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${text}</text>
</svg>`;
}

const publicDir = path.join(__dirname, '../public');

// Generate SVG icons
const icon192 = createSVGIcon(192, 'CS');
const icon512 = createSVGIcon(512, 'CS');

fs.writeFileSync(path.join(publicDir, 'icon-192.svg'), icon192);
fs.writeFileSync(path.join(publicDir, 'icon-512.svg'), icon512);

console.log('✅ Generated SVG icons');
console.log('⚠️  Note: For production, convert these to PNG format using an online tool like:');
console.log('   - https://cloudconvert.com/svg-to-png');
console.log('   - https://convertio.co/svg-png/');
console.log('   Or use a design tool like Figma, Canva, etc.');



