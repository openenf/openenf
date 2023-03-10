import {ENFComponent} from "../ENFProcessor/ENFComponent";
import {PreScanResult} from "../model/preScanResult";
import {ENFEventBase} from "../ENFProcessor/events/ENFEventBase";
import {PreScanUpdate} from "../model/preScanUpdate";
import {AnalysisWindowResult} from "../model/analysisWindowResult";

/**
 * Provides analyze function for an {@link ENFProcessor}
 */
export interface AnalyzeComponent extends ENFComponent {
    analyzeProgressEvent: ENFEventBase<[(number | AnalysisWindowResult)]>;
    analyze(resourceUri: string, preScanResult?: PreScanResult): Promise<AnalysisWindowResult[]>
}

