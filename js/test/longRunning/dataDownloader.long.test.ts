import path from "path";
import {getENFDataDirectory} from "../../src/dataDownloader/ENFDataDirectory";
import fs from "fs";
import {downloadData} from "../../src/dataDownloader/downloadData";
import crypto from "crypto";

describe('downloadData (long-running)', () => {
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
});
