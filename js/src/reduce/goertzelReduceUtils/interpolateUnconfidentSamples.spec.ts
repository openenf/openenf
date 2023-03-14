import {interpolateUnconfidentSamples} from "./interpolateUnconfidentSamples";

describe("interpolateUnconfidentSamples", () => {
    it("interpolates unconfident samples for series of 4 or less samples", () => {
        const data = [{hz: 100, confidence: 0.03161632674873657},
            {hz: 100, confidence: 0.026514083298564764,},
            {hz: 100.21240234375, confidence: 0.003153866629385596},
            {hz: 100.213134765625, confidence: 0.0035639883370179194},
            {hz: 100.229248046875, confidence: 0.004322042117541383},
            {hz: 100.24, confidence: 0.005195836228564208},
            {hz: 100, confidence: 0.05163447383242176},
            {hz: 100, confidence: 0.04314449986795531},
            {hz: 100.20, confidence: 0.004184338484654106},
            {hz: 100.198486328125, confidence: 0.003533126419854466},
            {hz: 100, confidence: 0.05163447383242176},
            {hz: 100, confidence: 0.04314449986795531},];
        const confidence = 0.006;
        const result = interpolateUnconfidentSamples(data, confidence, 1)
        expect(result[0].hz).toBe(100.21240234375);
        expect(result[1].hz).toBe(100.21240234375);
        expect(result[6].hz).toBe(100.22666666666666);
        expect(result[7].hz).toBe(100.21333333333332);
        expect(result[10].hz).toBe(100.198486328125);
        expect(result[11].hz).toBe(100.198486328125);
    })
})
