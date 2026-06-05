const fs = require('fs');
const path = require('path');

function cleanDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      cleanDirectory(fullPath);
    } else if (file.endsWith('.js') && !file.endsWith('config.js') && !file.endsWith('vite.config.js')) {
      console.log('Deleting stale compile artifact:', fullPath);
      fs.unlinkSync(fullPath);
    } else if (file.endsWith('.js.map')) {
      console.log('Deleting stale map:', fullPath);
      fs.unlinkSync(fullPath);
    }
  }
}

console.log('Cleaning stale JS files from src/ ...');
cleanDirectory(path.join(__dirname, 'src'));
console.log('Done!');
