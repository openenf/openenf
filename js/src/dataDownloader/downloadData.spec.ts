import {downloadData} from "./downloadData";
import os from "os";
import {getENFDataDirectory} from "./ENFDataDirectory";
import path from "path";
import fs from "fs";
import * as crypto from "crypto";

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
    it('can download data file', (done) => {
        const filePath = path.join(getENFDataDirectory(),"xx.freqdb");
        if (fs.existsSync(filePath)) {
            fs.rmSync(filePath);
        }
        downloadData("XX").then(() => {
            expect(fs.existsSync(filePath)).toBe(true);
            const fileHash = crypto.createHash('md5');
            const stream = fs.createReadStream(filePath);

            stream.on('data', function(data) {
                fileHash.update(data);
            });

            stream.on('end', function() {
                const md5sum = fileHash.digest('hex');
                expect(md5sum).toBe('ddc138b743874940c9577e03df5b21db')
                fs.rmSync(filePath);
                done();
            });

            stream.on('error', function(err) {
                console.error(`Error reading file: ${err}`);
            });
        })
    })
})
