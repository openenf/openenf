// @ts-ignore
import {arrayToVectorInt16_t, vectorToArray, waitForWasmRuntime} from "./FreqDbWasmHelpers";
import path from "path";
import {FsFreqDbReader} from "./fsFreqDbReader";

describe('fsFreqDbReader', () => {
    let module:any;
    beforeEach(async () => {
        module = await import(modulePath);
        await waitForWasmRuntime(module);
    })
    const modulePath = path.resolve("src/wasmFreqDbReader/freqDbReader.wasm.js");
    it('can read all frequencies to an array', async () => {
        const freqDbReader = new FsFreqDbReader(module, "test/testFreqDbs/TestFreqDb.freqdb");
        const expectedResult = [-500, -499, -10, -2, -1,
            0, 1, 10, 20, 30,
            40, 50, 60, 70, 499,
            500];
        const result = freqDbReader.readDbToArray();
        expect(result).toStrictEqual(expectedResult);
    })
    it('can do lookup', async () => {
        const freqDbReader = new FsFreqDbReader(module,"test/testFreqDbs/Test123FreqDb.freqdb");
        const expectedFrequencies = [1, 8, 5, 7, 2, 8, 5, 8, 2, 3, 1, 2, 3, 4, 5, 8, 1, 9, 2, 4, 0, 0, 9, 9, 7, 2, 1];
        const actualFrequencies = freqDbReader.readDbToArray();
        expect(expectedFrequencies).toStrictEqual(actualFrequencies);
        const maxSingleDifference = 1000;
        const startTime = 10;
        const endTime = 14;
        const results = freqDbReader.lookup([1, 2, null, 4, 5], maxSingleDifference, startTime, endTime);
        expect(results).toStrictEqual([
            {score: 0, position: 10},
            {score: 6, position: 11},
            {score: 12, position: 12},
            {score: 13, position: 13},
            {score: 18, position: 14}
        ])
    })
    it('can do 8 thread lookup on large file', async () => {
        const freqDbReader = new FsFreqDbReader(module,"test/testFreqDbs/GB_50_Jan2014.freqdb");
        const lookupFrequencies = [-7, -6, -2, -2, 1, 2, 5, 1, 1, 3, 4, 4, 5, 5, 6, 4, 2, 1, -4, -5, -9, -11, -14, -13, -15, -15, -19, -25, -26, -31, -35, -38, -39, -39, -38, -40, -40, -38, -37, -38, -38, -40, -41, -41, -44, -46, -46, -44, -47, -46, -48, -49, -48, -48, -48, -46, -45, -47, -47, -49, -49, -50, -50, -52, -53, -51, -53, -51, -49, -46, -46, -44, -44, -42, -39, -40, -39, -37, -39, -36, -36, -37, -36, -37, -36, -37, -37, -36, -33, -31, -29, -29, -28, -26, -25, -23, -23, -22, -22, -21];
        const results = freqDbReader.lookup(lookupFrequencies, 1000, 0, 2678400);
        expect(results[0].score).toBe(0);
        expect(results[0].position).toBe(1339200);
    })
    it('can read metaData from a valid freqDB file', async () => {
        const freqDbReader = new FsFreqDbReader(module,"test/testFreqDbs/TestFreqDb.freqdb");
        const metaData = freqDbReader.freqDbMetaData;
        expect(metaData.baseFrequency).toBe(50);
        expect(metaData.startDate).toBe(1262304000);
        expect(metaData.endDate).toBe(1262304016);
        expect(metaData.gridId).toBe("XX");
    });
    it('can do comprehensive lookup', async () => {
        const freqDbReader = new FsFreqDbReader(module, "test/testFreqDbs/GB_50_Jan2014.freqdb");
        const lookupFrequencies = [-7, -6, -2, -2, 1, 2, 5, 1, 1, 3, 4, 4, 5, 5, 6, 4, 2, 1, -4, -5, -9, -11, -14, -13, -15, -15, -19, -25, -26, -31, -35, -38, -39, -39, -38, -40, -40, -38, -37, -38, -38, -40, -41, -41, -44, -46, -46, -44, -47, -46, -48, -49, -48, -48, -48, -46, -45, -47, -47, -49, -49, -50, -50, -52, -53, -51, -53, -51, -49, -46, -46, -44, -44, -42, -39, -40, -39, -37, -39, -36, -36, -37, -36, -37, -36, -37, -37, -36, -33, -31, -29, -29, -28, -26, -25, -23, -23, -22, -22, -21];
        const results = freqDbReader.comprehensiveLookup(lookupFrequencies, 1339200, 2, 2);
        expect(results).toStrictEqual(
            [
                { score: 247, position: 1339198 },
                { score: 152, position: 1339199 },
                { score: 0, position: 1339200 },
                { score: 155, position: 1339201 },
                { score: 253, position: 1339202 }
            ]
        );
    })
});
