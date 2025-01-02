import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

function installTsNode(): void {
    try {
        console.log('Checking if ts-node is installed...');
        execSync('npx ts-node -v', { stdio: 'ignore' });
        console.log('ts-node is already installed.');
    } catch {
        console.log('ts-node not found. Installing ts-node...');
        execSync('npm install ts-node --save-dev', { stdio: 'inherit' });
    }
}

function checkAndInstall(folder: string): void {
    const nodeModulesPath = join(folder, 'node_modules');
    const packageLockPath = join(folder, 'package-lock.json');

    if (!existsSync(nodeModulesPath) || !existsSync(packageLockPath)) {
        console.log(`Dependencies missing in ${folder}, running npm install...`);
        execSync(`cd ${folder} && npm install`, { stdio: 'inherit' });
    } else {
        console.log(`Dependencies already installed in ${folder}.`);
    }
}

// התקנת ts-node אם הוא חסר
installTsNode();

// בדיקת תיקיות backend ו-frontend
checkAndInstall('backend-cwc');
checkAndInstall('frontend-cwc');
