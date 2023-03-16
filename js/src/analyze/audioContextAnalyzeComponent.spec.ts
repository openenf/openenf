import {FfmpegAnalyzeComponent} from "./ffmpegAnalyzeComponent";
import {GoertzelFilterCache} from "../goertzel/GoertzelFilterCache";
import {PreScanResultLike} from "../model/preScanResultLike";
import {AudioContextAnalyzeComponent} from "./audioContextAnalyzeComponent";

describe('ffmpegAnalyzeComponent', () => {
    it('can extract frequency data from synthesized saw wave', async () => {
        const filepath = "test/testAudio/DiscreteFrom60HzInHundredths10secs.wav";
        const goertzelFilterCache = new GoertzelFilterCache();
        const analyzeComponent = new AudioContextAnalyzeComponent(goertzelFilterCache,1);
        const preScanResult:PreScanResultLike = {
            duration: 10,
            durationSamples: 441000,
            h100: 1.3417947193384223e-12,
            h120: 0.04060122664313061,
            h200: 9.405575877386733e-13,
            h240: 0.0025019961723272755,
            h50: 6.259192354150242e-10,
            h60: 0.6519007338003687,
            numChannels: 2,
            sampleRate: 44100
        };
        const result = await analyzeComponent.analyze(filepath, preScanResult);
        const freqs = result.map(x => parseFloat(x.data[0].hz.toFixed(3)));
        expect(freqs).toStrictEqual([59.95,59.96,59.97,59.98,59.99,60,60.01,60.02,60.03,60.04]);
    }, 10000000);
    it('can extract frequency data from synthesised Jan 2014 Grid Data', async () => {
        const filepath = "test/testAudio/GBJan2014LookupTest.wav";
        const goertzelFilterCache = new GoertzelFilterCache();
        const analyzeComponent = new AudioContextAnalyzeComponent(goertzelFilterCache,1);
        const preScanResult:PreScanResultLike = {
            duration: 99,
            durationSamples: 4365900,
            h100: 0.21563732187151344,
            h120: 1.7576097962680867e-10,
            h200: 0.006539216741531233,
            h240: 1.6421555567304521e-9,
            h50: 5.100503313236608,
            h60: 3.066072612370719e-7,
            numChannels: 2,
            sampleRate: 44100
        };
        const result = await analyzeComponent.analyze(filepath, preScanResult);
        const freqs = result.map(x => parseFloat(x.data[0].hz.toFixed(3)));
        const expectedFreqs = [49.93, 49.94, 49.98, 49.98, 50.01, 50.02, 50.05, 50.01, 50.01, 50.03, 50.04, 50.04, 50.05, 50.05, 50.06, 50.04, 50.02, 50.01, 49.96, 49.95, 49.91, 49.89, 49.86, 49.87, 49.85, 49.85, 49.81, 49.75, 49.74, 49.69, 49.65, 49.62, 49.61, 49.61, 49.62,  49.6,  49.6, 49.62, 49.63, 49.62, 49.62,  49.6, 49.59, 49.59, 49.56, 49.54, 49.54, 49.56, 49.53, 49.54, 49.52, 49.51, 49.52, 49.52, 49.52, 49.54, 49.55, 49.53, 49.53, 49.51, 49.51,  49.5,  49.5, 49.48, 49.47, 49.49, 49.47, 49.49, 49.51, 49.54, 49.54, 49.56, 49.56, 49.58, 49.61,  49.6, 49.61, 49.63, 49.61, 49.64, 49.64, 49.63, 49.64, 49.63, 49.64, 49.63, 49.63, 49.64, 49.67, 49.69, 49.71, 49.71, 49.72, 49.74, 49.75, 49.77, 49.77, 49.78, 49.78];
        let diff = 0;
        for(let i = 0; i < freqs.length; i++) {
            diff += Math.abs(expectedFreqs[i] - freqs[i])
        }
        expect(diff).toBe(0);
    }, 10000000);
});
