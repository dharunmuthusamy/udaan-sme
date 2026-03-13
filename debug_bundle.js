const fs = require('fs');
const path = require('path');
const assetsDir = path.join(__dirname, 'dist', 'assets');
const files = fs.readdirSync(assetsDir);
const indexFile = files.find(f => f.startsWith('index-') && f.endsWith('.js'));
if (!indexFile) {
  console.log('Index file not found in', assetsDir);
  process.exit(1);
}
const indexFilePath = path.join(assetsDir, indexFile);
console.log('Reading:', indexFilePath);
const content = fs.readFileSync(indexFilePath, 'utf8');
const key = 'AIzaSyATN8Um2OBvWgHCDz5oBcvnb76ad54a5p4';
const index = content.indexOf(key);
if (index !== -1) {
  console.log('Found key at index:', index);
  console.log('Context:', content.slice(Math.max(0, index - 300), index + 300));
} else {
  console.log('Key not found');
}
