import {LookupResult} from "../model/lookupResult";
import {ENFAnalysisResult} from "../model/ENFAnalysisResult";
import {RefineComponent} from "./refineComponent";
import {WasmFreqDbReaderStore} from "../wasmFreqDbReader/wasmFreqDbReaderStore";
import * as kurtosis from "compute-kurtosis"
import {clusterResults, computeKurtosis, convertPositionToGridDate, getPeaks} from "./refineComponentUtils";

export class WasmFreqDbReaderRefineComponent implements RefineComponent {
    readonly implementationId: string = "WasmFreqDbReaderRefineComponent0.0.1"
    private readerStore: WasmFreqDbReaderStore;

    constructor(readerStore: WasmFreqDbReaderStore) {
        this.readerStore = readerStore;
    }

    async refine(lookupFrequencies: number[], lookupResults: LookupResult[]): Promise<ENFAnalysisResult[]> {
        const nonNullDuration = lookupFrequencies.filter(x => x !== null).length;
        const peaks = getPeaks(lookupResults);
        await this.readerStore.ready();
        const results:ENFAnalysisResult[] = [];
        for (const r of peaks) {
            const reader = await this.readerStore.getReader(r.gridId);
            const startDate = new Date(reader.freqDbMetaData.startDate * 1000);
            const position = r.position;
            const comprehensiveResults = reader.comprehensiveLookup(lookupFrequencies, position, 12, 12);
            const kurtosis =  computeKurtosis(comprehensiveResults.map(x => x.score));
            const result:ENFAnalysisResult = {
                gridId: r.gridId,
                kurtosis,
                normalisedScore: r.score / (nonNullDuration * 1.0),
                score: r.score,
                time: convertPositionToGridDate(r.position, startDate)
            }
            results.push(result);
        }
        return Promise.resolve(results.sort((a,b) => a.score - b.score));
    }
}
