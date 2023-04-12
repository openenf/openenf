import { GoertzelFilterStore } from "./GoertzelFilterStore";
/**
 * Adaptive Goertzel analysis requires that we calculate the strength of different frequencies over a given sample window. These calculations
 * are computationally expensive, so we store the results here to save us having to perform the calculation more the once.
 */
export declare class FrequencyRequestCache {
    private context;
    private readonly samples;
    private readonly requests;
    /**
     * A new FrequencyRequestCache is created for each window of audio
     * @param context creating {@link GoertzelFilter}s  for specific frequencies is also computationally expensive, so we use pass
     * in a {@link GoertzelFilterStore} so we can re-use filters created for previous audio windows.
     * @param samples the audio window relating to this {@link FrequencyRequestCache}
     */
    constructor(context: GoertzelFilterStore, samples: number[]);
    /**
     * Returns the relative frequency strength at the supplied frequency for the audio window passed to the constructor
     * @param hz the frequency to check for
     */
    analyze: (hz: number) => number;
}
