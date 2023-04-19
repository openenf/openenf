import {BaseENFProcessor} from "./baseENFProcessor";
import {GoertzelFilterCache} from "../goertzel/GoertzelFilterCache";
import {GoertzelReduceComponent} from "../reduce/goertzelReduceComponent";
import {AudioContextPreScanComponent} from "../preScan/audioContextPreScanComponent";
import {AudioContextAnalyzeComponent} from "../analyze/audioContextAnalyzeComponent";
import {TcpOptions} from "../lookup/tcpOptions";
import {TcpServerLookupComponent} from "../lookup/tcpServerLookupComponent";
import {TcpServerRefineComponent} from "../refine/tcpServerRefineComponent";
import {TcpClient} from "../tcpClient/tcpClient";

describe("BaseENFProcessor", () => {

    const overlapFactor = 1;
    const goertzelFilterCache = new GoertzelFilterCache();
    const preScanComponent = new AudioContextPreScanComponent(goertzelFilterCache);
    const analyzeComponent = new AudioContextAnalyzeComponent(goertzelFilterCache, overlapFactor);
    const reduceComponent = new GoertzelReduceComponent(overlapFactor);

    const tcpServerComponentOptions = new TcpOptions();

    const tcpClient = new TcpClient(tcpServerComponentOptions);

    const lookupComponent = new TcpServerLookupComponent(tcpClient);
    const refineComponent = new TcpServerRefineComponent(tcpClient);

    const baseENFProcessor = new BaseENFProcessor(preScanComponent, analyzeComponent, reduceComponent, lookupComponent, refineComponent);

    it("Can perform lookup for real-world data on truncated Jan 2014 GB grid data", async () => {
        let result: any;
        try {
            const filepath = "test/testAudio/GBJan2014LookupTest.wav";
            result = await baseENFProcessor.performFullAnalysis(filepath, ["GB"]);
        } finally {
            await baseENFProcessor.dispose();
        }
        expect(result.analysisEndTime?.getTime()).toBeGreaterThan(result.analysisStartTime.getTime())
        expect(result.error).toBeNull();
        expect(result.noMatchReason).toBeNull();
        // @ts-ignore
        expect(result.ENFAnalysisResults[0]).toStrictEqual(
            {
                "gridId": "GB",
                "kurtosis": -1.0128514961485675,
                "normalisedScore": 0,
                "score": 0,
                "time": new Date("2014-01-16T12:00:01.000Z")
            }
        );
    }, 20000)
})
