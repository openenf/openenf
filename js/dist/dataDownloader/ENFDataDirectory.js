"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getENFDataDirectory = void 0;
const os_1 = __importDefault(require("os"));
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const getENFDataDirectory = () => {
    const platform = os_1.default.platform();
    const appDataPath = electron_1.app ? electron_1.app.getPath('userData') : os_1.default.homedir();
    const appDirectoryName = "OpenENF";
    if (platform === 'win32') {
        return path_1.default.join(appDataPath, 'AppData', 'Roaming', appDirectoryName);
    }
    else if (platform === 'darwin') {
        return path_1.default.join(appDataPath, 'Library', 'Application Support', appDirectoryName);
    }
    else {
        return path_1.default.join(appDataPath, '.config', appDirectoryName.toLowerCase());
    }
};
exports.getENFDataDirectory = getENFDataDirectory;
