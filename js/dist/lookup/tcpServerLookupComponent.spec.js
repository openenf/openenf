import { TcpServerLookupComponent } from "./tcpServerLookupComponent";
import { TcpServerComponentOptions } from "./tcpServerComponentOptions";
import path from "path";
import fs from "fs";
import { getTestExecutablePath } from "../testUtils";
describe("TcpServerLookupComponent", () => {
    it('will throw an error if the server is not running on the specified port and executable cannot be found', async () => {
        const tcpServerComponentOptions = new TcpServerComponentOptions();
        tcpServerComponentOptions.port = 49177; //Note this is a non-standard port so should reliably throw an exception.
        tcpServerComponentOptions.executablePath = "/this/does/not/exist";
        const tcpServerLookupComponent = new TcpServerLookupComponent(tcpServerComponentOptions);
        let errorThrown = false;
        const response = await tcpServerLookupComponent.lookup([1, 2, 3, 4], ["XX"]).catch((e) => {
            expect(e.message).toBe('No TCP Lookup executable found at /this/does/not/exist');
            errorThrown = true;
        });
        expect(response).toBeUndefined();
        expect(errorThrown).toBe(true);
    });
    it('will fire the executable if the server is not running on the specified port and executable can be found', done => {
        const tcpServerComponentOptions = new TcpServerComponentOptions();
        tcpServerComponentOptions.port = 50050;
        tcpServerComponentOptions.executablePath = getTestExecutablePath();
        const dbPath = path.resolve("test/testFreqDbs/GB_50_Jan2014.freqdb");
        tcpServerComponentOptions.grids["GB"] = dbPath; //Note this is a non-standard port so should reliably throw an exception.
        const tcpServerLookupComponent = new TcpServerLookupComponent(tcpServerComponentOptions);
        //There's no 'ZZ' grid so this should return an empty array:
        tcpServerLookupComponent.lookup([50.001, 50.002, 50.003, 50.004], ["ZZ"]).then(response => {
            expect(response).toStrictEqual([]);
            done();
        }).catch(() => {
            throw "Failed";
            done();
        });
    }, 10000);
    it('will lookup data from grid', async () => {
        let progress = 0;
        const gbFreqs = JSON.parse(fs.readFileSync(path.resolve("test/testFreqs/GBFreqs1339200.json")).toString());
        const tcpServerComponentOptions = new TcpServerComponentOptions();
        tcpServerComponentOptions.port = 50000;
        tcpServerComponentOptions.executablePath = getTestExecutablePath();
        const dbPath = path.resolve("test/testFreqDbs/GB_50_Jan2014.freqdb");
        tcpServerComponentOptions.grids["GB"] = dbPath;
        const tcpServerLookupComponent = new TcpServerLookupComponent(tcpServerComponentOptions);
        tcpServerLookupComponent.lookupProgressEvent.addHandler(d => {
            if (d) {
                expect(d).toBeGreaterThanOrEqual(progress);
                progress = d;
            }
        });
        const response = await tcpServerLookupComponent.lookup(gbFreqs, ["GB"], new Date('2014-01-01'), new Date('2015-01-03'));
        const r = response[0];
        expect(r).toStrictEqual({ gridId: 'GB', position: 1339200, score: 0 });
    }, 300000);
});