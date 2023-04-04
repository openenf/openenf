import {AudioContextPreScanComponent} from "./audioContextPreScanComponent";
import {GoertzelFilterCache} from "../goertzel/GoertzelFilterCache";
import path from "path";

describe('audioContextPreScanComponent', () => {
    it('reports progress correctly for large file', async () => {
        const filepath = path.resolve("test/testAudio/large/DE_2021-12-30T040946_saw_3600_D_secs_05amp_8Harmonics.wav");
        const goertzelFilterCache = new GoertzelFilterCache();
        const audioContextPreScanComponent = new AudioContextPreScanComponent(goertzelFilterCache);
        let prevProgress = 0;
        let preScanProgressEventCalled = false;
        audioContextPreScanComponent.preScanProgressEvent.addHandler((event:any) => {
            const progress = event[1];
            preScanProgressEventCalled = true;
            expect(progress).toBeGreaterThanOrEqual(prevProgress);
            prevProgress = progress
        })
        expect(preScanProgressEventCalled).toBe(true);
    })
})