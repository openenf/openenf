import {ENFAnalysisResult} from "../../model/ENFAnalysisResult";
import {LookupResult} from "../../model/lookupResult";
import {RefineComponent} from "../../refine/refineComponent";

export class MockRefineComponent implements RefineComponent {
    readonly implementationId: string = "MockRefineComponent";

    private readonly onRefine: any;
    private readonly result: any;
    constructor(onRefine?:(eNFAnalysisResult:ENFAnalysisResult[]) => void, result?:ENFAnalysisResult[]) {
        this.onRefine = onRefine;
        this.result = result;
    }

    refine(lookupFrequencies: (number|null)[], lookupResults: LookupResult[]): Promise<ENFAnalysisResult[]> {
        if (this.onRefine) {
            this.onRefine(lookupResults)
        }
        return Promise.resolve(this.result);
    }

}
