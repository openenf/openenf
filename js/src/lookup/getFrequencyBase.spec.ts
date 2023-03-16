import {getFrequencyBase} from "./getFrequencyBase";

describe("get frequency base", () => {
    it("can return value 50 for frequencies centered around 50Hz", () => {
        const freqs = [49.9, 49.8, 49.9, 50, 50, 50.1, 50.2];
        const result = getFrequencyBase(freqs);
        expect(result).toBe(50);
    })
    it("can return value 60 for frequencies centered around 50Hz", () => {
        const freqs = [59.9, 59.8, null, 60, 60, null, 60.2];
        const result = getFrequencyBase(freqs);
        expect(result).toBe(60);
    })
})
