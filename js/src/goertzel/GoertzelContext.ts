import {GoertzelFilterStore} from "./GoertzelFilterStore";

export class GoertzelContext {
    private goertzelStores: { [id: string]: GoertzelFilterStore; } = {};

    getStore(sampleRate: number, chunkSize: number): GoertzelFilterStore {
        const key = `${sampleRate}|${chunkSize}`;
        if (this.goertzelStores[key]) {
            return this.goertzelStores[key];
        }
        this.goertzelStores[key] = new GoertzelFilterStore(sampleRate, chunkSize);
        return this.goertzelStores[key];
    }
}
