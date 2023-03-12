import {FfmpegPreScanComponent} from "./ffmpegPreScanComponent";
import * as path from "path";
import {GoertzelContext} from "../goertzel/GoertzelContext";

describe('ffmpegPreScanComponent', () => {
    it('can pre-scan local wav file at 50hz', async () => {
        const filepath = "src/preScan/testAudio/DE_2013-02-05T17:46:39_saw_10_D_secs_05amp_8Harmonics.wav";
        const absPath = path.resolve(filepath);
        const goertzelContext = new GoertzelContext();
        const preScanComponent = new FfmpegPreScanComponent(goertzelContext);
        const result = await preScanComponent.preScan(absPath);
        expect(result.baseFrequency).toBe(50);
        expect(result.duration).toBe(9);
        expect(result.durationSamples).toBe(396900);
        expect(result.numChannels).toBe(2);
        expect(result.sampleRate).toBe(44100);
    })
})
