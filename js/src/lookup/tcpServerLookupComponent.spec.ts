import {TcpServerLookupComponent} from "./tcpServerLookupComponent";
import {TcpServerComponentOptions} from "./tcpServerComponentOptions";
import os from "os";
import path from "path";
import fs from "fs";
import {getTestExecutablePath} from "../testUtils";

describe("TcpServerLookupComponent", () => {
    it('will throw an error if the server is not running on the specified port and executable cannot be found', async () => {
        const tcpServerComponentOptions = new TcpServerComponentOptions();
        tcpServerComponentOptions.port = 49177; //Note this is a non-standard port so should reliably throw an exception.
        tcpServerComponentOptions.executablePath = "/this/does/not/exist";
        const tcpServerLookupComponent = new TcpServerLookupComponent(tcpServerComponentOptions);
        let errorThrown = false;
        const response = await tcpServerLookupComponent.lookup([1,2,3,4],["XX"]).catch((e:Error) => {
            expect(e.message).toBe('Cannot reach server at port 49177');
            errorThrown = true;
        })
        expect(response).toBeUndefined();
        expect(errorThrown).toBe(true);
    })
    it('will fire the executable if the server is not running on the specified port and executable cannot be found', async () => {
        const tcpServerComponentOptions = new TcpServerComponentOptions();
        tcpServerComponentOptions.executablePath = getTestExecutablePath();
        tcpServerComponentOptions.port = 49176; //Note this is a non-standard port so should reliably throw an exception.
        const tcpServerLookupComponent = new TcpServerLookupComponent(tcpServerComponentOptions);
        //There's no 'ZZ' grid so this should return an empty array:
        const response = await tcpServerLookupComponent.lookup([1,2,3,4],["ZZ"]);
        expect(response).toStrictEqual([]);
    }, 30000)
    it('will lookup data from grid', async () => {
        const tcpServerComponentOptions = new TcpServerComponentOptions();
        tcpServerComponentOptions.executablePath = getTestExecutablePath();
        const dbPath = path.resolve("test/testFreqDbs/GB_50_Jan2014.freqdb");
        tcpServerComponentOptions.grids["GB"] = dbPath;
        let progress = 0;
        const gbFreqs:(number | null)[] = JSON.parse(fs.readFileSync(path.resolve("test/testFreqs/GBFreqs1339200.json")).toString());
        const tcpServerLookupComponent = new TcpServerLookupComponent(tcpServerComponentOptions);
        tcpServerLookupComponent.lookupProgressEvent.addHandler(d => {
            if (d) {
                expect(d).toBeGreaterThan(progress);
                progress = d;
            }
        })
        const response = await tcpServerLookupComponent.lookup(gbFreqs, ["GB"]);
        const r = response[0];
        expect(r).toStrictEqual({ gridId: 'GB', position: 1339200, score: 0 });
        expect(progress).toBe(1);
    })
})
