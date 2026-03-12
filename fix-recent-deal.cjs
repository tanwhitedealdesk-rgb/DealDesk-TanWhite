const fs = require('fs');
const path = require('path');

function fixRecentDealCard(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix RecentDealCard.tsx
    content = content.replace(/bg-\[#1e2330\]/g, 'bg-white dark:bg-[#1e2330]');
    content = content.replace(/from-\[#1e2330\]/g, 'from-white dark:from-[#1e2330]');
    content = content.replace(/bg-gray-800/g, 'bg-gray-100 dark:bg-gray-800');
    content = content.replace(/border-gray-700\/50/g, 'border-gray-200 dark:border-gray-700/50');
    content = content.replace(/text-gray-400/g, 'text-gray-500 dark:text-gray-400');
    content = content.replace(/text-gray-300/g, 'text-gray-600 dark:text-gray-300');
    content = content.replace(/text-white/g, 'text-gray-900 dark:text-white');
    content = content.replace(/text-gray-900 dark:text-gray-900 dark:text-white/g, 'text-gray-900 dark:text-white');
    content = content.replace(/text-gray-500 dark:text-gray-500 dark:text-gray-400/g, 'text-gray-500 dark:text-gray-400');
    content = content.replace(/text-gray-600 dark:text-gray-600 dark:text-gray-300/g, 'text-gray-600 dark:text-gray-300');

    fs.writeFileSync(filePath, content, 'utf8');
}

fixRecentDealCard('./components/Dashboard/RecentDealCard.tsx');
console.log('Fixed RecentDealCard.tsx');
