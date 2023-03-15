import {ENFEventBase} from "../ENFProcessor/events/ENFEventBase";
import {LookupResult} from "../model/lookupResult";
import {LookupComponent} from "./lookupComponent";
import {arrayToVectorInt16_t, vectorToArray} from "../wasmFreqDbReader/FreqDbWasmHelpers";
import {WasmFreqDbReaderStore} from "../wasmFreqDbReader/wasmFreqDbReaderStore";

export class WasmFreqDbReaderLookupComponent implements LookupComponent {
    private readerStore: WasmFreqDbReaderStore;

    constructor(readerStore: WasmFreqDbReaderStore) {
        this.readerStore = readerStore;
    }

    readonly implementationId: string = "WasmFreqDbReaderLookupComponent0.0.1"
    lookupProgressEvent: ENFEventBase<number> = new ENFEventBase<number>();
    private wasmModuleLoaded: Boolean = false;

    async lookup(freqs: (number | null)[], gridIds: string[], from?: Date, to?: Date): Promise<LookupResult[]> {
        let lookupResults:LookupResult[] = [];
        await this.readerStore.ready();
        const lookupVector = this.readerStore.arrayToVector(freqs);
        for (const gridId of gridIds) {
            const reader = await this.readerStore.getReader(gridId);
            const metaData = reader.freqDbMetaData;
            const resultVector = reader.lookup(lookupVector, 1000, 0, metaData.endDate - metaData.startDate, 8);
            const results = vectorToArray(resultVector, ["score", "position"]);
            results.forEach(r => {
                r.gridId = gridId;
            })
            lookupResults = [...lookupResults, ...results]
        }
        return lookupResults;
    }

}