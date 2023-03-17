import {arrayToVectorInt16_t, vectorToArray} from "./FreqDbWasmHelpers";
import os from "os";
import {FreqDbMetaData} from "./freqDbMetaData";

export class FsFreqDbReader {
    private wasmFsFreqDbReader: any;
    private moduleDefault: any;
    freqDbMetaData: FreqDbMetaData;
    constructor(module: any, dbPath: string) {
        if (!module || !module.default || !module.default.FsFreqDbReader) {
            throw new Error("Was expecting module argument to be an initialised WASM FsFreqDbReader module. You might need to do waitForWasmRuntime(module) before passing it to this constructor");
        }
        this.moduleDefault = module.default;
        this.wasmFsFreqDbReader = new module.default.FsFreqDbReader(dbPath);
        const freqDbMetaData = this.wasmFsFreqDbReader.freqDbMetaData;
        this.freqDbMetaData = {
            baseFrequency: freqDbMetaData.baseFrequency,
            startDate: freqDbMetaData.startDate,
            endDate: freqDbMetaData.endDate,
            gridId: freqDbMetaData.gridId
        }
    }

    readDbToArray():(number|null)[] {
        const vector = this.wasmFsFreqDbReader.readDbToVector();
        const actualFrequencies = vectorToArray(vector);
        return actualFrequencies;
    }

    lookup(freqs:(number|null)[], maxSingleDifference:number, startTime:number, endTime:number):{score:number,position:number}[] {
        const totalWorkers = this.moduleDefault.PThread?.unusedWorkers?.length;
        let numThreads = Math.min(os.cpus().length,totalWorkers);
        const vector = arrayToVectorInt16_t(this.moduleDefault, freqs);
        const resultVector = this.wasmFsFreqDbReader.lookup(vector, maxSingleDifference, startTime, endTime, numThreads);
        const results = vectorToArray(resultVector, ["score", "position"]);
        return results;
    }

    comprehensiveLookup(freqs:(number|null)[], aroundTs: number, diffBefore:number, diffAfter:number):{score:number,position:number}[] {
        const vector = arrayToVectorInt16_t(this.moduleDefault, freqs);
        const resultVector = this.wasmFsFreqDbReader.comprehensiveLookup(vector, aroundTs, diffBefore, diffAfter);
        const results = vectorToArray(resultVector, ["score", "position"]);
        return results;
    }
}
