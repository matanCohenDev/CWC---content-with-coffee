"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
var fs_1 = require("fs");
var path_1 = require("path");
function checkAndInstall(folder) {
    var nodeModulesPath = (0, path_1.join)(folder, 'node_modules');
    var packageLockPath = (0, path_1.join)(folder, 'package-lock.json');
    if (!(0, fs_1.existsSync)(nodeModulesPath) || !(0, fs_1.existsSync)(packageLockPath)) {
        console.log("Dependencies missing in ".concat(folder, ", running npm install..."));
        (0, child_process_1.execSync)("cd ".concat(folder, " && npm install"), { stdio: 'inherit' });
    }
    else {
        console.log("Dependencies already installed in ".concat(folder, "."));
    }
}
checkAndInstall('backend-cwc');
checkAndInstall('frontend-cwc');
