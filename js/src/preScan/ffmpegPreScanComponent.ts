import {PreScanComponent} from "./preScanComponent";
import {ENFEventBase} from "../ENFProcessor/events/ENFEventBase";
import {PreScanUpdate} from "../model/preScanUpdate";
import {PreScanResult} from "../model/preScanResult";
import {getMetaData} from "../ffmpegUtils/getMetaData";
import {GoertzelFilterCache} from "../goertzel/GoertzelFilterCache";
import {PreScanProcessor} from "./preScanProcessor";
import {streamAudioFile} from "../ffmpegUtils/streamAudioFile";

/**
 * This implements {@link PreScanComponent} using {@link https://www.npmjs.com/package/fluent-ffmpeg}. It therefore requires
 * {@link http://www.ffmpeg.org/} to be installed on the executing machine. Going forward we may migrate to
 * {@link https://github.com/ffmpegwasm/ffmpeg.wasm} to remove the requirement for native FFMpeg.
 */
export class FfmpegPreScanComponent implements PreScanComponent {
    private goertzelFilterCache: GoertzelFilterCache;
    constructor(goertzelFilterCache: GoertzelFilterCache) {
        this.goertzelFilterCache = goertzelFilterCache;
    }
    readonly implementationId: string = "WasmFfmpegPreScanComponent.0.0.1";
    preScanProgressEvent: ENFEventBase<[PreScanUpdate, number]> = new ENFEventBase<[PreScanUpdate, number]>();

    async preScan(resourceUri: string): Promise<PreScanResult> {
        const metaData = await getMetaData(resourceUri);
        const goertzelStore = this.goertzelFilterCache.getStore(metaData.sampleRate, metaData.sampleRate);
        const preScanProcessor = new PreScanProcessor(goertzelStore);
        await streamAudioFile(resourceUri, metaData.channels, (chunk) => {
            preScanProcessor.process(chunk);
        })
        const firstPassResult = preScanProcessor.getResult();
        const result:PreScanResult = {
            duration: metaData.duration,
            durationSamples: metaData.durationSamples,
            h100: firstPassResult[100],
            h120: firstPassResult[120],
            h200: firstPassResult[200],
            h240: firstPassResult[240],
            h50: firstPassResult[50],
            h60: firstPassResult[60],
            numChannels: metaData.channels,
            sampleRate: metaData.sampleRate
        }
        return result;
    }
}
