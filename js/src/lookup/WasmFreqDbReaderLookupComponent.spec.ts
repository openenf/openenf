import {WasmFreqDbReaderLookupComponent} from "./wasmFreqDbReaderLookupComponent";
import {WasmFreqDbReaderStore} from "../wasmFreqDbReader/wasmFreqDbReaderStore";

describe("WasmFreqDbReaderLookupComponent", () => {
    it("Can do a 100 second lookup on the GB_50_Jan2014.freqdb database", async () => {
        const freqs = [49.93,49.94,49.98,49.98,50.01,50.02,50.05,50.01,50.01,50.03,50.04,50.04,50.05,50.05,50.06,50.04,50.02,50.01,49.96,49.95,49.91,49.89,49.86,49.87,49.85,49.85,49.81,49.75,49.74,49.69,49.65,49.62,49.61,49.61,49.62,49.6,49.6,49.62,49.63,49.62,49.62,49.6,49.59,49.59,49.56,49.54,49.54,49.56,49.53,49.54,49.52,49.51,49.52,49.52,49.52,49.54,49.55,49.53,49.53,49.51,49.51,49.5,49.5,49.48,49.47,49.49,49.47,49.49,49.51,49.54,49.54,49.56,49.56,49.58,49.61,49.6,49.61,49.63,49.61,49.64,49.64,49.63,49.64,49.63,49.64,49.63,49.63,49.64,49.67,49.69,49.71,49.71,49.72,49.74,49.75,49.77,49.77,49.78,49.78,49.79];
        const dbPath = "test/testFreqDbs/GB_50_Jan2014.freqdb";
        const wasmPath = "src/wasmFreqDbReader/fsFreqDbReader.wasm.js"
        const freqDbReaderStore = new WasmFreqDbReaderStore(wasmPath);
        freqDbReaderStore.addPath("GB", dbPath);
        const lookupComponent = new WasmFreqDbReaderLookupComponent(freqDbReaderStore);
        const result = await lookupComponent.lookup(freqs, ["GB"]);
        expect(result[0].gridId).toBe("GB");
        expect(result[0].score).toBe(0);
        expect(result[0].position).toBe(1339200);
    })
})
