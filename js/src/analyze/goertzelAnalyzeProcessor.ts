import {hann} from "../windowing/windowing";
import {GoertzelFilterStore} from "../goertzel/GoertzelFilterStore";
import {BufferedAudioProcessor, OverlapFactor} from "../bufferedAudioProcessor/bufferedAudioProcessor";
import {AnalysisWindowResult} from "../model/analysisWindowResult";
import {getDataForWindow} from "../goertzel/GoertzelAnalyze";
import {ENFEventBase} from "../ENFProcessor/events/ENFEventBase";

export class GoertzelAnalyzeProcessor {
    private context: GoertzelFilterStore;
    private bufferedProcessor: BufferedAudioProcessor<number>;
    private cursor = 0;
    private harmonics: number[];
    private results: AnalysisWindowResult[] = [];
    private oFactor: OverlapFactor;
    private analyzeProgressEvent: ENFEventBase<[AnalysisWindowResult, number]>
    private samplesProcessed: number = 0;
    private totalSamples: number = 0;

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
        this.samplesProcessed += window.length;
        this.analyzeProgressEvent.trigger([windowResult,this.samplesProcessed / this.totalSamples]);
        this.cursor += this.context.windowSize / this.oFactor;
    }

    constructor(context: GoertzelFilterStore, harmonic: number, oFactor: OverlapFactor, analyzeProgressEvent: ENFEventBase<[AnalysisWindowResult, number]>) {
        this.context = context
        this.oFactor = oFactor
        this.bufferedProcessor = new BufferedAudioProcessor<number>(this.context.windowSize, window => this.bufferHandler(window), oFactor);
        this.harmonics = [harmonic]
        this.analyzeProgressEvent = analyzeProgressEvent
    }

    process(input: ArrayLike<number>) {
        this.samplesProcessed = 0;
        this.totalSamples = input.length;
        this.bufferedProcessor.addChunk(Array.from(input))
    }

    getResult(): AnalysisWindowResult[] {
        return this.results
    }
}
