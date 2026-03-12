const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Dashboard.tsx specific
    if (filePath.includes('Dashboard.tsx')) {
        content = content.replace(/bg-gray-900 min-h-screen text-white/g, 'bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white');
        content = content.replace(/text-gray-400/g, 'text-gray-500 dark:text-gray-400');
        content = content.replace(/bg-gray-800/g, 'bg-white dark:bg-gray-800');
        content = content.replace(/border-gray-700/g, 'border-gray-200 dark:border-gray-700');
        content = content.replace(/text-white/g, 'text-gray-900 dark:text-white');
        content = content.replace(/from-gray-900/g, 'from-white dark:from-gray-900');
        content = content.replace(/via-gray-900/g, 'via-white dark:via-gray-900');
        content = content.replace(/text-gray-300/g, 'text-gray-600 dark:text-gray-300');
        content = content.replace(/text-gray-200/g, 'text-gray-700 dark:text-gray-200');
        content = content.replace(/bg-gray-700/g, 'bg-gray-100 dark:bg-gray-700');
        content = content.replace(/bg-gray-600/g, 'bg-gray-200 dark:bg-gray-600');
        content = content.replace(/hover:bg-gray-700/g, 'hover:bg-gray-100 dark:hover:bg-gray-700');
        content = content.replace(/hover:border-gray-600/g, 'hover:border-gray-300 dark:hover:border-gray-600');
        content = content.replace(/text-gray-900 dark:text-gray-900 dark:text-white/g, 'text-gray-900 dark:text-white'); // fix double replace
    }

    // EmailManager directory
    if (filePath.includes('EmailManager')) {
        content = content.replace(/bg-gray-900/g, 'bg-gray-50 dark:bg-gray-900');
        content = content.replace(/bg-gray-800/g, 'bg-white dark:bg-gray-800');
        content = content.replace(/border-gray-700/g, 'border-gray-200 dark:border-gray-700');
        content = content.replace(/border-gray-800/g, 'border-gray-200 dark:border-gray-800');
        content = content.replace(/text-white/g, 'text-gray-900 dark:text-white');
        content = content.replace(/text-gray-400/g, 'text-gray-500 dark:text-gray-400');
        content = content.replace(/text-gray-300/g, 'text-gray-600 dark:text-gray-300');
        content = content.replace(/text-gray-500/g, 'text-gray-500 dark:text-gray-400');
        content = content.replace(/bg-gray-700/g, 'bg-gray-100 dark:bg-gray-700');
        content = content.replace(/hover:bg-gray-700/g, 'hover:bg-gray-100 dark:hover:bg-gray-700');
        content = content.replace(/hover:bg-gray-800/g, 'hover:bg-gray-50 dark:hover:bg-gray-800');
        content = content.replace(/text-gray-900 dark:text-gray-900 dark:text-white/g, 'text-gray-900 dark:text-white'); // fix double replace
        content = content.replace(/text-gray-500 dark:text-gray-500 dark:text-gray-400/g, 'text-gray-500 dark:text-gray-400'); // fix double replace
        content = content.replace(/bg-gray-50 dark:bg-gray-50 dark:bg-gray-900/g, 'bg-gray-50 dark:bg-gray-900'); // fix double replace
        content = content.replace(/bg-white dark:bg-white dark:bg-gray-800/g, 'bg-white dark:bg-gray-800'); // fix double replace
        content = content.replace(/border-gray-200 dark:border-gray-200 dark:border-gray-700/g, 'border-gray-200 dark:border-gray-700'); // fix double replace
    }

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
        replaceInFile(file);
        console.log('Processed', file);
    }
});
