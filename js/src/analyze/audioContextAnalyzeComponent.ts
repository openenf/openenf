import {AnalyzeComponent} from "./analyzeComponent";
import {ENFEventBase} from "../ENFProcessor/events/ENFEventBase";
import {AnalysisWindowResult} from "../model/analysisWindowResult";
import {PreScanResultLike} from "../model/preScanResultLike";
import {OverlapFactor} from "../bufferedAudioProcessor/bufferedAudioProcessor";
import {GoertzelFilterCache} from "../goertzel/GoertzelFilterCache";
import {validatePreScanResult} from "./validatePrescanResult";
import {GoertzelAnalyzeProcessor} from "./goertzelAnalyzeProcessor";
import {getAudioData} from "../preScan/getAudioData";
import fs from "fs";

export class AudioContextAnalyzeComponent implements AnalyzeComponent {
    analyzeProgressEvent: ENFEventBase<[AnalysisWindowResult, number]> = new ENFEventBase<[AnalysisWindowResult, number]>()
    readonly implementationId: string = "AudioContextAnalyzeComponent0.0.1";

    async analyze(resourceUri: string, preScanResult: PreScanResultLike, expectedFrequency?: 50 | 60): Promise<AnalysisWindowResult[]> {
        const goertzelStore = this.goertzelFilterCache.getStore(preScanResult.sampleRate, preScanResult.sampleRate);
        const frequencies = validatePreScanResult(preScanResult, expectedFrequency);
        const analyzeProcessor = new GoertzelAnalyzeProcessor(goertzelStore, frequencies[0], this.overlapFactor, this.analyzeProgressEvent);
        let buffer = fs.readFileSync(resourceUri);
        const [audioData,_] = await getAudioData(buffer, resourceUri);
        analyzeProcessor.process(audioData);
        return analyzeProcessor.getResult();
    }

    private overlapFactor: OverlapFactor;
    private goertzelFilterCache: GoertzelFilterCache;
    constructor(goertzelFilterCache: GoertzelFilterCache, overlapFactor:OverlapFactor) {
        this.goertzelFilterCache = goertzelFilterCache;
        this.overlapFactor = overlapFactor;
    }
}
