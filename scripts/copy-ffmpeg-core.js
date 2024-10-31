const fs = require('fs');
const path = require('path');

const corePath = path.join(__dirname, '../node_modules/@ffmpeg/core');
const publicPath = path.join(__dirname, '../public');

const files = [
  'ffmpeg-core.js',
  'ffmpeg-core.wasm',
  'ffmpeg-core.worker.js'
];

if (!fs.existsSync(publicPath)) {
  fs.mkdirSync(publicPath, { recursive: true });
}

console.log(`Copying FFmpeg core files from: ${corePath}`);

files.forEach(file => {
  const src = path.join(corePath, file);
  const dest = path.join(publicPath, file);
  
  try {
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`Copied ${file} to public directory`);
    } else {
      console.warn(`Source file not found: ${src}`);
    }
  } catch (error) {
    console.error(`Error copying ${file}:`, error);
  }
}); 