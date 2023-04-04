"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tcpServerLookupComponent_1 = require("./tcpServerLookupComponent");
const tcpServerComponentOptions_1 = require("./tcpServerComponentOptions");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const testUtils_1 = require("../testUtils");
describe("TcpServerLookupComponent", () => {
    it('will throw an error if the server is not running on the specified port and executable cannot be found', async () => {
        const tcpServerComponentOptions = new tcpServerComponentOptions_1.TcpServerComponentOptions();
        tcpServerComponentOptions.port = 49177; //Note this is a non-standard port so should reliably throw an exception.
        tcpServerComponentOptions.executablePath = "/this/does/not/exist";
        const tcpServerLookupComponent = new tcpServerLookupComponent_1.TcpServerLookupComponent(tcpServerComponentOptions);
        let errorThrown = false;
        const response = await tcpServerLookupComponent.lookup([1, 2, 3, 4], ["XX"]).catch((e) => {
            expect(e.message).toBe('No TCP Lookup executable found at /this/does/not/exist');
            errorThrown = true;
        });
        expect(response).toBeUndefined();
        expect(errorThrown).toBe(true);
    });
    it('will fire the executable if the server is not running on the specified port and executable can be found', done => {
        const tcpServerComponentOptions = new tcpServerComponentOptions_1.TcpServerComponentOptions();
        tcpServerComponentOptions.port = 50000;
        tcpServerComponentOptions.executablePath = (0, testUtils_1.getTestExecutablePath)();
        const dbPath = path_1.default.resolve("test/testFreqDbs/GB_50_Jan2014.freqdb");
        tcpServerComponentOptions.grids["GB"] = dbPath; //Note this is a non-standard port so should reliably throw an exception.
        const tcpServerLookupComponent = new tcpServerLookupComponent_1.TcpServerLookupComponent(tcpServerComponentOptions);
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
        const gbFreqs = JSON.parse(fs_1.default.readFileSync(path_1.default.resolve("test/testFreqs/GBFreqs1339200.json")).toString());
        const tcpServerComponentOptions = new tcpServerComponentOptions_1.TcpServerComponentOptions();
        tcpServerComponentOptions.port = 50000;
        tcpServerComponentOptions.executablePath = (0, testUtils_1.getTestExecutablePath)();
        const dbPath = path_1.default.resolve("test/testFreqDbs/GB_50_Jan2014.freqdb");
        tcpServerComponentOptions.grids["GB"] = dbPath;
        const tcpServerLookupComponent = new tcpServerLookupComponent_1.TcpServerLookupComponent(tcpServerComponentOptions);
        tcpServerLookupComponent.lookupProgressEvent.addHandler(d => {
            if (d) {
                expect(d).toBeGreaterThan(progress);
                progress = d;
            }
        });
        const response = await tcpServerLookupComponent.lookup(gbFreqs, ["GB"], new Date('2014-01-01'), new Date('2015-01-03'));
        const r = response[0];
        expect(r).toStrictEqual({ gridId: 'GB', position: 1339200, score: 0 });
        expect(progress).toBe(1);
    }, 300000);
});
