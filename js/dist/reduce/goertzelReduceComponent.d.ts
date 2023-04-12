import { ReduceComponent } from "./reduceComponent";
import { AnalysisWindowResult } from "../model/analysisWindowResult";
import { OverlapFactor } from "../bufferedAudioProcessor/bufferedAudioProcessor";
export declare class GoertzelReduceComponent implements ReduceComponent {
    private overlapFactor;
    constructor(overlapFactor: OverlapFactor);
    readonly implementationId: string;
    reduce(analysisResults: AnalysisWindowResult[]): Promise<(number | null)[]>;
}
