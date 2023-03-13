import {FrequencyRequestCache} from "./FrequencyRequestCache";
import {GoertzelFilter} from "./GoertzelFilter";

/**
 * {@link GoertzelFilter}s are computationally expensive to create, and relate to a specific sample rate and chunk size.
 * We store the {@link GoertzelFilter}s here so that can be reused on multiple different chunks of audio across multiple files
 */
export class GoertzelFilterStore {
    readonly sampleRate: number;
    readonly windowSize: number;

    /**
     *
     * @param sampleRate the sample rate for this set of filters
     * @param chunkSize the chunk size for this set of filters
     */
    constructor(sampleRate:number, chunkSize:number) {
        if (!sampleRate) {
            throw new Error(`Expecting sampleRate to be defined but got '${sampleRate}'`)
        }
        if (!chunkSize) {
            throw new Error(`Expecting chunkSize to be defined but got '${chunkSize}'`)
        }
        this.sampleRate = sampleRate;
        this.windowSize = chunkSize;
    }

    /**
     * The stored goertzel filters, keyed by frequency. The numeric frequency is rounded to 3 decimal places and stored as a string.
     * Typical keys would be "50.000", "59.555", etc
     */
    goertzelFilters: { [id: string] : GoertzelFilter; }= {};

    /**
     * As well as caching the filters were also cache the requests made to the filters for a specific window of audio. The request caches are created
     * here:
     * @param samples The window of audio to which the {@link FrequencyRequestCache} relates.
     */
    createRequestCache(samples:number[]) {
        return new FrequencyRequestCache(this,samples)
    }
}

