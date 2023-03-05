// @ts-ignore
import * as Wasm from './hello2.js';

describe('fsFreqDbReader', () => {
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
