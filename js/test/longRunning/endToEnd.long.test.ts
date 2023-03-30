import {GoertzelFilterCache} from "../../src/goertzel/GoertzelFilterCache";
import {AudioContextPreScanComponent} from "../../src/preScan/audioContextPreScanComponent";
import {AudioContextAnalyzeComponent} from "../../src/analyze/audioContextAnalyzeComponent";
import {GoertzelReduceComponent} from "../../src/reduce/goertzelReduceComponent";
import {TcpServerComponentOptions} from "../../src/lookup/tcpServerComponentOptions";
import {getTestExecutablePath} from "../../src/testUtils";
import {TcpServerLookupComponent} from "../../src/lookup/tcpServerLookupComponent";
import {TcpServerRefineComponent} from "../../src/refine/tcpServerRefineComponent";
import {BaseENFProcessor} from "../../src/ENFProcessor/baseENFProcessor";
import path from "path";

describe('BaseENFProcessor', () => {
    it('can lookup 1 hour audio sample over 2 grids entire range', async () => {
        const overlapFactor = 16;
        const goertzelFilterCache = new GoertzelFilterCache();
        const preScanComponent = new AudioContextPreScanComponent(goertzelFilterCache);
        const analyzeComponent = new AudioContextAnalyzeComponent(goertzelFilterCache, overlapFactor);
        const reduceComponent = new GoertzelReduceComponent(overlapFactor);

        const tcpServerComponentOptions = new TcpServerComponentOptions();
        tcpServerComponentOptions.executablePath = getTestExecutablePath();

        const lookupComponent = new TcpServerLookupComponent(tcpServerComponentOptions);
        const refineComponent = new TcpServerRefineComponent(tcpServerComponentOptions);

        const baseENFProcessor = new BaseENFProcessor(preScanComponent, analyzeComponent, reduceComponent, lookupComponent, refineComponent);
        baseENFProcessor.analysisProgressEvent.addHandler(p => {
            console.log('p', p);
        })
        baseENFProcessor.logEvent.addHandler(s => {
            console.log(s)
        })

        const filepath = path.resolve("test/testAudio/large/DE_2021-02-22T11:52:58_saw_600_H_secs_05amp_8Harmonics.wav");
        const results = await baseENFProcessor.performFullAnalysis(filepath,["DE","GB"]);
        console.log('results', results);
    }, 30000000)
});
