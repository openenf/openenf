import {hann} from "../windowing/windowing";
import {GoertzelFilterStore} from "../goertzel/GoertzelFilterStore";
import {BufferedAudioProcessor} from "../audioProcessor/bufferedAudioProcessor";

export class PreScanProcessor {
    private context: GoertzelFilterStore;
    private bufferedProcessor: BufferedAudioProcessor<number>;
    private harmonicStrengths:{[id:number]:number;} = {}
    private harmonics:number[] = [50, 100, 200, 60, 120, 240]
    constructor(context:GoertzelFilterStore) {
        this.context = context
        this.harmonics.forEach(h => {
            this.harmonicStrengths[h] = 0;
        })
        this.bufferedProcessor = new BufferedAudioProcessor<number>(this.context.windowSize, window => {
            const windowedSamples = hann(window,0);
            const goertzelRequestCache = context.createRequestCache(windowedSamples);
            this.harmonics.forEach(h => {
                this.harmonicStrengths[h] += goertzelRequestCache.analyze(h)
            })
        })
    }
    process(input: ArrayLike<number>) {
        this.bufferedProcessor.addChunk(Array.from(input))
    }
    getResult():{[id:number]:number;} {
        this.bufferedProcessor.flush()
        return this.harmonicStrengths;
    }
}
