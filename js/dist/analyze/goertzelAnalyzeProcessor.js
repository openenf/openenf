"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoertzelAnalyzeProcessor = void 0;
const windowing_1 = require("../windowing/windowing");
const bufferedAudioProcessor_1 = require("../bufferedAudioProcessor/bufferedAudioProcessor");
const GoertzelAnalyze_1 = require("../goertzel/GoertzelAnalyze");
class GoertzelAnalyzeProcessor {
    bufferHandler(window) {
        const windowedSamples = (0, windowing_1.hann)(window, 0);
        const sampleRate = this.context.sampleRate;
        const windowSize = this.context.windowSize;
        const requestCache = this.context.createRequestCache(windowedSamples);
        const data = [];
        const windowResult = {
            start: this.cursor / sampleRate,
            end: (this.cursor + windowSize) / sampleRate,
            startSamples: this.cursor,
            endSamples: this.cursor + windowSize - 1,
            channelNum: 1,
            data: data
        };
        this.harmonics.forEach(h => {
            const result = (0, GoertzelAnalyze_1.getDataForWindow)(h, requestCache);
            result.target = h;
            windowResult.data.push(result);
        });
        this.results.push(windowResult);
        this.samplesProcessed = windowResult.endSamples;
        this.analyzeProgressEvent.trigger([windowResult, this.samplesProcessed / this.totalSamples]);
        this.cursor += this.context.windowSize / this.oFactor;
    }
    constructor(context, harmonic, oFactor, analyzeProgressEvent, totalSamples) {
        this.cursor = 0;
        this.results = [];
        this.samplesProcessed = 0;
        this.totalSamples = 0;
        this.totalSamples = totalSamples;
        this.context = context;
        this.oFactor = oFactor;
        this.bufferedProcessor = new bufferedAudioProcessor_1.BufferedAudioProcessor(this.context.windowSize, window => this.bufferHandler(window), oFactor);
        this.harmonics = [harmonic];
        this.analyzeProgressEvent = analyzeProgressEvent;
    }
    process(input) {
        this.bufferedProcessor.addChunk(Array.from(input));
    }
    getResult() {
        return this.results;
    }
}
exports.GoertzelAnalyzeProcessor = GoertzelAnalyzeProcessor;
