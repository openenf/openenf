import {LookupResult} from "../model/lookupResult";
import {ENFAnalysisResult} from "../model/ENFAnalysisResult";
import {RefineComponent} from "./refineComponent";
import {WasmFreqDbReaderStore} from "../wasmFreqDbReader/wasmFreqDbReaderStore";
import {vectorToArray} from "../wasmFreqDbReader/FreqDbWasmHelpers";
import * as kurtosis from "compute-kurtosis"

export const clusterResults = (results:LookupResult[]):LookupResult[][] => {
    const groupDict = results.reduce((groups: { [id: string]: LookupResult[]; }, item:LookupResult) => {
        const group = (groups[item.gridId] || []);
        group.push(item);
        groups[item.gridId] = group;
        return groups;
    }, {});
    const groups:LookupResult[][] = Object.values(groupDict);
    let allClusters:LookupResult[][] = [];
    groups.forEach(group => {
        const orderedResults:LookupResult[] = group.sort((a,b) => a.position - b.position);
        const clusters:LookupResult[][] = [[]];
        let clusterIndex = 0;
        orderedResults.forEach((x,i) => {
            clusters[clusterIndex].push(x);
            if (i + 1 < orderedResults.length) {
                const x2 = orderedResults[i+1];
                if ((x2.position - x.position) > 1) {
                    clusters.push([]);
                    clusterIndex++;
                }
            }
        })
        allClusters = [...allClusters, ...clusters];
    })
    const orderedClusters = allClusters
        .map(x => x.sort((a,b) => a.score - b.score))
        .sort((a,b) => b[0].score - a[0].score);
    return orderedClusters;
}

export const convertPositionToGridDate = (position: number, gridStartDate: Date): Date => {
    const date = new Date(gridStartDate.getTime() + (position * 1000));
    return date;
}

export class WasmFreqDbReaderRefineComponent implements RefineComponent {
    readonly implementationId: string = "WasmFreqDbReaderRefineComponent0.0.1"
    private readerStore: WasmFreqDbReaderStore;
    private kurtosisFunction: any;

    constructor(readerStore: WasmFreqDbReaderStore) {
        if (typeof kurtosis === 'object') {
            this.kurtosisFunction = kurtosis.default;
        } else {
            this.kurtosisFunction = kurtosis;
        }
        this.readerStore = readerStore;
    }

    async refine(lookupFrequencies: number[], lookupResults: LookupResult[]): Promise<ENFAnalysisResult[]> {
        const nonNullDuration = lookupFrequencies.filter(x => x !== null).length;
        const resultClusters = clusterResults(lookupResults);
        const peaks = resultClusters.map(x => {return {position:x[0].position, gridId:x[0].gridId, score:x[0].score}}).slice(0,50);
        console.log('peaks', peaks);
        await this.readerStore.ready();
        const lookupVector = this.readerStore.arrayToVector(lookupFrequencies);
        const results:ENFAnalysisResult[] = [];
        for (const r of peaks) {
            const reader = await this.readerStore.getReader(r.gridId);
            const startDate = new Date(reader.freqDbMetaData.startDate * 1000);
            console.log('startDate', startDate);
            const position = r.position;
            const vector = reader.comprehensiveLookup(lookupVector, position, 12, 12);
            const comprehensiveResults = vectorToArray(vector, ["score", "position"]);
            const kurtosis = this.kurtosisFunction(comprehensiveResults.map(x => x.score));
            const result:ENFAnalysisResult = {
                gridId: r.gridId,
                kurtosis,
                normalisedScore: r.score / nonNullDuration,
                score: r.score,
                time: convertPositionToGridDate(r.position, startDate)
            }
            results.push(result);
        }
        return Promise.resolve(results);
    }
}
