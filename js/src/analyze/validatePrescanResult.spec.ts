import {PreScanResult} from "../model/preScanResult";
import {validatePreScanResult} from "./validatePrescanResult";

describe('validatePreScanResult', () => {
    it('result with a single sin wave at 50 to return result [50]', () => {
        const preScanResult:PreScanResult = {
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
        }
        const result = validatePreScanResult(preScanResult);
        expect(result).toStrictEqual([50])
    })
})
