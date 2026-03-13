const fs = require('fs');
const path = require('path');
const assetsDir = path.join(__dirname, 'dist', 'assets');
const indexFile = fs.readdirSync(assetsDir).find(f => f.startsWith('index-') && f.endsWith('.js'));
const content = fs.readFileSync(path.join(assetsDir, indexFile), 'utf8');

const key = 'AIzaSyATN8Um2OBvWgHCDz5oBcvnb76ad54a5p4';
const warning = '[Firebase] Not configured';

const keyIndex = content.indexOf(key);
const warningIndex = content.indexOf(warning);

console.log('Key Index:', keyIndex);
console.log('Warning Index:', warningIndex);

if (keyIndex !== -1 && warningIndex !== -1) {
    console.log('Distance:', warningIndex - keyIndex);
    console.log('Context between them:', content.slice(Math.min(keyIndex, warningIndex), Math.max(keyIndex, warningIndex) + 200));
}
