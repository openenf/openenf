import { PreScanComponent } from "./preScanComponent";
import { ENFEventBase } from "../ENFProcessor/events/ENFEventBase";
import { PreScanUpdate } from "../model/preScanUpdate";
import { PreScanResultLike } from "../model/preScanResultLike";
import { GoertzelFilterCache } from "../goertzel/GoertzelFilterCache";
/**
 * This implements {@link PreScanComponent} using {@link https://www.npmjs.com/package/fluent-ffmpeg}. It therefore requires
 * {@link http://www.ffmpeg.org/} to be installed on the executing machine. Going forward we may migrate to
 * {@link https://github.com/ffmpegwasm/ffmpeg.wasm} to remove the requirement for native FFMpeg.
 */
export declare class FfmpegPreScanComponent implements PreScanComponent {
    private goertzelFilterCache;
    constructor(goertzelFilterCache: GoertzelFilterCache);
    readonly implementationId: string;
    preScanProgressEvent: ENFEventBase<[PreScanUpdate, number]>;
    preScan(resourceUri: string): Promise<PreScanResultLike>;
}
