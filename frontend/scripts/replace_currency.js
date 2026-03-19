const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else {
            callback(path.join(dir, f));
        }
    });
}

function processFile(filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts') && !filePath.endsWith('.java')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replace 'USD' with 'INR'
    content = content.replace(/\bUSD\b/g, 'INR');
    
    // Replace standalone '$' with '₹'
    // Carefully avoid template literals ${...}
    content = content.replace(/\$(?!\s*\{)/g, '₹');
    
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

walkDir('./frontend/src', processFile);
walkDir('./backend/src', processFile);
console.log('Currency replacement complete.');
