import { GoertzelFilterStore } from "./GoertzelFilterStore";
/**
 * A {@link GoertzelFilter} is created for a given sample rate and chunk size. The {@GoertzelFilterCache}
 * caches a set of {@link GoertzelFilterStore}s, one for each sample rate and chunk size.
 */
export class GoertzelFilterCache {
    constructor() {
        this.goertzelStores = {};
    }
    /**
     * Retrieves a {@link GoertzelFilterStore} for the specified sample rate and chunk size. If the store does not exist, it is created.
     * @param sampleRate typically 44100 or 48000
     * @param chunkSize at the time of writing (March 2023) the chunkSize is 1 second long, so typically 44100 or 48000 but this may be
     * subject to change as we gather more data and adjust the chunk size to get more accurate frequency analysis results
     */
    getStore(sampleRate, chunkSize) {
        const key = `${sampleRate}|${chunkSize}`;
        if (this.goertzelStores[key]) {
            return this.goertzelStores[key];
        }
        this.goertzelStores[key] = new GoertzelFilterStore(sampleRate, chunkSize);
        return this.goertzelStores[key];
    }
}
