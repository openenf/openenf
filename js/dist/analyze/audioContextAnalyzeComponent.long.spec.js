"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const GoertzelFilterCache_1 = require("../goertzel/GoertzelFilterCache");
const path_1 = __importDefault(require("path"));
const audioContextAnalyzeComponent_1 = require("./audioContextAnalyzeComponent");
const fs_1 = __importDefault(require("fs"));
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
        //fs.writeFileSync('test/testAnalysisOutput/618186__theplax__tumble-dryer-contact.wav.analysis.json', JSON.stringify(result)); 
        const expectedResult = JSON.parse(fs_1.default.readFileSync('test/testAnalysisOutput/618186__theplax__tumble-dryer-contact.wav.analysis.json', 'utf-8'));
        expect(expectedResult).toStrictEqual(result);
        console.log('result', result);
    });
    it('returns correct frequencies for apawlak sample', async () => {
        const filepath = path_1.default.resolve("test/testAudio/large/404931__alanpawlak__ambientuohstudentunion44-1-24bit.wav");
        const preScanResult = {
            duration: 607.5080272108844,
            durationSamples: 26791104,
            h100: 0.0000109695957986133,
            h120: 0.0000015924407798751826,
            h200: 0.000004373956170401663,
            h240: 0.000004999626116558637,
            h50: 0.000005728122559862526,
            h60: 0.0000018719339208093409,
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
        //fs.writeFileSync('test/testAnalysisOutput/404931__alanpawlak__ambientuohstudentunion44-1-24bit.wav.analysis.json', JSON.stringify(result, null, 2)); 
        const expectedResult = JSON.parse(fs_1.default.readFileSync('test/testAnalysisOutput/404931__alanpawlak__ambientuohstudentunion44-1-24bit.wav.analysis.json', 'utf-8'));
        expect(expectedResult).toStrictEqual(result);
        console.log('result', result);
    });
});
