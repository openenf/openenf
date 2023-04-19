"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const audioContextPreScanComponent_1 = require("./audioContextPreScanComponent");
const GoertzelFilterCache_1 = require("../goertzel/GoertzelFilterCache");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
describe('audioContextPreScanComponent', () => {
    it('reports progress correctly for large file', async () => {
        const filepath = path_1.default.resolve("test/testAudio/large/DE_2021-12-30T040946_saw_3600_D_secs_05amp_8Harmonics.wav");
        const goertzelFilterCache = new GoertzelFilterCache_1.GoertzelFilterCache();
        const audioContextPreScanComponent = new audioContextPreScanComponent_1.AudioContextPreScanComponent(goertzelFilterCache);
        let prevProgress = 0;
        let preScanProgressEventCalled = false;
        audioContextPreScanComponent.preScanProgressEvent.addHandler((event) => {
            const progress = event[1];
            console.log('progress', progress);
            preScanProgressEventCalled = true;
            expect(progress).toBeGreaterThanOrEqual(prevProgress);
            prevProgress = progress;
        });
        await audioContextPreScanComponent.preScan(filepath);
        expect(preScanProgressEventCalled).toBe(true);
    });
    it('reads audio data correctly for real-world file', async () => {
        const filepath = path_1.default.resolve("test/testAudio/large/608774__theplax__downstairs-in-boots-library_TRIM.wav");
        const goertzelFilterCache = new GoertzelFilterCache_1.GoertzelFilterCache();
        const audioContextPreScanComponent = new audioContextPreScanComponent_1.AudioContextPreScanComponent(goertzelFilterCache);
        audioContextPreScanComponent.preScanProgressEvent.addHandler((e) => {
            console.log('e', e);
        });
        const result = await audioContextPreScanComponent.preScan(filepath);
        //We're stringifying the result here because rounding errors were causing
        //object comparison to fail:
        expect(JSON.stringify(result)).toStrictEqual(JSON.stringify({
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
        }));
    });
    it('reads audio data correctly for real-world file 2', async () => {
        const filepath = path_1.default.resolve("test/testAudio/large/656618__theplax__cafe-weekday-afternoon.wav");
        const goertzelFilterCache = new GoertzelFilterCache_1.GoertzelFilterCache();
        const audioContextPreScanComponent = new audioContextPreScanComponent_1.AudioContextPreScanComponent(goertzelFilterCache);
        const result = await audioContextPreScanComponent.preScan(filepath);
        console.log('result', result);
        //We're stringifying the result here because rounding errors were causing
        //object comparison to fail:
        expect(JSON.stringify(result)).toStrictEqual(JSON.stringify({
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
        }));
    });
    it('reads audio data correctly for real-world file 3', async () => {
        const filepath = path_1.default.resolve("test/testAudio/large/618186__theplax__tumble-dryer-contact.wav");
        const goertzelFilterCache = new GoertzelFilterCache_1.GoertzelFilterCache();
        const audioContextPreScanComponent = new audioContextPreScanComponent_1.AudioContextPreScanComponent(goertzelFilterCache);
        const result = await audioContextPreScanComponent.preScan(filepath);
        console.log('result', result);
        //We're stringifying the result here because rounding errors were causing
        //object comparison to fail:
        expect(JSON.stringify(result)).toStrictEqual(JSON.stringify({
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
        }));
    });
    it('reads audio data correctly for apawlak sample', async () => {
        const filepath = path_1.default.resolve("test/testAudio/large/404931__alanpawlak__ambientuohstudentunion44-1-24bit.wav");
        const goertzelFilterCache = new GoertzelFilterCache_1.GoertzelFilterCache();
        const audioContextPreScanComponent = new audioContextPreScanComponent_1.AudioContextPreScanComponent(goertzelFilterCache);
        const result = await audioContextPreScanComponent.preScan(filepath);
        expect(JSON.stringify(result)).toStrictEqual(JSON.stringify({
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
        }));
        console.log('result', result);
    });
    it('reads audio data correctly for PCM audio decoded by chrome', async () => {
        const filepath = path_1.default.resolve("test/testAudioWindows/large/plax_tumbledryer.chrome.json");
        const audioData = Float32Array.from(Object.values(JSON.parse(fs_1.default.readFileSync(filepath, 'utf-8'))));
        const goertzelFilterCache = new GoertzelFilterCache_1.GoertzelFilterCache();
        const audioContextPreScanComponent = new audioContextPreScanComponent_1.AudioContextPreScanComponent(goertzelFilterCache);
        const result = await audioContextPreScanComponent.preScan(audioData);
        console.log('result', result);
        //We're stringifying the result here because rounding errors were causing
        //object comparison to fail:
        expect(JSON.stringify(result)).toStrictEqual(JSON.stringify({
            duration: 83.28448979591836,
            durationSamples: 3672846,
            h100: 0.000603824838822795,
            h120: 0.000007527601900392758,
            h200: 0.0002058336319193009,
            h240: 0.0000036297368335053236,
            h50: 0.000019272759314746277,
            h60: 0.000028027040707500292,
            numChannels: 1,
            sampleRate: 44100
        }));
    });
});
