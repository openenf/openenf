import {PreScanComponent} from "./preScanComponent";
import {ENFEventBase} from "../ENFProcessor/events/ENFEventBase";
import {PreScanUpdate} from "../model/preScanUpdate";
import {PreScanResultLike} from "../model/preScanResultLike";
import {getMetaDataFFMpeg} from "../ffmpegUtils/getMetaDataFFMpeg";
import {GoertzelFilterCache} from "../goertzel/GoertzelFilterCache";
import {PreScanProcessor} from "./preScanProcessor";
import {streamAudioFile} from "../ffmpegUtils/streamAudioFile";
import {PreScanResult} from "./preScanResult";

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

    async preScan(resourceUri: string): Promise<PreScanResultLike> {
        const metaData = await getMetaDataFFMpeg(resourceUri);
        const goertzelStore = this.goertzelFilterCache.getStore(metaData.sampleRate, metaData.sampleRate);
        const preScanProcessor = new PreScanProcessor(goertzelStore, this.preScanProgressEvent, metaData.durationSamples);
        await streamAudioFile(resourceUri, metaData.channels, (chunk) => {
            preScanProcessor.process(chunk);
        })
        const firstPassResult = preScanProcessor.getResult();
        return new PreScanResult(firstPassResult,metaData);
    }
}
