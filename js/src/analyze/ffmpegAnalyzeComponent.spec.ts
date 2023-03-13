import {FfmpegAnalyzeComponent} from "./ffmpegAnalyzeComponent";
import {GoertzelFilterCache} from "../goertzel/GoertzelFilterCache";
import {PreScanResult} from "../model/preScanResult";

describe('ffmpegAnalyzeComponent', () => {
    it('can extract frequency data from synthesized saw wave', async () => {
        const filepath = "test/testAudio/DiscreteFrom60HzInHundredths10secs.wav";
        const goertzelFilterCache = new GoertzelFilterCache();
        const analyzeComponent = new FfmpegAnalyzeComponent(goertzelFilterCache,1);
        const preScanResult:PreScanResult = {
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
});
