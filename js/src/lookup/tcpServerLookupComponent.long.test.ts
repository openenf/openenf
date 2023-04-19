import {TcpOptions} from "./tcpOptions";
import fs from "fs";
import path from "path";
import {TcpServerLookupComponent} from "../../src/lookup/tcpServerLookupComponent";
import {getDefaultExecutablePath} from "../tcpClient/tcpClientUtils";
import {getENFDataDirectory} from "../dataDownloader/ENFDataDirectory";
import {TcpClient} from "../tcpClient/tcpClient";

describe("TcpServerLookupComponent", () => {
    it('will lookup data from grid', async () => {
        const gbFreqs:(number | null)[] = JSON.parse(fs.readFileSync(path.resolve("test/testFreqs/GB_2020-11-28T210904_saw_3600_J_secs_05amp_8Harmonics.wav.freqs.json")).toString());
        const tcpServerComponentOptions = new TcpOptions();
        tcpServerComponentOptions.executablePath = getDefaultExecutablePath();
        const dbPath = path.resolve(getENFDataDirectory(),"GB.freqdb");
        tcpServerComponentOptions.grids["GB"] = dbPath;
        let progress = 0;
        const tcpClient = new TcpClient(tcpServerComponentOptions);
        const tcpServerLookupComponent = new TcpServerLookupComponent(tcpClient);
        tcpServerLookupComponent.lookupProgressEvent.addHandler(d => {
            if (d) {
                console.log(`Progress: d`, d);
                expect(d).toBeGreaterThan(progress);
                progress = d;
            }
        })
        let r:any;
        const response = await tcpServerLookupComponent.lookup(gbFreqs, ["GB"], new Date("2020-11-01"), new Date("2021-11-01"));
        r = response[0];
        expect(r).toStrictEqual({ gridId: 'GB', position: 218063344, score: 0 });
        expect(progress).toBeGreaterThanOrEqual(1);
    }, 3000000)

    it('will lookup apawlak data from grid', async () => {
        const gbFreqs:(number | null)[] = JSON.parse(fs.readFileSync(path.resolve("test/testFreqs/404931__alanpawlak__ambientuohstudentunion44-1-24bit.wav.freqs.json")).toString());
        const tcpServerComponentOptions = new TcpOptions();
        tcpServerComponentOptions.stdOutHandler = (m?:string) => {
            console.log('m',m);
        }
        tcpServerComponentOptions.executablePath = getDefaultExecutablePath();
        const dbPath = path.resolve(getENFDataDirectory(),"GB.freqdb");
        tcpServerComponentOptions.grids["GB"] = dbPath;
        let progress = 0;
        const tcpClient = new TcpClient(tcpServerComponentOptions);
        const tcpServerLookupComponent = new TcpServerLookupComponent(tcpClient);
        tcpServerLookupComponent.lookupProgressEvent.addHandler(d => {
            if (d) {
                console.log(`Progress: d`, d);
                expect(d).toBeGreaterThan(progress);
                progress = d;
            }
        })
        let r:any;
        const response = await tcpServerLookupComponent.lookup(gbFreqs, ["GB"], new Date("2020-11-01"), new Date("2021-11-01"));
        console.log('response', response);
        r = response[0];
        expect(r).toStrictEqual({ gridId: 'GB', position: 218063344, score: 0 });
        expect(progress).toBeGreaterThanOrEqual(1);
    }, 3000000)
})
