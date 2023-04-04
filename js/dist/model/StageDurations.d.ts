import { CompletionTimes } from "./CompletionTimes";
export declare class StageDurations {
    preScan: number | undefined;
    analyze: number | undefined;
    reduce: number | undefined;
    lookup: number | undefined;
    refine: number | undefined;
    constructor(startTime: Date, completionTimes: CompletionTimes);
}
