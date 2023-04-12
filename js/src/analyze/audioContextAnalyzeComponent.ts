import {AnalyzeComponent} from "./analyzeComponent";
import {ENFEventBase} from "../ENFProcessor/events/ENFEventBase";
import {AnalysisWindowResult} from "../model/analysisWindowResult";
import {PreScanResultLike} from "../model/preScanResultLike";
import {OverlapFactor} from "../bufferedAudioProcessor/bufferedAudioProcessor";
import {GoertzelFilterCache} from "../goertzel/GoertzelFilterCache";
import {validatePreScanResult} from "./validatePrescanResult";
import {GoertzelAnalyzeProcessor} from "./goertzelAnalyzeProcessor";
import {getAudioData} from "../audioContextUtils/getAudioData";
import fs from "fs";

/**
 * Implements {@link AnalyzeComponent} using {@link getAudioData} which in turn uses an underlying {@link AudioContext}.
 * AudioContext is native in the browser but requires the web-audio-api package in Node.
 * Pros of using AudioContext:
 * - Very fast
 * Cons
 * - Can only handle .wav and .mp3 in Node.
 */
export class AudioContextAnalyzeComponent implements AnalyzeComponent {
    analyzeProgressEvent: ENFEventBase<[AnalysisWindowResult, number]> = new ENFEventBase<[AnalysisWindowResult, number]>()
    readonly implementationId: string = "AudioContextAnalyzeComponent0.0.1";

    async analyze(resourceUri: string, preScanResult: PreScanResultLike, expectedFrequency?: 50 | 60): Promise<AnalysisWindowResult[]> {
        const goertzelStore = this.goertzelFilterCache.getStore(preScanResult.sampleRate, preScanResult.sampleRate);
        const frequencies = validatePreScanResult(preScanResult, expectedFrequency);
        let buffer = fs.readFileSync(resourceUri);
        const [audioData,_] = await getAudioData(buffer, resourceUri);
        const analyzeProcessor = new GoertzelAnalyzeProcessor(goertzelStore, frequencies[0], this.overlapFactor, this.analyzeProgressEvent, audioData.length);
        for (let i = 0; i < audioData.length; i += 67108864) {
            analyzeProcessor.process(audioData.slice(i, i+67108864));
        }
        return analyzeProcessor.getResult();
    }

    private overlapFactor: OverlapFactor;
    private goertzelFilterCache: GoertzelFilterCache;
    constructor(goertzelFilterCache: GoertzelFilterCache, overlapFactor:OverlapFactor) {
        this.goertzelFilterCache = goertzelFilterCache;
        this.overlapFactor = overlapFactor;
    }
}
