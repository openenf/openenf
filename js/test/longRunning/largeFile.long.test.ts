import {downloadData} from "../../src/dataDownloader/downloadData";
import {GoertzelFilterCache} from "../../src/goertzel/GoertzelFilterCache";
import {AudioContextPreScanComponent} from "../../src/preScan/audioContextPreScanComponent";
import {AudioContextAnalyzeComponent} from "../../src/analyze/audioContextAnalyzeComponent";
import {GoertzelReduceComponent} from "../../src/reduce/goertzelReduceComponent";
import {TcpServerComponentOptions} from "../../src/lookup/tcpServerComponentOptions";
import {getTestExecutablePath} from "../../src/testUtils";
import {TcpServerLookupComponent} from "../../src/lookup/tcpServerLookupComponent";
import {TcpServerRefineComponent} from "../../src/refine/tcpServerRefineComponent";
import {BaseENFProcessor} from "../../src/ENFProcessor/baseENFProcessor";
import fs from "fs";
import path from "path";

describe('BaseENFProcessor', () => {
    it('can lookup over 2 grids', async () => {
        const lookupFreqs:number[] = JSON.parse(fs.readFileSync("test/testFreqs/GB_2020-11-28T210904_saw_3600_J_secs_05amp_8Harmonics.wav.freqs.json").toString());
        //const lookupFreqs:(number | null)[] = JSON.parse(fs.readFileSync(path.resolve("test/testFreqs/GBFreqs1339200.json")).toString());
        const overlapFactor = 1;
        const goertzelFilterCache = new GoertzelFilterCache();
        const preScanComponent = new AudioContextPreScanComponent(goertzelFilterCache);
        const analyzeComponent = new AudioContextAnalyzeComponent(goertzelFilterCache, overlapFactor);
        const reduceComponent = new GoertzelReduceComponent(overlapFactor);

        const tcpServerComponentOptions = new TcpServerComponentOptions();
        tcpServerComponentOptions.executablePath = getTestExecutablePath();

        const lookupComponent = new TcpServerLookupComponent(tcpServerComponentOptions);
        const refineComponent = new TcpServerRefineComponent(tcpServerComponentOptions);

        const baseENFProcessor = new BaseENFProcessor(preScanComponent, analyzeComponent, reduceComponent, lookupComponent, refineComponent);
        baseENFProcessor.lookupProgressEvent.addHandler(d => {
            console.log('d', d)
        })
        const results = await baseENFProcessor.lookup(lookupFreqs,["GB","DE"], new Date("2020-11-01"), new Date("2020-12-01"));
        console.log('results', results);
        //expect(results[0]).toStrictEqual({ gridId: 'GB', position: 1339200, score: 0 });
    }, 30000000)
});
