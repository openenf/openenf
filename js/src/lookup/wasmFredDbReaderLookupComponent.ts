import {ENFEventBase} from "../ENFProcessor/events/ENFEventBase";
import {LookupResult} from "../model/lookupResult";
import {LookupComponent} from "./lookupComponent";
import {GoertzelFilterStore} from "../goertzel/GoertzelFilterStore";
import {arrayToVectorInt16_t, vectorToArray} from "./FreqDbWasmHelpers";

export class WasmFreqDbReaderLookupComponent implements LookupComponent {
    private wasmModulePath: string;
    private module: any;
    private readers: { [id: string]: any; } = {};

    constructor(wasmModulePath: string) {
        this.wasmModulePath = wasmModulePath;
    }

    readonly implementationId: string = "WasmFreqDbReaderLookupComponent0.0.1"
    lookupProgressEvent: ENFEventBase<number> = new ENFEventBase<number>();
    private wasmModuleLoaded: Boolean = false;

    async lookup(freqs: (number | null)[], gridIds: string[], from?: Date, to?: Date): Promise<LookupResult[]> {
        let lookupResults:LookupResult[] = [];
        const lookupVector = arrayToVectorInt16_t(this.module.default, freqs)
        gridIds.forEach(gridId => {
            if (this.readers[gridId]) {
                const metaData = this.readers[gridId].freqDbMetaData;
                const resultVector = this.readers[gridId].lookup(lookupVector, 1000, 0, metaData.endDate - metaData.startDate, 8);
                const results = vectorToArray(resultVector, ["score", "position"]);
                results.forEach(r => {
                    r.gridId = gridId;
                })
                lookupResults = [...lookupResults, ...results]
            }
        })
        return lookupResults;
    }

    async loadDb(dbPath: string) {
        if (!this.wasmModuleLoaded) {
            await this.loadWasmModule();
        }
        const freqDbReader = new this.module.default.FsFreqDbReader(dbPath);
        const gridId = freqDbReader.freqDbMetaData.gridId;
        this.readers[gridId] = freqDbReader;
    }

    private async loadWasmModule():Promise<void> {
        return new Promise(async resolve => {
            this.module = await import(this.wasmModulePath);
            setInterval(() => {
                if (this.module.default && this.module.default.FsFreqDbReader) {
                    resolve();
                }
            },10)
        })
    }
}
