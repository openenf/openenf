import {arrayToVectorInt16_t, waitForWasmRuntime} from "./FreqDbWasmHelpers";
import fs from 'fs';
import * as path from "path";
import {FsFreqDbReader} from "./fsFreqDbReader";

export class WasmFreqDbReaderStore {
    private readonly storeLocations: { [gridId: string]: string };
    private readers:{[gridId:string]:FsFreqDbReader}= {};
    private module: any;
    private wasmModulePath: string;
    private wasmModuleLoaded: Boolean = false;
    constructor(wasmModulePath:string, storeLocations?:{[gridId:string]:string;}) {
        const absolutePath = path.resolve(wasmModulePath);
        if (!fs.existsSync(absolutePath)) {
            throw new Error(`File '${absolutePath}' not found`);
        }
        this.wasmModulePath = absolutePath;
        this.storeLocations = storeLocations || {};
    }

    addPath(gridId:string, path:string) {
        this.storeLocations[gridId] = path;
    }

    async ready() {
        await this.loadWasmModule();
    }

    async getReader(gridId:string):Promise<FsFreqDbReader> {
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
        const freqDbReader = new FsFreqDbReader(this.module, dbPath);
        this.readers[gridId] = freqDbReader;
        return freqDbReader;
    }

    private async loadWasmModule():Promise<void> {
        this.module = await import(this.wasmModulePath);
        await waitForWasmRuntime(this.module);
    }
}
