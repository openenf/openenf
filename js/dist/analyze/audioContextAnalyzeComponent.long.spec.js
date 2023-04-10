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
    it('returns correct frequencies for real-world data', async () => {
        const filepath = path_1.default.resolve("test/testAudio/large/608774__theplax__downstairs-in-boots-library_TRIM.wav");
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
        const goertzelFilterCache = new GoertzelFilterCache_1.GoertzelFilterCache();
        const audioContextPreScanComponent = new audioContextAnalyzeComponent_1.AudioContextAnalyzeComponent(goertzelFilterCache, 2);
        audioContextPreScanComponent.analyzeProgressEvent.addHandler((event) => {
            const progress = event[1];
            console.log(`${progress} audioContextAnalyzeComponent - returns correct frequencies for real-world data`);
        });
        const result = await audioContextPreScanComponent.analyze(filepath, preScanResult, 50);
        console.log('result', JSON.stringify(result, null, 2));
    });
    it('returns correct frequencies for real-world data 2', async () => {
        const filepath = path_1.default.resolve("test/testAudio/large/656618__theplax__cafe-weekday-afternoon.wav");
        const preScanResult = {
            duration: 413.94,
            durationSamples: 18254754,
            h100: 0.00016258296840545534,
            h120: 0.00006852562514363658,
            h200: 0.00018003335930611377,
            h240: 0.00012848405963188653,
            h50: 0.00003853620666597983,
            h60: 0.000060271145314359334,
            numChannels: 2,
            sampleRate: 44100
        };
        const goertzelFilterCache = new GoertzelFilterCache_1.GoertzelFilterCache();
        const audioContextPreScanComponent = new audioContextAnalyzeComponent_1.AudioContextAnalyzeComponent(goertzelFilterCache, 2);
        audioContextPreScanComponent.analyzeProgressEvent.addHandler((event) => {
            const progress = event[1];
            console.log(`${progress} audioContextAnalyzeComponent - returns correct frequencies for real-world data`);
        });
        const result = await audioContextPreScanComponent.analyze(filepath, preScanResult, 50);
        console.log('result', JSON.stringify(result, null, 2));
    });
    it('returns correct frequencies for real-world data 3', async () => {
        const filepath = path_1.default.resolve("test/testAudio/large/618186__theplax__tumble-dryer-contact.wav");
        const preScanResult = {
            duration: 83.28448979591836,
            durationSamples: 3672846,
            h100: 0.0006038646814893518,
            h120: 0.000007525799888591829,
            h200: 0.00020583021296373774,
            h240: 0.0000036286756730185515,
            h50: 0.000019269806133141402,
            h60: 0.00002802909137544513,
            numChannels: 2,
            sampleRate: 44100
        };
        const goertzelFilterCache = new GoertzelFilterCache_1.GoertzelFilterCache();
        const audioContextPreScanComponent = new audioContextAnalyzeComponent_1.AudioContextAnalyzeComponent(goertzelFilterCache, 16);
        audioContextPreScanComponent.analyzeProgressEvent.addHandler((event) => {
            const progress = event[1];
            console.log(`${progress} audioContextAnalyzeComponent - returns correct frequencies for real-world data`);
        });
        const result = await audioContextPreScanComponent.analyze(filepath, preScanResult, 50);
        console.log('result', result);
    });
});
