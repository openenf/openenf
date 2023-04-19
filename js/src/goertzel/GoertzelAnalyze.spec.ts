import {FrequencyRequestCache} from "./FrequencyRequestCache";
import {GoertzelFilterStore} from "./GoertzelFilterStore";
import fs from "fs";
import {detectPeakAround, getDataForWindow} from "./GoertzelAnalyze";

describe('goertzelAnalyze', () => {
    it('getDataForWindow returns correct values for real-world second-sample', () => {
        const freq = 100;
        const goertzelFilterStore = new GoertzelFilterStore(44100, 44100)
        const filepath = "test/testAudioWindows/Plax_tumbledryer_firstSecondWindowed.chrome.json";
        const samples = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
        const requestCache = new FrequencyRequestCache(goertzelFilterStore, samples);
        const result = getDataForWindow(freq, requestCache);
        expect(JSON.stringify(result)).toStrictEqual(JSON.stringify({
            "amp": 0.000005687838927008738,
            "hz": 100.103271484375,
            "standardDev": 2.1229027634275856e-8,
            "confidence": 0.0037323538705482124,
            "target": 100
        }));
    })
    it('detectPeakAround detects correct peak around real world signal', () => {
        const freq = 100;
        const goertzelFilterStore = new GoertzelFilterStore(44100, 44100)
        const filepath = "test/testAudioWindows/Plax_tumbledryer_firstSecondWindowed.chrome.json";
        const samples = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
        const requestCache = new FrequencyRequestCache(goertzelFilterStore, samples);
        const result = detectPeakAround(requestCache, freq);
        expect(result).toStrictEqual({
            "hz": 100.103271484375,
            "amp": 0.000005687838927008738
        })
    })
})