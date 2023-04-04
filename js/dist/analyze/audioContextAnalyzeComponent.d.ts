import { AnalyzeComponent } from "./analyzeComponent";
import { ENFEventBase } from "../ENFProcessor/events/ENFEventBase";
import { AnalysisWindowResult } from "../model/analysisWindowResult";
import { PreScanResultLike } from "../model/preScanResultLike";
import { OverlapFactor } from "../bufferedAudioProcessor/bufferedAudioProcessor";
import { GoertzelFilterCache } from "../goertzel/GoertzelFilterCache";
/**
 * Implements {@link AnalyzeComponent} using {@link getAudioData} which in turn uses an underlying {@link AudioContext}.
 * AudioContext is native in the browser but requires the web-audio-api package in Node.
 * Pros of using AudioContext:
 * - Very fast
 * Cons
 * - Can only handle .wav and .mp3 in Node.
 */
export declare class AudioContextAnalyzeComponent implements AnalyzeComponent {
    analyzeProgressEvent: ENFEventBase<[AnalysisWindowResult, number]>;
    readonly implementationId: string;
    analyze(resourceUri: string, preScanResult: PreScanResultLike, expectedFrequency?: 50 | 60): Promise<AnalysisWindowResult[]>;
    private overlapFactor;
    private goertzelFilterCache;
    constructor(goertzelFilterCache: GoertzelFilterCache, overlapFactor: OverlapFactor);
}
