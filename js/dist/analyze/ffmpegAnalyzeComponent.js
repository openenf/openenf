import { ENFEventBase } from "../ENFProcessor/events/ENFEventBase";
import { GoertzelAnalyzeProcessor } from "./goertzelAnalyzeProcessor";
import { streamAudioFile } from "../ffmpegUtils/streamAudioFile";
import { validatePreScanResult } from "./validatePrescanResult";
/**
 * Implements {@link AnalyzeComponent} using the Fluent FFMpeg package.
 * Pros of using FFMpeg
 * - Can handle most media types.
 * Cons
 * - Slower than AudioContext
 */
export class FfmpegAnalyzeComponent {
    constructor(goertzelFilterCache, overlapFactor) {
        this.analyzeProgressEvent = new ENFEventBase();
        this.implementationId = "FfmpegAnalyzeComponent.0.0.1";
        this.goertzelFilterCache = goertzelFilterCache;
        this.overlapFactor = overlapFactor;
    }
    async analyze(resourceUri, preScanResult, expectedFrequency) {
        const goertzelStore = this.goertzelFilterCache.getStore(preScanResult.sampleRate, preScanResult.sampleRate);
        const frequencies = validatePreScanResult(preScanResult, expectedFrequency);
        const analyzeProcessor = new GoertzelAnalyzeProcessor(goertzelStore, frequencies[0], this.overlapFactor, this.analyzeProgressEvent, preScanResult.durationSamples);
        await streamAudioFile(resourceUri, preScanResult.numChannels || 1, (chunk) => {
            analyzeProcessor.process(chunk);
        });
        const result = analyzeProcessor.getResult();
        return result;
    }
}
