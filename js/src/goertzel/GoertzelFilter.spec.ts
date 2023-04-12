import {GoertzelFilter} from "./GoertzelFilter";
import fs from "fs";
import path from "path";

describe("GoertzelFilter", () => {
    it('returns correct frequency analysis for heap size 524288', () => {
        const samples = JSON.parse(fs.readFileSync(path.resolve('test/testAnalysisOutput/59.95Hz1Second.json'),'utf-8'));
        const goertzelFilter = new GoertzelFilter();
        const detectFrequencyHz = 59.95;
        const sampleFrequencyHz = 44100;
        const windowSizeSamples = 44100;
        goertzelFilter.init(detectFrequencyHz, sampleFrequencyHz, windowSizeSamples)
        const result = goertzelFilter.run(samples);
        expect(result).toBe(0.059335745806406694);
    })
})