"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENFProcessorFactory = void 0;
const GoertzelFilterCache_1 = require("../goertzel/GoertzelFilterCache");
const audioContextPreScanComponent_1 = require("../preScan/audioContextPreScanComponent");
const goertzelReduceComponent_1 = require("../reduce/goertzelReduceComponent");
const tcpOptions_1 = require("../lookup/tcpOptions");
const tcpServerLookupComponent_1 = require("../lookup/tcpServerLookupComponent");
const tcpServerRefineComponent_1 = require("../refine/tcpServerRefineComponent");
const baseENFProcessor_1 = require("./baseENFProcessor");
const tcpClientUtils_1 = require("../tcpClient/tcpClientUtils");
const path_1 = __importDefault(require("path"));
const ENFDataDirectory_1 = require("../dataDownloader/ENFDataDirectory");
const tcpClient_1 = require("../tcpClient/tcpClient");
const threadedAudioContextAnalyzeComponent_1 = require("../analyze/threadedAudioContextAnalyzeComponent");
class ENFProcessorFactory {
    constructor() {
        this.executablePath = (0, tcpClientUtils_1.getDefaultExecutablePath)();
        this.tcpPort = 49170;
    }
    static ExecutablePath(path) {
        const factory = new ENFProcessorFactory();
        factory.executablePath = path;
        return factory;
    }
    ExecutablePath(path) {
        this.executablePath = path;
        return this;
    }
    static async Build() {
        const factory = new ENFProcessorFactory();
        return await factory.Build();
    }
    async Build() {
        const overlapFactor = 16;
        const goertzelFilterCache = new GoertzelFilterCache_1.GoertzelFilterCache();
        const preScanComponent = new audioContextPreScanComponent_1.AudioContextPreScanComponent(goertzelFilterCache);
        const analyzeComponent = new threadedAudioContextAnalyzeComponent_1.ThreadedAudioContextAnalyzeComponent(overlapFactor);
        const reduceComponent = new goertzelReduceComponent_1.GoertzelReduceComponent(overlapFactor);
        const tcpServerComponentOptions = new tcpOptions_1.TcpOptions();
        tcpServerComponentOptions.executablePath = this.executablePath;
        tcpServerComponentOptions.grids["GB"] = path_1.default.join((0, ENFDataDirectory_1.getENFDataDirectory)(), "GB.freqdb");
        tcpServerComponentOptions.grids["DE"] = path_1.default.join((0, ENFDataDirectory_1.getENFDataDirectory)(), "DE.freqdb");
        tcpServerComponentOptions.port = this.tcpPort;
        const tcpClient = new tcpClient_1.TcpClient(tcpServerComponentOptions);
        const lookupComponent = new tcpServerLookupComponent_1.TcpServerLookupComponent(tcpClient);
        const refineComponent = new tcpServerRefineComponent_1.TcpServerRefineComponent(tcpClient);
        const baseENFProcessor = new baseENFProcessor_1.BaseENFProcessor(preScanComponent, analyzeComponent, reduceComponent, lookupComponent, refineComponent, () => {
            return tcpClient.stop();
        });
        baseENFProcessor.onAnalyzeCompleteEvent.addHandler(async () => {
            return await tcpClient.activateServer();
        });
        return baseENFProcessor;
    }
    TcpPort(tcpPort) {
        this.tcpPort = tcpPort;
        return this;
    }
}
exports.ENFProcessorFactory = ENFProcessorFactory;
