"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FfmpegAnalyzeComponent = void 0;
const ENFEventBase_1 = require("../ENFProcessor/events/ENFEventBase");
const goertzelAnalyzeProcessor_1 = require("./goertzelAnalyzeProcessor");
const streamAudioFile_1 = require("../ffmpegUtils/streamAudioFile");
const validatePrescanResult_1 = require("./validatePrescanResult");
/**
 * Implements {@link AnalyzeComponent} using the Fluent FFMpeg package.
 * Pros of using FFMpeg
 * - Can handle most media types.
 * Cons
 * - Slower than AudioContext
 */
class FfmpegAnalyzeComponent {
    constructor(goertzelFilterCache, overlapFactor) {
        this.analyzeProgressEvent = new ENFEventBase_1.ENFEventBase();
        this.implementationId = "FfmpegAnalyzeComponent.0.0.1";
        this.goertzelFilterCache = goertzelFilterCache;
        this.overlapFactor = overlapFactor;
    }
    async analyze(resourceUri, preScanResult, expectedFrequency) {
        const goertzelStore = this.goertzelFilterCache.getStore(preScanResult.sampleRate, preScanResult.sampleRate);
        const frequencies = (0, validatePrescanResult_1.validatePreScanResult)(preScanResult, expectedFrequency);
        const analyzeProcessor = new goertzelAnalyzeProcessor_1.GoertzelAnalyzeProcessor(goertzelStore, frequencies[0], this.overlapFactor, this.analyzeProgressEvent, preScanResult.durationSamples);
        await (0, streamAudioFile_1.streamAudioFile)(resourceUri, preScanResult.numChannels || 1, (chunk) => {
            analyzeProcessor.process(chunk);
        });
        const result = analyzeProcessor.getResult();
        return result;
    }
}
exports.FfmpegAnalyzeComponent = FfmpegAnalyzeComponent;
