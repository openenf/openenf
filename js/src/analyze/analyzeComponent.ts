import {ENFComponent} from "../ENFProcessor/ENFComponent";
import {PreScanResultLike} from "../model/preScanResultLike";
import {ENFEventBase} from "../ENFProcessor/events/ENFEventBase";
import {PreScanUpdate} from "../model/preScanUpdate";
import {AnalysisWindowResult} from "../model/analysisWindowResult";

/**
 * Provides analyze function for an {@link ENFProcessor}
 */
export interface AnalyzeComponent extends ENFComponent {
    analyzeProgressEvent: ENFEventBase<[AnalysisWindowResult, number]>;
    analyze(resourceUri: string, preScanResult: PreScanResultLike, expectedFrequency?:50|60): Promise<AnalysisWindowResult[]>
}

