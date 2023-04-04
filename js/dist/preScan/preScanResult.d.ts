import { PreScanResultLike } from "../model/preScanResultLike";
import { AudioFileMetadata } from "./audioFileMetadata";
export declare class PreScanResult implements PreScanResultLike {
    constructor(preScanProcessorResult: {
        [id: number]: number;
    }, metaData: AudioFileMetadata);
    duration: number | undefined;
    durationSamples: number;
    h100: number;
    h120: number;
    h200: number;
    h240: number;
    h50: number;
    h60: number;
    numChannels: number;
    sampleRate: number;
}
