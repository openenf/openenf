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
        const tcpClient = new TcpClient(tcpServerComponentOptions);
        const tcpServerLookupComponent = new TcpServerLookupComponent(tcpClient);
        tcpServerLookupComponent.lookupProgressEvent.addHandler(d => {
            if (d) {
                expect(d).toBeGreaterThanOrEqual(progress);
                progress = d;
            }
        })
        let r: any;
        const response = await tcpServerLookupComponent.lookup(gbFreqs, ["GB"], new Date('2014-01-01'), new Date('2015-01-03'));
        r = response[0];
        expect(r).toStrictEqual({gridId: 'GB', position: 1339200, score: 0});
    }, 300000)
    it('will throw error if no results found', async () => {
        let progress = 0;
        const gbFreqs: (number | null)[] = JSON.parse(fs.readFileSync(path.resolve("test/testFreqs/GBFreqs1339200.json")).toString());
        const tcpServerComponentOptions = new TcpOptions();
        const tcpClient = new TcpClient(tcpServerComponentOptions);
        const tcpServerLookupComponent = new TcpServerLookupComponent(tcpClient);
        let error:any;
        tcpServerLookupComponent.lookupProgressEvent.addHandler(d => {
            if (d) {
                expect(d).toBeGreaterThanOrEqual(progress);
                progress = d;
            }
        })
        let r: any;
        //Grid XY should not exist:
        await tcpServerLookupComponent.lookup(gbFreqs, ["XY"], new Date('2014-01-01'), new Date('2015-01-03')).catch(e => {
            error = e;
        })
        expect(error.message).toBe("NoResultsOnLookup")
    }, 300000)
})
