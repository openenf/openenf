import { GoertzelFilterCache } from "../goertzel/GoertzelFilterCache";
import { AudioContextPreScanComponent } from "../preScan/audioContextPreScanComponent";
import { AudioContextAnalyzeComponent } from "../analyze/audioContextAnalyzeComponent";
import { GoertzelReduceComponent } from "../reduce/goertzelReduceComponent";
import { TcpServerComponentOptions } from "../lookup/tcpServerComponentOptions";
import { TcpServerLookupComponent } from "../lookup/tcpServerLookupComponent";
import { TcpServerRefineComponent } from "../refine/tcpServerRefineComponent";
import { BaseENFProcessor } from "./baseENFProcessor";
import { getDefaultExecutablePath } from "../tcpClient/tcpClientUtils";
import path from "path";
import { getENFDataDirectory } from "../dataDownloader/ENFDataDirectory";
import { TcpLookupServer } from "../tcpClient/tcpLookupServer";
export class ENFProcessorFactory {
    constructor() {
        this.executablePath = getDefaultExecutablePath();
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
        const goertzelFilterCache = new GoertzelFilterCache();
        const preScanComponent = new AudioContextPreScanComponent(goertzelFilterCache);
        const analyzeComponent = new AudioContextAnalyzeComponent(goertzelFilterCache, overlapFactor);
        const reduceComponent = new GoertzelReduceComponent(overlapFactor);
        const tcpServerComponentOptions = new TcpServerComponentOptions();
        tcpServerComponentOptions.executablePath = this.executablePath;
        tcpServerComponentOptions.grids["GB"] = path.join(getENFDataDirectory(), "GB.freqdb");
        tcpServerComponentOptions.grids["DE"] = path.join(getENFDataDirectory(), "DE.freqdb");
        tcpServerComponentOptions.port = this.tcpPort;
        const tcpServer = new TcpLookupServer(tcpServerComponentOptions.port, tcpServerComponentOptions.executablePath);
        await tcpServer.start().catch(e => {
            console.error(e);
        });
        const lookupComponent = new TcpServerLookupComponent(tcpServerComponentOptions);
        const refineComponent = new TcpServerRefineComponent(tcpServerComponentOptions);
        const baseENFProcessor = new BaseENFProcessor(preScanComponent, analyzeComponent, reduceComponent, lookupComponent, refineComponent);
        baseENFProcessor.fullAnalysisCompleteEvent.addHandler(async () => {
            await tcpServer.stop();
        });
        return baseENFProcessor;
    }
    TcpPort(tcpPort) {
        this.tcpPort = tcpPort;
        return this;
    }
}
