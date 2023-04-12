import { ENFEventBase } from "../ENFProcessor/events/ENFEventBase";
import { getMetaDataFFMpeg } from "../ffmpegUtils/getMetaDataFFMpeg";
import { PreScanProcessor } from "./preScanProcessor";
import { streamAudioFile } from "../ffmpegUtils/streamAudioFile";
import { PreScanResult } from "./preScanResult";
/**
 * This implements {@link PreScanComponent} using {@link https://www.npmjs.com/package/fluent-ffmpeg}. It therefore requires
 * {@link http://www.ffmpeg.org/} to be installed on the executing machine. Going forward we may migrate to
 * {@link https://github.com/ffmpegwasm/ffmpeg.wasm} to remove the requirement for native FFMpeg.
 */
export class FfmpegPreScanComponent {
    constructor(goertzelFilterCache) {
        this.implementationId = "WasmFfmpegPreScanComponent.0.0.1";
        this.preScanProgressEvent = new ENFEventBase();
        this.goertzelFilterCache = goertzelFilterCache;
    }
    async preScan(resourceUri) {
        const metaData = await getMetaDataFFMpeg(resourceUri);
        const goertzelStore = this.goertzelFilterCache.getStore(metaData.sampleRate, metaData.sampleRate);
        const preScanProcessor = new PreScanProcessor(goertzelStore, this.preScanProgressEvent, metaData.durationSamples);
        await streamAudioFile(resourceUri, metaData.channels, (chunk) => {
            preScanProcessor.process(chunk);
        });
        const firstPassResult = preScanProcessor.getResult();
        return new PreScanResult(firstPassResult, metaData);
    }
}
