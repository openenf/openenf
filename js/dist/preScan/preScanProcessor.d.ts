import { GoertzelFilterStore } from "../goertzel/GoertzelFilterStore";
import { ENFEventBase } from "../ENFProcessor/events/ENFEventBase";
import { PreScanUpdate } from "../model/preScanUpdate";
/**
 * This processor uses a regular (non-adaptive) Goertzel filter to determine the signal strengths at 50, 100, 200, 60, 120 and 240hz
 * It combines a {@link BufferedAudioProcessor} and a {@link GoertzelFilterStore} to calculate the harmonics for each audio of window
 * of the size defined in the GoertzelFilterStore.
 */
export declare class PreScanProcessor {
    private context;
    private bufferedProcessor;
    private harmonicStrengths;
    private harmonics;
    private samplesProcessed;
    private totalSamples;
    private preScanProgressEvent;
    constructor(context: GoertzelFilterStore, preScanProgressEvent: ENFEventBase<[PreScanUpdate, number]>, totalSamples: number);
    /**
     * @param input a window of audio of a known size
     */
    process(input: ArrayLike<number>): void;
    /**
     * Called after all the audio windows have been processed to return an aggregated result.
     */
    getResult(): {
        [id: number]: number;
    };
}
