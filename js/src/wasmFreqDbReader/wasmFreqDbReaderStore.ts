import {arrayToVectorInt16_t} from "./FreqDbWasmHelpers";

export class WasmFreqDbReaderStore {
    private storeLocations: { [gridId: string]: string };
    private readers:{[gridId:string]:any}= {};
    private module: any;
    private wasmModulePath: string;
    private wasmModuleLoaded: Boolean = false;
    constructor(wasmModulePath:string, storeLocations?:{[gridId:string]:string;}) {
        this.wasmModulePath = wasmModulePath;
        this.storeLocations = storeLocations || {};
    }

    addPath(gridId:string, path:string) {
        this.storeLocations[gridId] = path;
    }

    async ready() {
        await this.loadWasmModule();
    }

    async getReader(gridId:string):Promise<any> {
        if (this.readers[gridId]) {
            return this.readers[gridId];
        }
        if (!this.wasmModuleLoaded) {
            await this.loadWasmModule();
        }
        if (!this.storeLocations[gridId]) {
            throw new Error(`Don't know file path for grid ID ${gridId}. If you know the path you can supply it in the constructor or run addPath() before calling this function.`)
        }
        const dbPath = this.storeLocations[gridId]
        const freqDbReader = new this.module.default.FsFreqDbReader(dbPath);
        this.readers[gridId] = freqDbReader;
        return freqDbReader;
    }

    private async loadWasmModule():Promise<void> {
        return new Promise(async resolve => {
            this.module = await import(this.wasmModulePath);
            setInterval(() => {
                if (this.module.default && this.module.default.FsFreqDbReader) {
                    this.wasmModuleLoaded = true;
                    resolve();
                }
            },10)
        })
    }

    arrayToVector(freqs: (number | null)[]) {
        return arrayToVectorInt16_t(this.module.default, freqs);
    }
}
