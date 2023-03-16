import {BaseENFProcessor} from "./baseENFProcessor";
import {FfmpegPreScanComponent} from "../preScan/ffmpegPreScanComponent";
import {GoertzelFilterCache} from "../goertzel/GoertzelFilterCache";
import {FfmpegAnalyzeComponent} from "../analyze/ffmpegAnalyzeComponent";
import {GoertzelReduceComponent} from "../reduce/goertzelReduceComponent";
import {WasmFreqDbReaderLookupComponent} from "../lookup/wasmFreqDbReaderLookupComponent";
import {WasmFreqDbReaderStore} from "../wasmFreqDbReader/wasmFreqDbReaderStore";
import {WasmFreqDbReaderRefineComponent} from "../refine/wasmFreqDbReaderRefineComponent";
import {AudioContextPreScanComponent} from "../preScan/audioContextPreScanComponent";
import {AudioContextAnalyzeComponent} from "../analyze/audioContextAnalyzeComponent";

describe("BaseENFProcessor", () => {

    const overlapFactor = 1;
    const goertzelFilterCache = new GoertzelFilterCache();
    const preScanComponent = new AudioContextPreScanComponent(goertzelFilterCache);
    const analyzeComponent = new AudioContextAnalyzeComponent(goertzelFilterCache, overlapFactor);
    const reduceComponent = new GoertzelReduceComponent(overlapFactor);
    const dbPath = "test/testFreqDbs/GB_50_Jan2014.freqdb";
    const wasmPath = "src/wasmFreqDbReader/freqDbReader.wasm.js"
    const freqDbReaderStore = new WasmFreqDbReaderStore(wasmPath);
    const lookupComponent = new WasmFreqDbReaderLookupComponent(freqDbReaderStore);
    const refineComponent = new WasmFreqDbReaderRefineComponent(freqDbReaderStore);
    const baseENFProcessor = new BaseENFProcessor(preScanComponent, analyzeComponent, reduceComponent, lookupComponent, refineComponent);

    beforeAll(async () => {
        freqDbReaderStore.addPath("GB", dbPath);
        await freqDbReaderStore.getReader("GB");
    })
    it("Can perform lookup for real-world data on truncated Jan 2014 GB grid data", async () => {
        const filepath = "test/testAudio/GBJan2014LookupTest.wav";
        const result = await baseENFProcessor.performFullAnalysis(filepath, ["GB"]);
        expect(result.analysisEndTime?.getTime()).toBeGreaterThan(result.analysisStartTime.getTime())
        expect(result.error).toBeNull();
        expect(result.noMatchReason).toBeNull();
        // @ts-ignore
        expect(result.ENFAnalysisResults[0]).toStrictEqual(
            {
                "gridId": "GB",
                "kurtosis": -0.5811564510945514,
                "normalisedScore": 0,
                "score": 0,
                "time": new Date("2014-01-16T12:00:01.000Z")
            }
        );
    }, 60000)
})
