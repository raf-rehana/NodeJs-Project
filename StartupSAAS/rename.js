const fs = require('fs');
const path = require('path');

const directory = process.cwd();

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if (!file.includes('node_modules') && !file.includes('.git') && !file.includes('dist') && !file.includes('.angular')) {
                results = results.concat(walk(file));
            }
        } else {
            if (!file.endsWith('.png') && !file.endsWith('.jpg') && !file.endsWith('.ico') && !file.includes('package-lock.json') && !file.includes('db.json') && !file.includes('diff.txt') && !file.endsWith('.js') && !file.endsWith('.pdf')) {
                results.push(file);
            } else if (file.endsWith('.js') && !file.includes('node_modules') && !file.includes('dist')) {
                 results.push(file);
            }
        }
    });
    return results;
}

const files = walk(directory);

let modifiedCount = 0;

files.forEach(file => {
    // skip this script itself
    if (file.endsWith('rename.js')) return;

    let content;
    try {
        content = fs.readFileSync(file, 'utf8');
    } catch (e) {
        return;
    }

    const originalContent = content;

    content = content.replace(/LumiNex/g, 'StartupSAAS');
    content = content.replace(/luminex/g, 'startupsaas');
    content = content.replace(/LUMINEX/g, 'STARTUPSAAS');

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        modifiedCount++;
        console.log(`Updated: ${file}`);
    }
});

console.log(`\nReplacement complete. Modified ${modifiedCount} files.`);
