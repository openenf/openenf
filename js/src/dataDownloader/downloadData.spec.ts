import os from "os";
import {getENFDataDirectory} from "./ENFDataDirectory";

describe('downloadData', () => {
    it('can get the correct download directory for the current platform', () => {
        const result = getENFDataDirectory();
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
})
