import {AnalyzeComponent} from "./analyzeComponent";
import {ENFEventBase} from "../ENFProcessor/events/ENFEventBase";
import {AnalysisWindowResult} from "../model/analysisWindowResult";
import {PreScanResultLike} from "../model/preScanResultLike";
import {OverlapFactor} from "../bufferedAudioProcessor/bufferedAudioProcessor";
import {GoertzelFilterCache} from "../goertzel/GoertzelFilterCache";
import {validatePreScanResult} from "./validatePrescanResult";
import os from "os";
import {spawn, Worker} from "threads";

export const sliceAudioDataForThreads = (audioDataLength:number, numThreads:number, windowSize:number, overlapFactor:number):number[][] => {
    const windows = [];
    for(let i = 0; i < audioDataLength; i+= (windowSize / overlapFactor)) {
        const window = [Math.floor(i), Math.floor(i) + windowSize];
        if (window[1] > audioDataLength) {
            break;
        }
        windows.push(window);
    }
    const chunks = [];
    const chunkSize = Math.ceil(windows.length / numThreads);
    for(let i = 0; i < windows.length; i += chunkSize) {
        const chunk = windows.slice(i, i + chunkSize);
        chunks.push(chunk);
    }
    const results:any[] = [];
    chunks.forEach(c => {
        const start = c[0][0];
        const end = c[c.length - 1][1];
        results.push([start,end])
    })
    console.log('results', JSON.stringify(results));
    return results;
}

export class ThreadedAudioContextAnalyzeComponent implements AnalyzeComponent {
    analyzeProgressEvent: ENFEventBase<[AnalysisWindowResult, number]> = new ENFEventBase<[AnalysisWindowResult, number]>()
    readonly implementationId: string = "AudioContextAnalyzeComponent0.0.1";
    private numThreads: number;

    async analyze(resourceUri: (string | Float32Array), preScanResult: PreScanResultLike, expectedFrequency?: 50 | 60): Promise<AnalysisWindowResult[]> {
        const numThreads = this.numThreads;
        const targetFrequencies = validatePreScanResult(preScanResult, expectedFrequency);
        const slices = sliceAudioDataForThreads(preScanResult.durationSamples,numThreads,preScanResult.sampleRate,this.overlapFactor);
        const workers = [];
        const promises = [];
        for(let i = 0; i < slices.length; i++) {
            const worker = await spawn(new Worker('analyzeWorker.ts'));
            workers.push(worker);
            const promise = new Promise(resolve => {
                resolve(worker.analyze(resourceUri,preScanResult,slices[i],targetFrequencies[0],this.overlapFactor));
            })
            promises.push(promise);
        }
        const results:any[] = await Promise.all(promises);
        let result:any[] = [].concat(...results);
        result = result.sort((a,b) => a.start > b.start ? 1 : -1);
        return result;
    }

    private overlapFactor: OverlapFactor;
    private goertzelFilterCache: GoertzelFilterCache;
    constructor(goertzelFilterCache: GoertzelFilterCache, overlapFactor:OverlapFactor) {
        this.goertzelFilterCache = goertzelFilterCache;
        this.overlapFactor = overlapFactor;
        this.numThreads = os.cpus().length;
    }
}
