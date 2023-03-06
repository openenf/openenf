// @ts-ignore
import * as Wasm from './hello2.js';

describe('fsFreqDbReader', () => {
	it('can do lookup passing only frequency array and maxSingleDiff parameter', async () => {
		const wasm:any = Wasm;
		const factory = await wasm.default();
		const freqDbReader = new factory.FsFreqDbReader("Test123FreqDb.freqdb");
		const expectedFrequencies = [1,8,5,7,2,8,5,8,2,3,1,2,3,4,5,8,1,9,2,4,0,0,9,9,7,2,1];
		const vector = freqDbReader.readDbToVector();
		const actualFrequencies = [];
		for(let i = 0; i < vector.size(); i++) {
			actualFrequencies[i] = vector.get(i);
		}
		expect(expectedFrequencies).toStrictEqual(actualFrequencies);
		const lookupVector = new factory.vectorInt16_tPointer();
		lookupVector.set(0,1);
		//const result = freqDbReader.lookup([1,2,3,4,5], 1000);
		console.log('factory', factory);
	})
	it('can read metaData from a valid freqDB file',  async () => {
		const wasm:any = Wasm;
		const factory = await wasm.default();
		const freqDbReader = new factory.FsFreqDbReader("TestFreqDb.freqdb");
		const metaData = freqDbReader.freqDbMetaData;
		expect(metaData.baseFrequency).toBe(50);
		expect(metaData.startDate).toBe(1262304000);
		expect(metaData.endDate).toBe(1262304016);
		expect(metaData.gridId).toBe("XX");
	});
	it('can read all frequencies to an array', async () => {
		const wasm:any = Wasm;
		const factory = await wasm.default();
		const freqDbReader = new factory.FsFreqDbReader("TestFreqDb.freqdb");
		const expectedResult = [-500, -499, -10, -2, -1,
			0, 1, 10, 20, 30,
			40, 50, 60, 70, 499,
			500];
		const result = freqDbReader.readDbToVector();
		for(let i = 0; i < expectedResult.length; i++) {
			expect(result.get(i)).toBe(expectedResult[i]);
		}
		expect(result.size()).toBe(expectedResult.length);
	})
});
