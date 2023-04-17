import {expose} from "threads";
import {PreScanResultLike} from "../model/preScanResultLike";
import fs from "fs";
import {getAudioData} from "../audioContextUtils/getAudioData";
import {GoertzelAnalyzeProcessor} from "./goertzelAnalyzeProcessor";
import {GoertzelFilterCache} from "../goertzel/GoertzelFilterCache";
import {ENFEventBase} from "../ENFProcessor/events/ENFEventBase";
import {AnalysisWindowResult} from "../model/analysisWindowResult";

expose({
    async analyze(resourceUri, preScanResult, threadBounds, targetFrequency, overlapFactor) {
        let buffer = fs.readFileSync(resourceUri);
        const [audioData] = (await getAudioData(buffer, resourceUri))
        const audioSlice = audioData.slice(threadBounds[0],threadBounds[1]);
        const goertzelFilterCache = new GoertzelFilterCache();
        const goertzelStore = goertzelFilterCache.getStore(preScanResult.sampleRate, preScanResult.sampleRate);
        const analyzeProcessor = new GoertzelAnalyzeProcessor(goertzelStore, 
            targetFrequency, 
            overlapFactor, 
            new ENFEventBase<[AnalysisWindowResult, number]>(),audioSlice.length);
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
        return result;
        //console.log('result', JSON.stringify(result));
    }
})
