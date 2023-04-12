import { PreScanResultLike } from "../model/preScanResultLike";
import { AnalyzeComponent } from "./analyzeComponent";
import { ENFEventBase } from "../ENFProcessor/events/ENFEventBase";
import { AnalysisWindowResult } from "../model/analysisWindowResult";
import { GoertzelFilterCache } from "../goertzel/GoertzelFilterCache";
import { OverlapFactor } from "../bufferedAudioProcessor/bufferedAudioProcessor";
/**
 * Implements {@link AnalyzeComponent} using the Fluent FFMpeg package.
 * Pros of using FFMpeg
 * - Can handle most media types.
 * Cons
 * - Slower than AudioContext
 */
export declare class FfmpegAnalyzeComponent implements AnalyzeComponent {
    analyzeProgressEvent: ENFEventBase<[AnalysisWindowResult, number]>;
    readonly implementationId: string;
    private overlapFactor;
    private goertzelFilterCache;
    constructor(goertzelFilterCache: GoertzelFilterCache, overlapFactor: OverlapFactor);
    analyze(resourceUri: string, preScanResult: PreScanResultLike, expectedFrequency?: 50 | 60): Promise<AnalysisWindowResult[]>;
}
