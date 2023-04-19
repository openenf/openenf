"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoertzelAnalyzeProcessor = void 0;
const windowing_1 = require("../windowing/windowing");
const bufferedAudioProcessor_1 = require("../bufferedAudioProcessor/bufferedAudioProcessor");
const GoertzelAnalyze_1 = require("../goertzel/GoertzelAnalyze");
class GoertzelAnalyzeProcessor {
    bufferHandler(window) {
        if (!this.firstWindow) {
            this.firstWindow = true;
        }
        const windowedSamples = (0, windowing_1.hann)(window, 1);
        const sampleRate = this.goertzelFilterStore.sampleRate;
        const windowSize = this.goertzelFilterStore.windowSize;
        const requestCache = this.goertzelFilterStore.createRequestCache(windowedSamples);
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
        this.cursor += this.goertzelFilterStore.windowSize / this.oFactor;
    }
    constructor(goertzelFilterStore, harmonic, oFactor, analyzeProgressEvent, totalSamples) {
        this.cursor = 0;
        this.results = [];
        this.samplesProcessed = 0;
        this.totalSamples = 0;
        this.firstWindow = false;
        this.totalSamples = totalSamples;
        this.goertzelFilterStore = goertzelFilterStore;
        this.oFactor = oFactor;
        this.bufferedProcessor = new bufferedAudioProcessor_1.BufferedAudioProcessor(this.goertzelFilterStore.windowSize, window => this.bufferHandler(window), oFactor);
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
