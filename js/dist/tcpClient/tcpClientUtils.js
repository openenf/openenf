"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultExecutablePath = exports.toPascalCase = void 0;
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const toPascalCase = (key, value) => {
    if (value && typeof value === 'object') {
        for (var k in value) {
            if (/^[A-Z]/.test(k) && Object.hasOwnProperty.call(value, k)) {
                value[k.charAt(0).toLowerCase() + k.substring(1)] = value[k];
                delete value[k];
            }
        }
    }
    return value;
};
exports.toPascalCase = toPascalCase;
const getDefaultExecutablePath = () => {
    let executablePath = path_1.default.join(__filename, "../../../", "serverExecutable");
    switch (os_1.default.platform()) {
        case "win32":
            executablePath = path_1.default.join(executablePath, "windows", "ENFLookupServer.exe");
            break;
        case "darwin":
            executablePath = path_1.default.join(executablePath, "macos", "ENFLookupServer");
            break;
        default:
            executablePath = path_1.default.join(executablePath, "linux", "ENFLookupServer");
    }
    return path_1.default.resolve(executablePath);
};
exports.getDefaultExecutablePath = getDefaultExecutablePath;
