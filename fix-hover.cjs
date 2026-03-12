const fs = require('fs');
const path = require('path');

function fixHover(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix the broken hover states
    content = content.replace(/hover:bg-gray-100 dark:bg-gray-700/g, 'hover:bg-gray-100 dark:hover:bg-gray-700');
    content = content.replace(/hover:bg-gray-50 dark:bg-gray-800/g, 'hover:bg-gray-50 dark:hover:bg-gray-800');
    content = content.replace(/hover:border-gray-300 dark:border-gray-600/g, 'hover:border-gray-300 dark:hover:border-gray-600');
    content = content.replace(/dark:text-gray-900 dark:text-white/g, 'dark:text-white');
    content = content.replace(/dark:text-gray-500 dark:text-gray-400/g, 'dark:text-gray-400');
    content = content.replace(/dark:bg-gray-50 dark:bg-gray-900/g, 'dark:bg-gray-900');
    content = content.replace(/dark:bg-white dark:bg-gray-800/g, 'dark:bg-gray-800');
    content = content.replace(/dark:border-gray-200 dark:border-gray-700/g, 'dark:border-gray-700');
    content = content.replace(/dark:border-gray-200 dark:border-gray-800/g, 'dark:border-gray-800');

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

const files = walkSync('./components/Dashboard').concat(walkSync('./components/EmailManager'));
files.forEach(file => {
    if (file.endsWith('.tsx')) {
        fixHover(file);
        console.log('Fixed', file);
    }
});
