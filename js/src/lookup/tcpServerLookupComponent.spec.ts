import {TcpServerLookupComponent} from "./tcpServerLookupComponent";
import {TcpOptions} from "./tcpOptions";
import path from "path";
import fs from "fs";
import {TcpClient} from "../tcpClient/tcpClient";

describe("TcpServerLookupComponent", () => {
    it('will lookup data from grid', async () => {
        let progress = 0;
        const gbFreqs: (number | null)[] = JSON.parse(fs.readFileSync(path.resolve("test/testFreqs/GBFreqs1339200.json")).toString());
        const tcpServerComponentOptions = new TcpOptions();
        tcpServerComponentOptions.port = 50000;
        const dbPath = path.resolve("test/testFreqDbs/GB_50_Jan2014.freqdb");
        tcpServerComponentOptions.grids["GB"] = dbPath;
        
        const tcpClient = new TcpClient(tcpServerComponentOptions);
        await tcpClient.activateServer();
        
        const tcpServerLookupComponent = new TcpServerLookupComponent(tcpClient);
        tcpServerLookupComponent.lookupProgressEvent.addHandler(d => {
            if (d) {
                expect(d).toBeGreaterThanOrEqual(progress);
                progress = d;
            }
        })
        let r: any;
        try {
            const response = await tcpServerLookupComponent.lookup(gbFreqs, ["GB"], new Date('2014-01-01'), new Date('2015-01-03'));
            r = response[0];
        } finally {
            await tcpClient.stop();
        }
        expect(r).toStrictEqual({gridId: 'GB', position: 1339200, score: 0});
    }, 300000)
})
