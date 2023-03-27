import {ENFEventBase} from "../ENFProcessor/events/ENFEventBase";
import {LookupResult} from "../model/lookupResult";
import {LookupComponent} from "./lookupComponent";
import {arrayToVectorInt16_t, vectorToArray} from "../wasmFreqDbReader/FreqDbWasmHelpers";
import {WasmFreqDbReaderStore} from "../wasmFreqDbReader/wasmFreqDbReaderStore";
import {getFrequencyBase} from "./getFrequencyBase";

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
        const frequencyBase = getFrequencyBase(freqs);
        const normalisedFreqs = freqs.map(x => x === null ? null : parseFloat(((x - frequencyBase) * 1000).toFixed(3)));
        await this.readerStore.ready();
        for (const gridId of gridIds) {
            const reader = await this.readerStore.getReader(gridId);
            const metaData = reader.freqDbMetaData;
            if (metaData.baseFrequency == frequencyBase) {
                const results:any[] = reader.lookup(normalisedFreqs, 1000, 0, metaData.endDate - metaData.startDate);
                results.forEach(r => {
                    r.gridId = gridId;
                })
                lookupResults = [...lookupResults, ...results]
            }
        }
        return lookupResults;
    }

}
