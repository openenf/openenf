"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FfmpegPreScanComponent = void 0;
const ENFEventBase_1 = require("../ENFProcessor/events/ENFEventBase");
const getMetaDataFFMpeg_1 = require("../ffmpegUtils/getMetaDataFFMpeg");
const preScanProcessor_1 = require("./preScanProcessor");
const streamAudioFile_1 = require("../ffmpegUtils/streamAudioFile");
const preScanResult_1 = require("./preScanResult");
/**
 * This implements {@link PreScanComponent} using {@link https://www.npmjs.com/package/fluent-ffmpeg}. It therefore requires
 * {@link http://www.ffmpeg.org/} to be installed on the executing machine. Going forward we may migrate to
 * {@link https://github.com/ffmpegwasm/ffmpeg.wasm} to remove the requirement for native FFMpeg.
 */
class FfmpegPreScanComponent {
    constructor(goertzelFilterCache) {
        this.implementationId = "WasmFfmpegPreScanComponent.0.0.1";
        this.preScanProgressEvent = new ENFEventBase_1.ENFEventBase();
        this.goertzelFilterCache = goertzelFilterCache;
    }
    async preScan(resourceUri) {
        const metaData = await (0, getMetaDataFFMpeg_1.getMetaDataFFMpeg)(resourceUri);
        const goertzelStore = this.goertzelFilterCache.getStore(metaData.sampleRate, metaData.sampleRate);
        const preScanProcessor = new preScanProcessor_1.PreScanProcessor(goertzelStore, this.preScanProgressEvent, metaData.durationSamples);
        await (0, streamAudioFile_1.streamAudioFile)(resourceUri, metaData.channels, (chunk) => {
            preScanProcessor.process(chunk);
        });
        const firstPassResult = preScanProcessor.getResult();
        return new preScanResult_1.PreScanResult(firstPassResult, metaData);
    }
}
exports.FfmpegPreScanComponent = FfmpegPreScanComponent;
