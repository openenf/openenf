import {TcpServerComponentOptions} from "../../src/lookup/tcpServerComponentOptions";
import {getTestExecutablePath} from "../../src/testUtils";
import fs from "fs";
import path from "path";
import {TcpServerLookupComponent} from "../../src/lookup/tcpServerLookupComponent";
import {getDefaultExecutablePath} from "../tcpClient/tcpClientUtils";
import {getENFDataDirectory} from "../dataDownloader/ENFDataDirectory";

describe("TcpServerLookupComponent", () => {
    it('will lookup data from grid', async () => {
        const gbFreqs:(number | null)[] = JSON.parse(fs.readFileSync(path.resolve("test/testFreqs/GB_2020-11-28T210904_saw_3600_J_secs_05amp_8Harmonics.wav.freqs.json")).toString());
        const tcpServerComponentOptions = new TcpServerComponentOptions();
        tcpServerComponentOptions.stdOutHandler = (m?:string) => {
            console.log('m',m);
        }
        tcpServerComponentOptions.executablePath = getTestExecutablePath();
        const dbPath = path.resolve(getENFDataDirectory(),"GB.freqdb");
        tcpServerComponentOptions.grids["GB"] = dbPath;
        let progress = 0;
        const tcpServerLookupComponent = new TcpServerLookupComponent(tcpServerComponentOptions);
        tcpServerLookupComponent.lookupProgressEvent.addHandler(d => {
            if (d) {
                console.log(`Progress: d`, d);
                expect(d).toBeGreaterThan(progress);
                progress = d;
            }
        })
        const response = await tcpServerLookupComponent.lookup(gbFreqs, ["GB"], new Date("2020-11-01"), new Date("2021-11-01"));
        const r = response[0];
        expect(r).toStrictEqual({ gridId: 'GB', position: 218063344, score: 0 });
        expect(progress).toBeGreaterThanOrEqual(1);
    }, 3000000)
})
