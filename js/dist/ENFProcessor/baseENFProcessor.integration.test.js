"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const baseENFProcessor_1 = require("./baseENFProcessor");
const GoertzelFilterCache_1 = require("../goertzel/GoertzelFilterCache");
const goertzelReduceComponent_1 = require("../reduce/goertzelReduceComponent");
const audioContextPreScanComponent_1 = require("../preScan/audioContextPreScanComponent");
const audioContextAnalyzeComponent_1 = require("../analyze/audioContextAnalyzeComponent");
const path_1 = __importDefault(require("path"));
const tcpOptions_1 = require("../lookup/tcpOptions");
const tcpServerLookupComponent_1 = require("../lookup/tcpServerLookupComponent");
const tcpServerRefineComponent_1 = require("../refine/tcpServerRefineComponent");
const tcpClient_1 = require("../tcpClient/tcpClient");
describe("BaseENFProcessor", () => {
    const overlapFactor = 1;
    const goertzelFilterCache = new GoertzelFilterCache_1.GoertzelFilterCache();
    const preScanComponent = new audioContextPreScanComponent_1.AudioContextPreScanComponent(goertzelFilterCache);
    const analyzeComponent = new audioContextAnalyzeComponent_1.AudioContextAnalyzeComponent(goertzelFilterCache, overlapFactor);
    const reduceComponent = new goertzelReduceComponent_1.GoertzelReduceComponent(overlapFactor);
    const tcpServerComponentOptions = new tcpOptions_1.TcpOptions();
    tcpServerComponentOptions.port = 50080;
    const dbPath = path_1.default.resolve("test/testFreqDbs/GB_50_Jan2014.freqdb");
    tcpServerComponentOptions.grids["GB"] = dbPath;
    const tcpClient = new tcpClient_1.TcpClient(tcpServerComponentOptions);
    const lookupComponent = new tcpServerLookupComponent_1.TcpServerLookupComponent(tcpClient);
    const refineComponent = new tcpServerRefineComponent_1.TcpServerRefineComponent(tcpClient);
    const baseENFProcessor = new baseENFProcessor_1.BaseENFProcessor(preScanComponent, analyzeComponent, reduceComponent, lookupComponent, refineComponent, () => {
        return tcpClient.stop();
    });
    it("Can perform lookup for real-world data on truncated Jan 2014 GB grid data", async () => {
        let result;
        try {
            await tcpClient.activateServer();
            const filepath = "test/testAudio/GBJan2014LookupTest.wav";
            result = await baseENFProcessor.performFullAnalysis(filepath, ["GB"]);
        }
        finally {
            await baseENFProcessor.dispose();
        }
        expect(result.analysisEndTime?.getTime()).toBeGreaterThan(result.analysisStartTime.getTime());
        expect(result.error).toBeNull();
        expect(result.noMatchReason).toBeNull();
        // @ts-ignore
        expect(result.ENFAnalysisResults[0]).toStrictEqual({
            "gridId": "GB",
            "kurtosis": -1.0128514961485675,
            "normalisedScore": 0,
            "score": 0,
            "time": new Date("2014-01-16T12:00:01.000Z")
        });
    });
});
