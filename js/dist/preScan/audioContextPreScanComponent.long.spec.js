"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const audioContextPreScanComponent_1 = require("./audioContextPreScanComponent");
const GoertzelFilterCache_1 = require("../goertzel/GoertzelFilterCache");
const path_1 = __importDefault(require("path"));
describe('audioContextPreScanComponent', () => {
    it('reports progress correctly for large file', async () => {
        const filepath = path_1.default.resolve("test/testAudio/large/DE_2021-12-30T040946_saw_3600_D_secs_05amp_8Harmonics.wav");
        const goertzelFilterCache = new GoertzelFilterCache_1.GoertzelFilterCache();
        const audioContextPreScanComponent = new audioContextPreScanComponent_1.AudioContextPreScanComponent(goertzelFilterCache);
        let prevProgress = 0;
        let preScanProgressEventCalled = false;
        audioContextPreScanComponent.preScanProgressEvent.addHandler((event) => {
            const progress = event[1];
            preScanProgressEventCalled = true;
            expect(progress).toBeGreaterThanOrEqual(prevProgress);
            prevProgress = progress;
        });
        expect(preScanProgressEventCalled).toBe(true);
    });
});
