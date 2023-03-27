import {TcpServerComponentOptions} from "../../src/lookup/tcpServerComponentOptions";
import {getTestExecutablePath} from "../../src/testUtils";
import fs from "fs";
import path from "path";
import {TcpServerLookupComponent} from "../../src/lookup/tcpServerLookupComponent";

describe("TcpServerLookupComponent", () => {
    it('will lookup data from grid', async () => {
        const tcpServerComponentOptions = new TcpServerComponentOptions();
        tcpServerComponentOptions.executablePath = getTestExecutablePath();
        //const dbPath = path.resolve("test/testFreqDbs/GB_50_Jan2014.freqdb");
        //tcpServerComponentOptions.grids["GB"] = dbPath;
        let progress = 0;
        const gbFreqs:(number | null)[] = JSON.parse(fs.readFileSync(path.resolve("test/testFreqs/GB_2020-11-28T210904_saw_3600_J_secs_05amp_8Harmonics.wav.freqs.json")).toString());
        const tcpServerLookupComponent = new TcpServerLookupComponent(tcpServerComponentOptions);
        tcpServerLookupComponent.lookupProgressEvent.addHandler(d => {
            console.log('d',d);
            if (d) {
                expect(d).toBeGreaterThan(progress);
                progress = d;
            }
        })
        const response = await tcpServerLookupComponent.lookup(gbFreqs, ["GB"], new Date("2010-11-01"), new Date("2030-12-01"));
        console.log('response', response);
        const r = response[0];
        //expect(r).toStrictEqual({ gridId: 'GB', position: 1339200, score: 0 });
        expect(progress).toBeGreaterThanOrEqual(1);
    }, 300000)
})
