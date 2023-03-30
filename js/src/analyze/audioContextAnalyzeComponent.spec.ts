import {FfmpegAnalyzeComponent} from "./ffmpegAnalyzeComponent";
import {GoertzelFilterCache} from "../goertzel/GoertzelFilterCache";
import {PreScanResultLike} from "../model/preScanResultLike";
import {AudioContextAnalyzeComponent} from "./audioContextAnalyzeComponent";

describe('ffmpegAnalyzeComponent', () => {
    it('can extract frequency data from synthesized saw wave', async () => {
        const filepath = "test/testAudio/DiscreteFrom60HzInHundredths10secs.wav";
        const goertzelFilterCache = new GoertzelFilterCache();
        const analyzeComponent = new AudioContextAnalyzeComponent(goertzelFilterCache, 1);
        const preScanResult: PreScanResultLike = {
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
        expect(freqs).toStrictEqual([59.95, 59.96, 59.97, 59.98, 59.99, 60, 60.01, 60.02, 60.03, 60.04]);
    }, 10000000);
    it('fires progress event', async () => {
        const filepath = "test/testAudio/DiscreteFrom60HzInHundredths10secs.wav";
        const goertzelFilterCache = new GoertzelFilterCache();
        const analyzeComponent = new AudioContextAnalyzeComponent(goertzelFilterCache, 16);
        const preScanResult: PreScanResultLike = {
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
        let progress = 0;
        let progressFiredCount = 0;
        analyzeComponent.analyzeProgressEvent.addHandler(e => {
            progressFiredCount++;
            if (e) {
                progress = e[1];
            }
        })
        await analyzeComponent.analyze(filepath, preScanResult);
        expect(progressFiredCount).toBe(145);
        expect(progress).toBeCloseTo(1);
    }, 10000000);
    it('can extract frequency data from synthesised Jan 2014 Grid Data', async () => {
        const filepath = "test/testAudio/GBJan2014LookupTest.wav";
        const goertzelFilterCache = new GoertzelFilterCache();
        const analyzeComponent = new AudioContextAnalyzeComponent(goertzelFilterCache, 1);
        const preScanResult: PreScanResultLike = {
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
        const expectedFreqs = [
            49.993,
            49.994,
            49.998,
            49.998,
            50.001,
            50.002,
            50.005,
            50.001,
            50.001,
            50.003,
            50.004,
            50.004,
            50.005,
            50.005,
            50.006,
            50.004,
            50.002,
            50.001,
            49.996,
            49.995,
            49.991,
            49.989,
            49.986,
            49.987,
            49.985,
            49.985,
            49.981,
            49.975,
            49.974,
            49.969,
            49.965,
            49.962,
            49.961,
            49.961,
            49.962,
            49.96,
            49.96,
            49.962,
            49.963,
            49.962,
            49.962,
            49.96,
            49.959,
            49.959,
            49.956,
            49.954,
            49.954,
            49.956,
            49.953,
            49.954,
            49.952,
            49.951,
            49.952,
            49.952,
            49.952,
            49.954,
            49.955,
            49.953,
            49.953,
            49.951,
            49.951,
            49.95,
            49.95,
            49.948,
            49.947,
            49.949,
            49.947,
            49.949,
            49.951,
            49.954,
            49.954,
            49.956,
            49.956,
            49.958,
            49.961,
            49.96,
            49.961,
            49.963,
            49.961,
            49.964,
            49.964,
            49.963,
            49.964,
            49.963,
            49.964,
            49.963,
            49.963,
            49.964,
            49.967,
            49.969,
            49.971,
            49.971,
            49.972,
            49.974,
            49.975,
            49.977,
            49.977,
            49.978,
            49.978]
        let diff = 0;
        for (let i = 0; i < freqs.length; i++) {
            diff += Math.abs(expectedFreqs[i] - freqs[i])
        }
        expect(diff).toBe(0);
    }, 10000000);
});
