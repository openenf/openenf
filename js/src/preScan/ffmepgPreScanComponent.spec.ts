import {FfmpegPreScanComponent} from "./ffmpegPreScanComponent";
import * as path from "path";
import {GoertzelFilterCache} from "../goertzel/GoertzelFilterCache";

describe('ffmpegPreScanComponent', () => {
    it('can pre-scan local wav file at 50hz', async () => {
        //This is a saw wave with no added noise based on real-world frequency data from the Central European Grid:
        const filepath = "test/testAudio/DE_2013-02-05T174639_saw_9_D_secs_05amp_8Harmonics.wav";
        const absPath = path.resolve(filepath);
        const goertzelContext = new GoertzelFilterCache();
        const preScanComponent = new FfmpegPreScanComponent(goertzelContext);
        const result = await preScanComponent.preScan(absPath);
        expect(result.duration).toBe(9);
        expect(result.durationSamples).toBe(396900);
        expect(result.numChannels).toBe(2);
        expect(result.sampleRate).toBe(44100);
    }, 10000)
    it('can pre-scan local wav file at 60hz', async () => {
        // This is an artificially produced saw wave ranging from 59.95Hz to 60.05Hz
        const filepath = "test/testAudio/DiscreteFrom60HzInHundredths10secs.wav";
        const absPath = path.resolve(filepath);
        const goertzelContext = new GoertzelFilterCache();
        const preScanComponent = new FfmpegPreScanComponent(goertzelContext);
        const result = await preScanComponent.preScan(absPath);
        expect(result.duration).toBe(10);
        expect(result.durationSamples).toBe(441000);
        expect(result.numChannels).toBe(2);
        expect(result.sampleRate).toBe(44100);
    })
    it('can pre-scan local wav file 10 secs pink noise', async () => {
        //Pure pink noise, so we shouldn't expect a discernible signal here:
        const filepath = "test/testAudio/PinkNoise10Sec.wav";
        const absPath = path.resolve(filepath);
        const goertzelContext = new GoertzelFilterCache();
        const preScanComponent = new FfmpegPreScanComponent(goertzelContext);
        const result = await preScanComponent.preScan(absPath);
        expect(result.duration).toBe(10);
        expect(result.durationSamples).toBe(441000);
        expect(result.numChannels).toBe(1);
        expect(result.sampleRate).toBe(44100);
    })

    it('can detect signal with S/N of 1:50 10 seconds', async () => {
        //This is a 50hz sine wave with a Signal-to-noise ratio of 1:50. This is about the lowest we're expected to reasonably detect:
        const filepath = "test/testAudio/50HzPlusPinkNoise10secsSNR1-50.wav";
        const absPath = path.resolve(filepath);
        const goertzelContext = new GoertzelFilterCache();
        const preScanComponent = new FfmpegPreScanComponent(goertzelContext);
        const result = await preScanComponent.preScan(absPath);
        expect(result.duration).toBe(9);
        expect(result.durationSamples).toBe(396900);
        expect(result.numChannels).toBe(2);
        expect(result.sampleRate).toBe(44100);
    })
    it('can returned undefined base frequency for silent audio', async () => {
        //Just 10 seconds of silence:
        const filepath = "test/testAudio/Silence10secs.wav";
        const absPath = path.resolve(filepath);
        const goertzelContext = new GoertzelFilterCache();
        const preScanComponent = new FfmpegPreScanComponent(goertzelContext);
        const result = await preScanComponent.preScan(absPath);
        expect(result.duration).toBe(10);
        expect(result.durationSamples).toBe(441000);
        expect(result.numChannels).toBe(2);
        expect(result.sampleRate).toBe(44100);
    })
})
