import {WasmFreqDbReaderLookupComponent} from "./wasmFreqDbReaderLookupComponent";
import {WasmFreqDbReaderStore} from "../wasmFreqDbReader/wasmFreqDbReaderStore";

describe("WasmFreqDbReaderLookupComponent", () => {
    it("Can do a 100 second lookup on the GB_50_Jan2014.freqdb database", async () => {
        const freqs = [-7, -6, -2, -2, 1, 2, 5, 1, 1, 3, 4, 4, 5, 5, 6, 4, 2, 1, -4, -5, -9, -11, -14, -13, -15, -15, -19, -25, -26, -31, -35, -38, -39, -39, -38, -40, -40, -38, -37, -38, -38, -40, -41, -41, -44, -46, -46, -44, -47, -46, -48, -49, -48, -48, -48, -46, -45, -47, -47, -49, -49, -50, -50, -52, -53, -51, -53, -51, -49, -46, -46, -44, -44, -42, -39, -40, -39, -37, -39, -36, -36, -37, -36, -37, -36, -37, -37, -36, -33, -31, -29, -29, -28, -26, -25, -23, -23, -22, -22, -21];
        const dbPath = "test/testFreqDbs/GB_50_Jan2014.freqdb";
        const wasmPath = "/Users/chris.hodges/openEnfPublicRepo/js/src/wasmFreqDbReader/freqDbReader.wasm.js";
        const freqDbReaderStore = new WasmFreqDbReaderStore(wasmPath);
        freqDbReaderStore.addPath("GB", dbPath);
        const lookupComponent = new WasmFreqDbReaderLookupComponent(freqDbReaderStore);
        const result = await lookupComponent.lookup(freqs, ["GB"]);
        expect(result[0].gridId).toBe("GB");
        expect(result[0].score).toBe(0);
        expect(result[0].position).toBe(1339200);
    }, 5000)
})
