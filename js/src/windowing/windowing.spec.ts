import fs from "fs";
import {hann} from "./windowing";

describe('windowing', () => {
    it('hann algorithm outputs correct window values', () => {
        const filepath = "test/testAudioWindows/Plax_tumbledryer_firstSecondUnwindowed.chrome.json";
        const frame = JSON.parse(fs.readFileSync(filepath,'utf-8'));
        const result = hann(frame,1);
        const expectedResult = fs.readFileSync("test/testAudioWindows/Plax_tumbledryer_firstSecondWindowed.chrome.json", "utf-8");
        expect(JSON.stringify(result, null, 2)).toStrictEqual(expectedResult);
    })
})