import { AnalyzeComponent } from "../../analyze/analyzeComponent";
import { ENFEventBase } from "../events/ENFEventBase";
import { AnalysisWindowResult } from "../../model/analysisWindowResult";
import { PreScanResultLike } from "../../model/preScanResultLike";
export declare class MockAnalyzeComponent implements AnalyzeComponent {
    private readonly onAnalyze?;
    private readonly result;
    constructor(onAnalyze?: (resourceUri: string, preScanResult?: PreScanResultLike) => void, result?: AnalysisWindowResult[]);
    analyzeProgressEvent: ENFEventBase<[AnalysisWindowResult, number]>;
    readonly implementationId: string;
    analyze(resourceUri: string, preScanResult?: PreScanResultLike): Promise<AnalysisWindowResult[]>;
}
