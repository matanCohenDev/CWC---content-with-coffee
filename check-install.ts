import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

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

checkAndInstall('backend-cwc');
checkAndInstall('frontend-cwc');
