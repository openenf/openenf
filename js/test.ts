// @ts-ignore
import {default as Module} from './freqDbReader.wasm.js';
import {arrayToVectorInt16_t, vectorToArray} from "./FreqDbWasmHelpers";

describe('fsFreqDbReader', () => {
    const path = "./freqDbReader.wasm.js"
    beforeAll(done => {
        Module.onRuntimeInitialized = () => {
            done();
        }
    })
    it('can do single thread lookup on large file', async () => {
        const module = await import(path);
        const freqDbReader = new module.FsFreqDbReader("GB_50_Jan2014.freqdb");
        const lookupFrequencies = [-7, -6, -2, -2, 1, 2, 5, 1, 1, 3, 4, 4, 5, 5, 6, 4, 2, 1, -4, -5, -9, -11, -14, -13, -15, -15, -19, -25, -26, -31, -35, -38, -39, -39, -38, -40, -40, -38, -37, -38, -38, -40, -41, -41, -44, -46, -46, -44, -47, -46, -48, -49, -48, -48, -48, -46, -45, -47, -47, -49, -49, -50, -50, -52, -53, -51, -53, -51, -49, -46, -46, -44, -44, -42, -39, -40, -39, -37, -39, -36, -36, -37, -36, -37, -36, -37, -37, -36, -33, -31, -29, -29, -28, -26, -25, -23, -23, -22, -22, -21];
        const lookupVector = arrayToVectorInt16_t(Module, lookupFrequencies);
        const resultVector = freqDbReader.lookup(lookupVector, 1000, 0, 2678400, 1);
        const results = vectorToArray(resultVector, ["score", "position"]);
        expect(results[0].score).toBe(0);
        expect(results[0].position).toBe(1339200);
    }, 30000)
    it('can do lookup passing only frequency array and maxSingleDiff parameter', async () => {
        const module = await import(path);
        const freqDbReader = new module.default.FsFreqDbReader("Test123FreqDb.freqdb");
        const expectedFrequencies = [1, 8, 5, 7, 2, 8, 5, 8, 2, 3, 1, 2, 3, 4, 5, 8, 1, 9, 2, 4, 0, 0, 9, 9, 7, 2, 1];
        const vector = freqDbReader.readDbToVector();
        const actualFrequencies = vectorToArray(vector);
        expect(expectedFrequencies).toStrictEqual(actualFrequencies);
        const lookupVector = arrayToVectorInt16_t(module, [1, 2, null, 4, 5])
        const maxSingleDifference = 1000;
        const startTime = 10;
        const endTime = 14;
        const numThreads = 1;
        const resultVector = freqDbReader.lookup(lookupVector, maxSingleDifference, startTime, endTime, numThreads);
        const results = vectorToArray(resultVector, ["score", "position"]);
        expect(results).toStrictEqual([
            {score: 0, position: 10},
            {score: 6, position: 11},
            {score: 12, position: 12},
            {score: 13, position: 13},
            {score: 18, position: 14}
        ])
    })
    it('can do 8 thread lookup on large file', async () => {
        const module = await import(path);
        const freqDbReader = new module.FsFreqDbReader("GB_50_Jan2014.freqdb");
        const lookupFrequencies = [-7, -6, -2, -2, 1, 2, 5, 1, 1, 3, 4, 4, 5, 5, 6, 4, 2, 1, -4, -5, -9, -11, -14, -13, -15, -15, -19, -25, -26, -31, -35, -38, -39, -39, -38, -40, -40, -38, -37, -38, -38, -40, -41, -41, -44, -46, -46, -44, -47, -46, -48, -49, -48, -48, -48, -46, -45, -47, -47, -49, -49, -50, -50, -52, -53, -51, -53, -51, -49, -46, -46, -44, -44, -42, -39, -40, -39, -37, -39, -36, -36, -37, -36, -37, -36, -37, -37, -36, -33, -31, -29, -29, -28, -26, -25, -23, -23, -22, -22, -21];
        const lookupVector = arrayToVectorInt16_t(module, lookupFrequencies);
        const resultVector = freqDbReader.lookup(lookupVector, 1000, 0, 2678400, 8);
        const results = vectorToArray(resultVector, ["score", "position"]);
        expect(results[0].score).toBe(0);
        expect(results[0].position).toBe(1339200);
    })
    it('can read metaData from a valid freqDB file', async () => {
        const module = await import(path);
        const freqDbReader = new module.FsFreqDbReader("TestFreqDb.freqdb");
        const metaData = freqDbReader.freqDbMetaData;
        expect(metaData.baseFrequency).toBe(50);
        expect(metaData.startDate).toBe(1262304000);
        expect(metaData.endDate).toBe(1262304016);
        expect(metaData.gridId).toBe("XX");
    });
    it('can read all frequencies to an array', async () => {
        const module = await import(path);
        const freqDbReader = new module.FsFreqDbReader("TestFreqDb.freqdb");
        const expectedResult = [-500, -499, -10, -2, -1,
            0, 1, 10, 20, 30,
            40, 50, 60, 70, 499,
            500];
        const result = vectorToArray(freqDbReader.readDbToVector());
        expect(result).toStrictEqual(expectedResult);
    })
});
