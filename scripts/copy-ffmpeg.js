const fs = require('fs');
const path = require('path');

const ffmpegCore = path.join(__dirname, '../node_modules/@ffmpeg/core/dist');
const publicDir = path.join(__dirname, '../public');

// Create public directory if it doesn't exist
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

// Copy FFmpeg core files
const files = [
  'ffmpeg-core.js',
  'ffmpeg-core.wasm',
];

files.forEach(file => {
  const src = path.join(ffmpegCore, file);
  const dest = path.join(publicDir, file);
  
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${file} to public directory`);
  } else {
    console.error(`Source file ${file} not found`);
  }
}); 