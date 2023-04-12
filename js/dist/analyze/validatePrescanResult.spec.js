import { validatePreScanResult } from "./validatePrescanResult";
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
        const result = validatePreScanResult(preScanResult);
        expect(result).toStrictEqual([50]);
    });
    it('returns 100 target for dominate 100HZ result', () => {
        const preScanResult = {
            duration: 256.40290249433104,
            durationSamples: 11307368,
            h100: 0.05514567991874277,
            h120: 0.0004897763528248434,
            h200: 0.00021586038986000033,
            h240: 0.00017863239783691908,
            h50: 0.00042946929630745365,
            h60: 0.0007291119766316747,
            numChannels: 2,
            sampleRate: 44100
        };
        const result = validatePreScanResult(preScanResult);
        expect(result).toStrictEqual([100]);
    });
});
