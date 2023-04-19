"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const GoertzelFilterCache_1 = require("../goertzel/GoertzelFilterCache");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const audioContextAnalyzeComponent_1 = require("./audioContextAnalyzeComponent");
describe('audioContextAnalyzeComponent', () => {
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
        fs_1.default.writeFileSync('test/testAnalysisOutput/404931__alanpawlak__ambientuohstudentunion44-1-24bit.wav.analysis.json', JSON.stringify(result));
        const expectedResultJson = fs_1.default.readFileSync('test/testAnalysisOutput/404931__alanpawlak__ambientuohstudentunion44-1-24bit.wav.analysis.json', 'utf-8');
        expect(expectedResultJson).toBe(JSON.stringify(result));
        console.log('result', result);
    }, 200000);
});
