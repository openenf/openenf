import {GoertzelAnalyzeProcessor} from "./goertzelAnalyzeProcessor";
import {GoertzelFilterStore} from "../goertzel/GoertzelFilterStore";
import {ENFEventBase} from "../ENFProcessor/events/ENFEventBase";
import {AnalysisWindowResult} from "../model/analysisWindowResult";
import fs from "fs";

describe('goertzelAnalyzeProcessor', () => {
    it('processes one window of real-world PCM data correctly', () => {
        const goertzelFilterStore = new GoertzelFilterStore(44100,44100);
        const event = new ENFEventBase<[AnalysisWindowResult, number]>();
        const goertzelAnalyzeProcessor = new GoertzelAnalyzeProcessor(goertzelFilterStore, 100, 16,event,44100);
        const filepath = "test/testAudioWindows/Plax_tumbledryer_firstSecondUnwindowed.chrome.json";
        const samples = JSON.parse(fs.readFileSync(filepath,'utf-8'));
        goertzelAnalyzeProcessor.process(samples);
        const result = goertzelAnalyzeProcessor.getResult();
        expect(result[0]).toStrictEqual({
            "start": 0,
            "end": 1,
            "startSamples": 0,
            "endSamples": 44099,
            "channelNum":1,
            "data": [
                {
                    "hz": 100.103271484375,
                    "amp": 0.000005687838927008738,
                    "standardDev": 2.1229027634275856e-8,
                    "confidence": 0.0037323538705482124,
                    "target": 100
                }
            ]
        })
        console.log('result', result[0]);
    })
})