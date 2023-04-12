import { ENFEventBase } from "../ENFProcessor/events/ENFEventBase";
import fs from "fs";
import { getAudioData } from "../audioContextUtils/getAudioData";
import { PreScanProcessor } from "./preScanProcessor";
import { PreScanResult } from "./preScanResult";
export class AudioContextPreScanComponent {
    constructor(goertzelFilterCache) {
        this.implementationId = "AudioContextPreScanComponent0.0.1";
        this.preScanProgressEvent = new ENFEventBase();
        this.audioLoadedEvent = new ENFEventBase();
        this.goertzelFilterCache = goertzelFilterCache;
    }
    async preScan(resourceUri) {
        let buffer = fs.readFileSync(resourceUri);
        const [audioData, metaData] = await getAudioData(buffer, resourceUri);
        this.audioLoadedEvent.trigger(audioData);
        const goertzelStore = this.goertzelFilterCache.getStore(metaData.sampleRate, metaData.sampleRate);
        const preScanProcessor = new PreScanProcessor(goertzelStore, this.preScanProgressEvent, audioData.length);
        for (let i = 0; i < audioData.length; i += 67108864) {
            preScanProcessor.process(audioData.slice(i, i + 67108864));
        }
        const firstPassResult = preScanProcessor.getResult();
        return new PreScanResult(firstPassResult, metaData);
    }
}
