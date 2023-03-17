import {downloadData, getDataFilePath} from "./downloadData";
import os from "os";

describe('downloadData', () => {
    it('can get the correct download directory for the current platform', () => {
        const result = getDataFilePath();
        const platform = os.platform();
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
    })
    it('can download data file', async () => {
        const result = await downloadData();
    }, 30000000)
})
