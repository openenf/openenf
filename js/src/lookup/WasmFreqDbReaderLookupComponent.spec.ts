import {WasmFreqDbReaderLookupComponent} from "./wasmFreqDbReaderLookupComponent";
import {WasmFreqDbReaderStore} from "../wasmFreqDbReader/wasmFreqDbReaderStore";
import fs from "fs";
import path from "path";

describe("WasmFreqDbReaderLookupComponent", () => {
    it("Can do a 100 second lookup on the GB_50_Jan2014.freqdb database", async () => {
        const freqs:(number | null)[] = JSON.parse(fs.readFileSync(path.resolve("test/testFreqs/GBFreqs1339200.json")).toString());
        const dbPath = "test/testFreqDbs/GB_50_Jan2014.freqdb";
        const wasmPath = "src/wasmFreqDbReader/freqDbReader.wasm.js"
        const freqDbReaderStore = new WasmFreqDbReaderStore(wasmPath);
        freqDbReaderStore.addPath("GB", dbPath);
        const lookupComponent = new WasmFreqDbReaderLookupComponent(freqDbReaderStore);
        const result = await lookupComponent.lookup(freqs, ["GB"]);
        expect(result[0].gridId).toBe("GB");
        expect(result[0].score).toBe(0);
        expect(result[0].position).toBe(1339200);
    })
})
