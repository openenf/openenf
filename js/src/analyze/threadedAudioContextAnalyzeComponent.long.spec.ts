import {GoertzelFilterCache} from "../goertzel/GoertzelFilterCache";
import path from "path";
import fs from "fs";
import {ThreadedAudioContextAnalyzeComponent} from "./threadedAudioContextAnalyzeComponent";

describe('audioContextAnalyzeComponent', () => {
    it('reports progress correctly for large file', async () => {
        const filepath = path.resolve("test/testAudio/large/DE_2021-12-30T040946_saw_3600_D_secs_05amp_8Harmonics.wav");
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
        }
        const audioContextPreScanComponent = new ThreadedAudioContextAnalyzeComponent(2);
        let prevProgress = 0;
        let preScanProgressEventCalled = false;
        audioContextPreScanComponent.analyzeProgressEvent.addHandler((event:any) => {
            const progress = event[1];
            console.log('progress', progress);
            preScanProgressEventCalled = true;
            expect(progress).toBeGreaterThanOrEqual(prevProgress);
            prevProgress = progress
        })
        await audioContextPreScanComponent.analyze(filepath, preScanResult, 50);
        expect(preScanProgressEventCalled).toBe(true);
        expect(prevProgress).toBeCloseTo(1,1);
    },90000)
    it('returns correct frequencies for real-world data', async () => {
        const filepath = path.resolve("test/testAudio/large/618186__theplax__tumble-dryer-contact.wav");
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
        }
        const audioContextPreScanComponent = new ThreadedAudioContextAnalyzeComponent(16);
        audioContextPreScanComponent.analyzeProgressEvent.addHandler((event:any) => {
            const progress = event[1];
            console.log(`${progress} audioContextAnalyzeComponent - returns correct frequencies for real-world data`);
        })
        const result = await audioContextPreScanComponent.analyze(filepath, preScanResult, 50);
        //fs.writeFileSync('test/testAnalysisOutput/618186__theplax__tumble-dryer-contact.wav.analysis.json', JSON.stringify(result)); 
        const expectedResultJson = fs.readFileSync('test/testAnalysisOutput/618186__theplax__tumble-dryer-contact.wav.analysis.json', 'utf-8');
        expect(expectedResultJson).toBe(JSON.stringify(result));
        console.log('result', result);
    }, 20000)
    it('returns correct frequencies for apawlak sample', async () => {
        const filepath = path.resolve("test/testAudio/large/404931__alanpawlak__ambientuohstudentunion44-1-24bit.wav");
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
        }
        const audioContextPreScanComponent = new ThreadedAudioContextAnalyzeComponent(16);
        audioContextPreScanComponent.analyzeProgressEvent.addHandler((event:any) => {
            const progress = event[1];
            console.log(`${progress} audioContextAnalyzeComponent - returns correct frequencies for real-world data`);
        })
        const result = await audioContextPreScanComponent.analyze(filepath, preScanResult, 50);
        //fs.writeFileSync('test/testAnalysisOutput/404931__alanpawlak__ambientuohstudentunion44-1-24bit.wav.analysis.json', JSON.stringify(result)); 
        const expectedResultJson = fs.readFileSync('test/testAnalysisOutput/404931__alanpawlak__ambientuohstudentunion44-1-24bit.wav.analysis.threaded.json', 'utf-8');
        expect(expectedResultJson).toBe(JSON.stringify(result));
        console.log('result', result);
    }, 200000)
})