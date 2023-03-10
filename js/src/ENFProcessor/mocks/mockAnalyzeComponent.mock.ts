import {AnalyzeComponent} from "../../analyze/analyzeComponent";
import {ENFEventBase} from "../events/ENFEventBase";
import {AnalysisWindowResult} from "../../model/analysisWindowResult";
import {PreScanResult} from "../../model/preScanResult";

export class MockAnalyzeComponent implements AnalyzeComponent {
    private readonly onAnalyze?: ((resourceUri:string, preScanResult?: PreScanResult) => void);
    private readonly result: AnalysisWindowResult[];
    constructor(onAnalyze?:(resourceUri:string, preScanResult?: PreScanResult) => void, result?: AnalysisWindowResult[]) {
        this.onAnalyze = onAnalyze;
        this.result = result || [];
    }

    analyzeProgressEvent: ENFEventBase<[(number | AnalysisWindowResult)]> = new ENFEventBase<[(number | AnalysisWindowResult)]>();

    readonly implementationId: string = "MockAnalyzeComponent";

    analyze(resourceUri: string, preScanResult?: PreScanResult): Promise<AnalysisWindowResult[]> {
        if (this.onAnalyze) {
            this.onAnalyze(resourceUri, preScanResult)
        }
        return Promise.resolve(this.result);
    }

}
