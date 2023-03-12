import {FrequencyRequestCache} from "./FrequencyRequestCache";
import {GoertzelFilter} from "./GoertzelFilter";

export class GoertzelFilterStore {
    readonly sampleRate: number;
    readonly windowSize: number;
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

    goertzelFilters: { [id: string] : GoertzelFilter; }= {};

    createRequestCache(samples:number[]) {
        return new FrequencyRequestCache(this,samples)
    }
}

