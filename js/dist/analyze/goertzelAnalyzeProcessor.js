import { hann } from "../windowing/windowing";
import { BufferedAudioProcessor } from "../bufferedAudioProcessor/bufferedAudioProcessor";
import { getDataForWindow } from "../goertzel/GoertzelAnalyze";
export class GoertzelAnalyzeProcessor {
    bufferHandler(window) {
        const windowedSamples = hann(window, 0);
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
            const result = getDataForWindow(h, requestCache);
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
        this.bufferedProcessor = new BufferedAudioProcessor(this.context.windowSize, window => this.bufferHandler(window), oFactor);
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
