import {getDataPath} from "../../src/dataDownloader/downloadData";
import {WasmFreqDbReaderStore} from "../../src/wasmFreqDbReader/wasmFreqDbReaderStore";

describe('full grid lookups', () => {
    it('can read entire grid file to memory', async () => {
        const dataPath = await getDataPath();
        const wasmPath = "src/wasmFreqDbReader/freqDbReader.wasm.js"
        const freqDbReaderStore = new WasmFreqDbReaderStore(wasmPath);
        freqDbReaderStore.addPath("GB", dataPath);
        const reader = await freqDbReaderStore.getReader("GB");
    })
    it('can analyze lookup one hour of audio in an acceptable time period', () => {
        expect(true).toBe(false);
    })
})
