import { GoertzelFilterStore } from "../goertzel/GoertzelFilterStore";
import { OverlapFactor } from "../bufferedAudioProcessor/bufferedAudioProcessor";
import { AnalysisWindowResult } from "../model/analysisWindowResult";
import { ENFEventBase } from "../ENFProcessor/events/ENFEventBase";
export declare class GoertzelAnalyzeProcessor {
    private goertzelFilterStore;
    private bufferedProcessor;
    private cursor;
    private harmonics;
    private results;
    private oFactor;
    private analyzeProgressEvent;
    private samplesProcessed;
    private totalSamples;
    private firstWindow;
    bufferHandler(window: number[]): void;
    constructor(goertzelFilterStore: GoertzelFilterStore, harmonic: number, oFactor: OverlapFactor, analyzeProgressEvent: ENFEventBase<[AnalysisWindowResult, number]>, totalSamples: number);
    process(input: ArrayLike<number>): void;
    getResult(): AnalysisWindowResult[];
}
