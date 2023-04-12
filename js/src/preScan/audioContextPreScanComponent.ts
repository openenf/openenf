import {ENFEventBase} from "../ENFProcessor/events/ENFEventBase";
import {PreScanUpdate} from "../model/preScanUpdate";
import {PreScanResultLike} from "../model/preScanResultLike";
import {PreScanComponent} from "./preScanComponent";
import {GoertzelFilterCache} from "../goertzel/GoertzelFilterCache";
import fs from "fs";
import {getAudioData} from "../audioContextUtils/getAudioData";
import {PreScanProcessor} from "./preScanProcessor";
import {PreScanResult} from "./preScanResult";

export class AudioContextPreScanComponent implements PreScanComponent {
    readonly implementationId: string = "AudioContextPreScanComponent0.0.1"
    preScanProgressEvent: ENFEventBase<[PreScanUpdate, number]> = new ENFEventBase<[PreScanUpdate, number]>()
    audioLoadedEvent: ENFEventBase<ArrayLike<number>> = new ENFEventBase<ArrayLike<number>>();
    private goertzelFilterCache: GoertzelFilterCache;
    constructor(goertzelFilterCache: GoertzelFilterCache) {
        this.goertzelFilterCache = goertzelFilterCache;
    }

    async preScan(resourceUri: string): Promise<PreScanResultLike> {
        let buffer = fs.readFileSync(resourceUri);
        const [audioData,metaData] = await getAudioData(buffer, resourceUri);
        this.audioLoadedEvent.trigger(audioData);
        const goertzelStore = this.goertzelFilterCache.getStore(metaData.sampleRate, metaData.sampleRate);
        const preScanProcessor = new PreScanProcessor(goertzelStore, this.preScanProgressEvent, audioData.length);
        for (let i = 0; i < audioData.length; i += 67108864) {
            preScanProcessor.process(audioData.slice(i, i+67108864));
        }
        const firstPassResult = preScanProcessor.getResult();
        return new PreScanResult(firstPassResult,metaData);
    }
}

