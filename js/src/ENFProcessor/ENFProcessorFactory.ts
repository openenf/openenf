import {ENFProcessor} from "./ENFProcessor";
import {GoertzelFilterCache} from "../goertzel/GoertzelFilterCache";
import {AudioContextPreScanComponent} from "../preScan/audioContextPreScanComponent";
import {AudioContextAnalyzeComponent} from "../analyze/audioContextAnalyzeComponent";
import {GoertzelReduceComponent} from "../reduce/goertzelReduceComponent";
import {TcpOptions} from "../lookup/tcpOptions";
import {TcpServerLookupComponent} from "../lookup/tcpServerLookupComponent";
import {TcpServerRefineComponent} from "../refine/tcpServerRefineComponent";
import {BaseENFProcessor} from "./baseENFProcessor";
import {getDefaultExecutablePath} from "../tcpClient/tcpClientUtils";
import path from "path";
import {getENFDataDirectory} from "../dataDownloader/ENFDataDirectory";
import {TcpLookupServerController} from "../tcpClient/tcpLookupServerController";
import {TcpClient} from "../tcpClient/tcpClient";
import {ThreadedAudioContextAnalyzeComponent} from "../analyze/threadedAudioContextAnalyzeComponent";

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
        const analyzeComponent = new ThreadedAudioContextAnalyzeComponent(overlapFactor);
        const reduceComponent = new GoertzelReduceComponent(overlapFactor);
        
        const tcpServerComponentOptions = new TcpOptions();
        tcpServerComponentOptions.executablePath = this.executablePath;
        tcpServerComponentOptions.grids["GB"] = path.join(getENFDataDirectory(),"GB.freqdb");
        tcpServerComponentOptions.grids["DE"] = path.join(getENFDataDirectory(),"DE.freqdb");
        tcpServerComponentOptions.port = this.tcpPort;
        const tcpClient = new TcpClient(tcpServerComponentOptions);
        
        const lookupComponent = new TcpServerLookupComponent(tcpClient);
        const refineComponent = new TcpServerRefineComponent(tcpClient);
        const baseENFProcessor = new BaseENFProcessor(preScanComponent, analyzeComponent, reduceComponent, lookupComponent, refineComponent, () => {
            return tcpClient.stop();
        });
        baseENFProcessor.onAnalyzeCompleteEvent.addHandler(async () => {
            return await tcpClient.activateServer();
        })
        return baseENFProcessor;
    }

    TcpPort(tcpPort: number):ENFProcessorFactory {
        this.tcpPort = tcpPort
        return this;
    }
}