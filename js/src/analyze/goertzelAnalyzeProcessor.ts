import {hann} from "../windowing/windowing";
import {GoertzelFilterStore} from "../goertzel/GoertzelFilterStore";
import {BufferedAudioProcessor, OverlapFactor} from "../bufferedAudioProcessor/bufferedAudioProcessor";
import {AnalysisWindowResult} from "../model/analysisWindowResult";
import {getDataForWindow} from "../goertzel/GoertzelAnalyze";

export class GoertzelAnalyzeProcessor {
    private context: GoertzelFilterStore;
    private bufferedProcessor: BufferedAudioProcessor<number>;
    private cursor = 0;
    private harmonics: number[];
    private results: AnalysisWindowResult[] = [];
    private oFactor: OverlapFactor;

    bufferHandler(window: number[]) {
        const windowedSamples = hann(window,0);
        const sampleRate = this.context.sampleRate
        const windowSize = this.context.windowSize;
        const requestCache = this.context.createRequestCache(windowedSamples);
        const data:any[] = [];
        const windowResult = {
            start: this.cursor / sampleRate,
            end: (this.cursor + windowSize) / sampleRate,
            startSamples: this.cursor,
            endSamples: this.cursor + windowSize - 1,
            channelNum:1,
            data:data
        }
        this.harmonics.forEach(h => {
            const result = getDataForWindow(h, requestCache);
            result.target = h;
            windowResult.data.push(result)
        })
        this.results.push(windowResult)
        this.cursor += this.context.windowSize / this.oFactor;
    }

    constructor(context: GoertzelFilterStore, harmonic: number, oFactor: OverlapFactor) {
        this.context = context
        this.oFactor = oFactor
        this.bufferedProcessor = new BufferedAudioProcessor<number>(this.context.windowSize, window => this.bufferHandler(window), oFactor);
        this.harmonics = [harmonic]
    }

    process(input: ArrayLike<number>) {
        this.bufferedProcessor.addChunk(Array.from(input))
    }

    getResult(): AnalysisWindowResult[] {
        return this.results
    }
}
