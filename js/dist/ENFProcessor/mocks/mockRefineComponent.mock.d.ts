import { ENFAnalysisResult } from "../../model/ENFAnalysisResult";
import { LookupResult } from "../../model/lookupResult";
import { RefineComponent } from "../../refine/refineComponent";
export declare class MockRefineComponent implements RefineComponent {
    dispose(): Promise<void>;
    readonly implementationId: string;
    private readonly onRefine;
    private readonly result;
    constructor(onRefine?: (eNFAnalysisResult: ENFAnalysisResult[]) => void, result?: ENFAnalysisResult[]);
    refine(lookupFrequencies: (number | null)[], lookupResults: LookupResult[]): Promise<ENFAnalysisResult[]>;
}
