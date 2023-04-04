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

export class ENFProcessorFactory {
    private executablePath: string = getDefaultExecutablePath();
    public static ExecutablePath(path: string):ENFProcessorFactory {
        const factory = new ENFProcessorFactory();
        factory.executablePath = path;
        return factory;
    }
    public ExecutablePath(path: string):ENFProcessorFactory {
        this.executablePath = path;
        return this;
    }
    public static Build():ENFProcessor {
        const factory = new ENFProcessorFactory();
        return factory.Build();
    }
    public Build():ENFProcessor {
        const overlapFactor = 4;
        const goertzelFilterCache = new GoertzelFilterCache();
        const preScanComponent = new AudioContextPreScanComponent(goertzelFilterCache);
        const analyzeComponent = new AudioContextAnalyzeComponent(goertzelFilterCache, overlapFactor);
        const reduceComponent = new GoertzelReduceComponent(overlapFactor);

        const tcpServerComponentOptions = new TcpServerComponentOptions();
        tcpServerComponentOptions.executablePath = this.executablePath;
        tcpServerComponentOptions.grids["GB"] = path.join(getENFDataDirectory(),"GB.freqdb");
        tcpServerComponentOptions.grids["DE"] = path.join(getENFDataDirectory(),"DE.freqdb");

        const lookupComponent = new TcpServerLookupComponent(tcpServerComponentOptions);
        const refineComponent = new TcpServerRefineComponent(tcpServerComponentOptions);

        const baseENFProcessor = new BaseENFProcessor(preScanComponent, analyzeComponent, reduceComponent, lookupComponent, refineComponent);
        return baseENFProcessor;
    }
}