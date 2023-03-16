import {AnalyzeComponent} from "../../analyze/analyzeComponent";
import {ENFEventBase} from "../events/ENFEventBase";
import {AnalysisWindowResult} from "../../model/analysisWindowResult";
import {PreScanResultLike} from "../../model/preScanResultLike";

export class MockAnalyzeComponent implements AnalyzeComponent {
    private readonly onAnalyze?: ((resourceUri:string, preScanResult?: PreScanResultLike) => void);
    private readonly result: AnalysisWindowResult[];
    constructor(onAnalyze?:(resourceUri:string, preScanResult?: PreScanResultLike) => void, result?: AnalysisWindowResult[]) {
        this.onAnalyze = onAnalyze;
        this.result = result || [];
    }

    analyzeProgressEvent: ENFEventBase<[AnalysisWindowResult, number]> = new ENFEventBase<[AnalysisWindowResult, number]>();

    readonly implementationId: string = "MockAnalyzeComponent";

    analyze(resourceUri: string, preScanResult?: PreScanResultLike): Promise<AnalysisWindowResult[]> {
        if (this.onAnalyze) {
            this.onAnalyze(resourceUri, preScanResult)
        }
        return Promise.resolve(this.result);
    }

}
