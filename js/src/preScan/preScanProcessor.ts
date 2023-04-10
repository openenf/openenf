import {hann} from "../windowing/windowing";
import {GoertzelFilterStore} from "../goertzel/GoertzelFilterStore";
import {BufferedAudioProcessor} from "../bufferedAudioProcessor/bufferedAudioProcessor";
import {ENFEventBase} from "../ENFProcessor/events/ENFEventBase";
import {PreScanUpdate} from "../model/preScanUpdate";

/**
 * This processor uses a regular (non-adaptive) Goertzel filter to determine the signal strengths at 50, 100, 200, 60, 120 and 240hz
 * It combines a {@link BufferedAudioProcessor} and a {@link GoertzelFilterStore} to calculate the harmonics for each audio of window
 * of the size defined in the GoertzelFilterStore.
 */
export class PreScanProcessor {
    private context: GoertzelFilterStore;
    private bufferedProcessor: BufferedAudioProcessor<number>;
    private harmonicStrengths:{[id:number]:number;} = {}
    private harmonics:number[] = [50, 100, 200, 60, 120, 240]
    private samplesProcessed: number = 0;
    private totalSamples: number = 0;
    private preScanProgressEvent: ENFEventBase<[PreScanUpdate, number]>;

    constructor(context: GoertzelFilterStore, preScanProgressEvent: ENFEventBase<[PreScanUpdate, number]>, totalSamples: number) {
        this.totalSamples = totalSamples;
        this.preScanProgressEvent = preScanProgressEvent;
        this.context = context
        this.harmonics.forEach(h => {
            this.harmonicStrengths[h] = 0;
        })
        this.bufferedProcessor = new BufferedAudioProcessor<number>(this.context.windowSize, window => {
            const windowedSamples = hann(window,0);
            const goertzelRequestCache = context.createRequestCache(windowedSamples);
            const update:any = {}
            this.harmonics.forEach(h => {
                const harmonicStrength = goertzelRequestCache.analyze(h);
                if (!isNaN(harmonicStrength)) {
                    update['f' + h.toString()] = harmonicStrength;
                    this.harmonicStrengths[h] += harmonicStrength;
                }
            })
            this.samplesProcessed += window.length
            update.endSamples = this.samplesProcessed;
            this.preScanProgressEvent.trigger([update as PreScanUpdate,this.samplesProcessed / this.totalSamples]);
        })
    }

    /**
     * @param input a window of audio of a known size
     */
    process(input: ArrayLike<number>) {
        this.bufferedProcessor.addChunk(Array.from(input))
    }

    /**
     * Called after all the audio windows have been processed to return an aggregated result.
     */
    getResult():{[id:number]:number;} {
        this.bufferedProcessor.flush()
        return this.harmonicStrengths;
    }
}
