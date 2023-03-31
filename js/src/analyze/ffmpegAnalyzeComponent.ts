import {PreScanResultLike} from "../model/preScanResultLike";
import {AnalyzeComponent} from "./analyzeComponent";
import {ENFEventBase} from "../ENFProcessor/events/ENFEventBase";
import {AnalysisWindowResult} from "../model/analysisWindowResult";
import {GoertzelAnalyzeProcessor} from "./goertzelAnalyzeProcessor";
import {GoertzelFilterCache} from "../goertzel/GoertzelFilterCache";
import {streamAudioFile} from "../ffmpegUtils/streamAudioFile";
import {OverlapFactor} from "../bufferedAudioProcessor/bufferedAudioProcessor";
import {validatePreScanResult} from "./validatePrescanResult";

/**
 * Implements {@link AnalyzeComponent} using the Fluent FFMpeg package.
 * Pros of using FFMpeg
 * - Can handle most media types.
 * Cons
 * - Slower than AudioContext
 */
export class FfmpegAnalyzeComponent implements AnalyzeComponent {
    analyzeProgressEvent: ENFEventBase<[AnalysisWindowResult, number]> = new ENFEventBase<[AnalysisWindowResult, number]>();
    readonly implementationId: string = "FfmpegAnalyzeComponent.0.0.1"
    private overlapFactor: OverlapFactor;
    private goertzelFilterCache: GoertzelFilterCache;
    constructor(goertzelFilterCache: GoertzelFilterCache, overlapFactor:OverlapFactor) {
        this.goertzelFilterCache = goertzelFilterCache;
        this.overlapFactor = overlapFactor;
    }

    async analyze(resourceUri: string, preScanResult: PreScanResultLike, expectedFrequency?:50|60): Promise<AnalysisWindowResult[]> {
        const goertzelStore = this.goertzelFilterCache.getStore(preScanResult.sampleRate, preScanResult.sampleRate);
        const frequencies = validatePreScanResult(preScanResult, expectedFrequency);
        const analyzeProcessor = new GoertzelAnalyzeProcessor(goertzelStore, frequencies[0], this.overlapFactor, this.analyzeProgressEvent);
        await streamAudioFile(resourceUri, preScanResult.numChannels || 1, (chunk) => {
            analyzeProcessor.process(chunk);
        })
        const result = analyzeProcessor.getResult();
        return result;
    }
}
