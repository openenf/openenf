"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreScanProcessor = void 0;
const windowing_1 = require("../windowing/windowing");
const bufferedAudioProcessor_1 = require("../bufferedAudioProcessor/bufferedAudioProcessor");
/**
 * This processor uses a regular (non-adaptive) Goertzel filter to determine the signal strengths at 50, 100, 200, 60, 120 and 240hz
 * It combines a {@link BufferedAudioProcessor} and a {@link GoertzelFilterStore} to calculate the harmonics for each audio of window
 * of the size defined in the GoertzelFilterStore.
 */
class PreScanProcessor {
    constructor(context, preScanProgressEvent, totalSamples) {
        this.harmonicStrengths = {};
        this.harmonics = [50, 100, 200, 60, 120, 240];
        this.samplesProcessed = 0;
        this.totalSamples = 0;
        this.totalSamples = totalSamples;
        this.preScanProgressEvent = preScanProgressEvent;
        this.context = context;
        this.harmonics.forEach(h => {
            this.harmonicStrengths[h] = 0;
        });
        this.bufferedProcessor = new bufferedAudioProcessor_1.BufferedAudioProcessor(this.context.windowSize, window => {
            const windowedSamples = (0, windowing_1.hann)(window, 0);
            const goertzelRequestCache = context.createRequestCache(windowedSamples);
            const update = {};
            this.harmonics.forEach(h => {
                const harmonicStrength = goertzelRequestCache.analyze(h);
                if (!isNaN(harmonicStrength)) {
                    update['f' + h.toString()] = harmonicStrength;
                    this.harmonicStrengths[h] += harmonicStrength;
                }
            });
            this.samplesProcessed += window.length;
            update.endSamples = this.samplesProcessed;
            this.preScanProgressEvent.trigger([update, this.samplesProcessed / this.totalSamples]);
        });
    }
    /**
     * @param input a window of audio of a known size
     */
    process(input) {
        this.bufferedProcessor.addChunk(Array.from(input));
    }
    /**
     * Called after all the audio windows have been processed to return an aggregated result.
     */
    getResult() {
        this.bufferedProcessor.flush();
        return this.harmonicStrengths;
    }
}
exports.PreScanProcessor = PreScanProcessor;
