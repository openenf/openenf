import { Observable } from "observable-fns"
import {expose} from "threads";
import fs from "fs";
import {getAudioData} from "../audioContextUtils/getAudioData";
import {GoertzelAnalyzeProcessor} from "./goertzelAnalyzeProcessor";
import {GoertzelFilterCache} from "../goertzel/GoertzelFilterCache";
import {ENFEventBase} from "../ENFProcessor/events/ENFEventBase";
import {AnalysisWindowResult} from "../model/analysisWindowResult";
import {PreScanResult} from "../preScan/preScanResult";
import {OverlapFactor} from "../bufferedAudioProcessor/bufferedAudioProcessor";

const analyze = (resourceUri:string, preScanResult:PreScanResult, threadBounds:number[], targetFrequency:number, overlapFactor:OverlapFactor) => {
    return new Observable(  (observer:any) => {
        let buffer = fs.readFileSync(resourceUri);
        getAudioData(buffer, resourceUri).then((audioDataResult:any) => {
            const audioData = audioDataResult[0];
            const audioSlice = audioData.slice(threadBounds[0],threadBounds[1]);
            const goertzelFilterCache = new GoertzelFilterCache();
            const goertzelStore = goertzelFilterCache.getStore(preScanResult.sampleRate, preScanResult.sampleRate);
            const event = new ENFEventBase<[AnalysisWindowResult, number]>();
            event.addHandler((r:any) => {
                observer.next(r);
            })
            const analyzeProcessor = new GoertzelAnalyzeProcessor(goertzelStore,
                targetFrequency,
                overlapFactor,
                event,audioSlice.length);
            for (let i = 0; i < audioSlice.length; i += 67108864) {
                const slice = audioSlice.slice(i, i+67108864);
                analyzeProcessor.process(slice);
            }
            const result = analyzeProcessor.getResult();
            const offset = threadBounds[0];
            const offsetSecs = offset / preScanResult.sampleRate;
            result.forEach(r => {
                r.start = r.start + offsetSecs;
                r.end = r.end + offsetSecs;
                r.startSamples = r.startSamples + offset;
                r.endSamples = r.endSamples + offset;
            })
            observer.next(result);
            observer.complete();
        })
    });
}

expose(analyze)
