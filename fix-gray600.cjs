const fs = require('fs');
const path = require('path');

function fixGray600(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    content = content.replace(/hover:bg-gray-600/g, 'hover:bg-gray-200 dark:hover:bg-gray-600');
    content = content.replace(/border-gray-600/g, 'border-gray-300 dark:border-gray-600');
    content = content.replace(/text-gray-600 cursor-not-allowed/g, 'text-gray-400 dark:text-gray-600 cursor-not-allowed');

    fs.writeFileSync(filePath, content, 'utf8');
}

const walkSync = (dir, filelist = []) => {
    fs.readdirSync(dir).forEach(file => {
        const dirFile = path.join(dir, file);
        try {
            filelist = fs.statSync(dirFile).isDirectory()
                ? walkSync(dirFile, filelist)
                : filelist.concat(dirFile);
        } catch (err) {
            if (err.code === 'ENOENT' || err.code === 'EACCES') {
                // Ignore missing or inaccessible files
            } else {
                throw err;
            }
        }
    });
    return filelist;
}

const files = walkSync('./components/EmailManager');
files.forEach(file => {
    if (file.endsWith('.tsx')) {
        fixGray600(file);
        console.log('Fixed', file);
    }
});
