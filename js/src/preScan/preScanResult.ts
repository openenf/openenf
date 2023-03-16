import {PreScanResultLike} from "../model/preScanResultLike";
import {AudioFileMetadata} from "./audioFileMetadata";
export class PreScanResult implements PreScanResultLike {
    constructor(preScanProcessorResult: { [id: number]: number; }, metaData: AudioFileMetadata) {
        this.duration = metaData.duration;
        this.durationSamples = metaData.durationSamples;
        this.h100 = preScanProcessorResult[100];
        this.h120 = preScanProcessorResult[120];
        this.h200 = preScanProcessorResult[200];
        this.h240 = preScanProcessorResult[240];
        this.h50 = preScanProcessorResult[50];
        this.h60 = preScanProcessorResult[60];
        this.numChannels = metaData.channels;
        this.sampleRate = metaData.sampleRate;
    }

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
