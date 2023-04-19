"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreScanResult = void 0;
class PreScanResult {
    constructor(preScanProcessorResult, metaData) {
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
}
exports.PreScanResult = PreScanResult;
