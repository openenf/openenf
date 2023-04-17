"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tcpServerLookupComponent_1 = require("./tcpServerLookupComponent");
const tcpOptions_1 = require("./tcpOptions");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const tcpClient_1 = require("../tcpClient/tcpClient");
describe("TcpServerLookupComponent", () => {
    it('will lookup data from grid', async () => {
        let progress = 0;
        const gbFreqs = JSON.parse(fs_1.default.readFileSync(path_1.default.resolve("test/testFreqs/GBFreqs1339200.json")).toString());
        const tcpServerComponentOptions = new tcpOptions_1.TcpOptions();
        const dbPath = path_1.default.resolve("test/testFreqDbs/GB_50_Jan2014.freqdb");
        tcpServerComponentOptions.grids["GB"] = dbPath;
        const tcpClient = new tcpClient_1.TcpClient(tcpServerComponentOptions);
        const tcpServerLookupComponent = new tcpServerLookupComponent_1.TcpServerLookupComponent(tcpClient);
        tcpServerLookupComponent.lookupProgressEvent.addHandler(d => {
            if (d) {
                expect(d).toBeGreaterThanOrEqual(progress);
                progress = d;
            }
        });
        let r;
        const response = await tcpServerLookupComponent.lookup(gbFreqs, ["GB"], new Date('2014-01-01'), new Date('2015-01-03'));
        r = response[0];
        expect(r).toStrictEqual({ gridId: 'GB', position: 1339200, score: 0 });
    }, 300000);
});
