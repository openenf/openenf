"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const GoertzelFilterCache_1 = require("../goertzel/GoertzelFilterCache");
const path_1 = __importDefault(require("path"));
const audioContextAnalyzeComponent_1 = require("./audioContextAnalyzeComponent");
describe('audioContextAnalyzeComponent', () => {
    it('reports progress correctly for large file', async () => {
        const filepath = path_1.default.resolve("test/testAudio/large/DE_2021-12-30T040946_saw_3600_D_secs_05amp_8Harmonics.wav");
        const preScanResult = {
            duration: 3599,
            durationSamples: 158715900,
            h100: 3.3282008302435413,
            h120: 1.211696336860397e-10,
            h200: 0.20630783760981014,
            h240: 7.423843245261639e-10,
            h50: 53.36026365360013,
            h60: 3.120569568109879e-8,
            numChannels: 2,
            sampleRate: 44100
        };
        const goertzelFilterCache = new GoertzelFilterCache_1.GoertzelFilterCache();
        const audioContextPreScanComponent = new audioContextAnalyzeComponent_1.AudioContextAnalyzeComponent(goertzelFilterCache, 2);
        let prevProgress = 0;
        let preScanProgressEventCalled = false;
        audioContextPreScanComponent.analyzeProgressEvent.addHandler((event) => {
            const progress = event[1];
            preScanProgressEventCalled = true;
            expect(progress).toBeLessThanOrEqual(1);
            expect(progress).toBeGreaterThanOrEqual(prevProgress);
            prevProgress = progress;
        });
        await audioContextPreScanComponent.analyze(filepath, preScanResult, 50);
        expect(preScanProgressEventCalled).toBe(true);
    });
});
