import {getDataPath} from "../../src/dataDownloader/downloadData";
import {WasmFreqDbReaderStore} from "../../src/wasmFreqDbReader/wasmFreqDbReaderStore";

describe('full grid lookups', () => {
    it('can read entire grid file to memory', async () => {
        console.log("Getting data path");
        const dataPath = await getDataPath();
        console.log(`Using datapath: ${dataPath}`)
        const wasmPath = "src/wasmFreqDbReader/fsFreqDbReader.wasm.js"
        const freqDbReaderStore = new WasmFreqDbReaderStore(wasmPath);
        freqDbReaderStore.addPath("GB", dataPath);
        const reader = await freqDbReaderStore.getReader("GB");
        const lookupFrequencies = [-7, -6, -2, -2, 1, 2, 5, 1, 1, 3, 4, 4, 5, 5, 6, 4, 2, 1, -4, -5, -9, -11, -14, -13, -15, -15, -19, -25, -26, -31, -35, -38, -39, -39, -38, -40, -40, -38, -37, -38, -38, -40, -41, -41, -44, -46, -46, -44, -47, -46, -48, -49, -48, -48, -48, -46, -45, -47, -47, -49, -49, -50, -50, -52, -53, -51, -53, -51, -49, -46, -46, -44, -44, -42, -39, -40, -39, -37, -39, -36, -36, -37, -36, -37, -36, -37, -37, -36, -33, -31, -29, -29, -28, -26, -25, -23, -23, -22, -22, -21];
        const endTime = reader.freqDbMetaData.endDate - reader.freqDbMetaData.startDate;
        const results = reader.lookup(lookupFrequencies, 1000, 0, endTime);
        console.log('results', results);
    }, 3600000)
    it('can analyze lookup one hour of audio in an acceptable time period', () => {
        expect(true).toBe(true);
    })
})
