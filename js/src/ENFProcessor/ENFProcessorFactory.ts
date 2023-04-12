import {ENFProcessor} from "./ENFProcessor";
import {GoertzelFilterCache} from "../goertzel/GoertzelFilterCache";
import {AudioContextPreScanComponent} from "../preScan/audioContextPreScanComponent";
import {AudioContextAnalyzeComponent} from "../analyze/audioContextAnalyzeComponent";
import {GoertzelReduceComponent} from "../reduce/goertzelReduceComponent";
import {TcpServerComponentOptions} from "../lookup/tcpServerComponentOptions";
import {TcpServerLookupComponent} from "../lookup/tcpServerLookupComponent";
import {TcpServerRefineComponent} from "../refine/tcpServerRefineComponent";
import {BaseENFProcessor} from "./baseENFProcessor";
import {getDefaultExecutablePath} from "../tcpClient/tcpClientUtils";
import path from "path";
import {getENFDataDirectory} from "../dataDownloader/ENFDataDirectory";
import {TcpLookupServer} from "../tcpClient/tcpLookupServer";

export class ENFProcessorFactory {
    private executablePath: string = getDefaultExecutablePath();
    private tcpPort: number = 49170;
    public static ExecutablePath(path: string):ENFProcessorFactory {
        const factory = new ENFProcessorFactory();
        factory.executablePath = path;
        return factory;
    }
    public ExecutablePath(path: string):ENFProcessorFactory {
        this.executablePath = path;
        return this;
    }
    public static async Build():Promise<ENFProcessor> {
        const factory = new ENFProcessorFactory();
        return await factory.Build();
    }
    public async Build():Promise<ENFProcessor> {
        const overlapFactor = 16;
        const goertzelFilterCache = new GoertzelFilterCache();
        const preScanComponent = new AudioContextPreScanComponent(goertzelFilterCache);
        const analyzeComponent = new AudioContextAnalyzeComponent(goertzelFilterCache, overlapFactor);
        const reduceComponent = new GoertzelReduceComponent(overlapFactor);

        const tcpServerComponentOptions = new TcpServerComponentOptions();
        tcpServerComponentOptions.executablePath = this.executablePath;
        tcpServerComponentOptions.grids["GB"] = path.join(getENFDataDirectory(),"GB.freqdb");
        tcpServerComponentOptions.grids["DE"] = path.join(getENFDataDirectory(),"DE.freqdb");
        tcpServerComponentOptions.port = this.tcpPort;
        const tcpServer = new TcpLookupServer(tcpServerComponentOptions.port, tcpServerComponentOptions.executablePath);
        await tcpServer.start().catch(e => {
            console.error(e);
        })
        const lookupComponent = new TcpServerLookupComponent(tcpServerComponentOptions);
        const refineComponent = new TcpServerRefineComponent(tcpServerComponentOptions);
        const baseENFProcessor = new BaseENFProcessor(preScanComponent, analyzeComponent, reduceComponent, lookupComponent, refineComponent);
        baseENFProcessor.fullAnalysisCompleteEvent.addHandler(async () => {
            await tcpServer.stop();
        })
        return baseENFProcessor;
    }

    TcpPort(tcpPort: number):ENFProcessorFactory {
        this.tcpPort = tcpPort
        return this;
    }
}