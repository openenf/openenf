"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validatePrescanResult_1 = require("./validatePrescanResult");
describe('validatePreScanResult', () => {
    it('result with a single sin wave at 50 to return result [50]', () => {
        const preScanResult = {
            duration: 1,
            durationSamples: 44100,
            h100: 0,
            h120: 0,
            h200: 0,
            h240: 0,
            h50: 1,
            h60: 0.001,
            numChannels: 0,
            sampleRate: 0
        };
        const result = (0, validatePrescanResult_1.validatePreScanResult)(preScanResult);
        expect(result).toStrictEqual([50]);
    });
});
