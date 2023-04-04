"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = __importDefault(require("os"));
const ENFDataDirectory_1 = require("./ENFDataDirectory");
describe('downloadData', () => {
    it('can get the correct download directory for the current platform', () => {
        const result = (0, ENFDataDirectory_1.getENFDataDirectory)();
        const platform = os_1.default.platform();
        switch (platform) {
            case "win32":
                expect(result.endsWith('/AppData/Roaming/OpenENF')).toBe(true);
                break;
            case "darwin":
                expect(result.endsWith('Library/Application Support/OpenENF')).toBe(true);
                break;
            default:
                expect(result.endsWith('.config/openenf')).toBe(true);
        }
    });
});
