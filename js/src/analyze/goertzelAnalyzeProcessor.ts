import {hann} from "../windowing/windowing";
import {GoertzelFilterStore} from "../goertzel/GoertzelFilterStore";
import {BufferedAudioProcessor, OverlapFactor} from "../bufferedAudioProcessor/bufferedAudioProcessor";
import {AnalysisWindowResult} from "../model/analysisWindowResult";
import {getDataForWindow} from "../goertzel/GoertzelAnalyze";
import {ENFEventBase} from "../ENFProcessor/events/ENFEventBase";
import fs from "fs";

export class GoertzelAnalyzeProcessor {
    private goertzelFilterStore: GoertzelFilterStore;
    private bufferedProcessor: BufferedAudioProcessor<number>;
    private cursor = 0;
    private harmonics: number[];
    private results: AnalysisWindowResult[] = [];
    private oFactor: OverlapFactor;
    private analyzeProgressEvent: ENFEventBase<[AnalysisWindowResult, number]>
    private samplesProcessed: number = 0;
    private totalSamples: number = 0;
    private firstWindow = false;

    bufferHandler(window: number[]) {
        if (!this.firstWindow) {
            fs.writeFileSync('/Users/chris.hodges/openEnfPublicRepo/js/test/testAudioWindows/Plax_tumbledryer_firstSecondUnwindowed.chrome.json', JSON.stringify(window, null, 2))
            console.log('WINDOW!!!', JSON.stringify(window, null, 2));
            console.log('windowLength', window.length);
            this.firstWindow = true;
        }
        const windowedSamples = hann(window,0);
        const sampleRate = this.goertzelFilterStore.sampleRate
        const windowSize = this.goertzelFilterStore.windowSize;
        const requestCache = this.goertzelFilterStore.createRequestCache(windowedSamples);
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
        this.samplesProcessed = windowResult.endSamples;
        this.analyzeProgressEvent.trigger([windowResult,this.samplesProcessed / this.totalSamples]);
        this.cursor += this.goertzelFilterStore.windowSize / this.oFactor;
    }

    constructor(goertzelFilterStore: GoertzelFilterStore, harmonic: number, oFactor: OverlapFactor, analyzeProgressEvent: ENFEventBase<[AnalysisWindowResult, number]>, totalSamples:number) {
        this.totalSamples = totalSamples;
        this.goertzelFilterStore = goertzelFilterStore
        this.oFactor = oFactor
        this.bufferedProcessor = new BufferedAudioProcessor<number>(this.goertzelFilterStore.windowSize, window => this.bufferHandler(window), oFactor);
        this.harmonics = [harmonic]
        this.analyzeProgressEvent = analyzeProgressEvent
    }

    process(input: ArrayLike<number>) {
        this.bufferedProcessor.addChunk(Array.from(input))
    }

    getResult(): AnalysisWindowResult[] {
        return this.results
    }
}
