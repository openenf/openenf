import {PreScanResult} from "../model/preScanResult";
import {AnalyzeComponent} from "./analyzeComponent";
import {ENFEventBase} from "../ENFProcessor/events/ENFEventBase";
import {AnalysisWindowResult} from "../model/analysisWindowResult";

export class AudioContextAnalyzeComponent implements AnalyzeComponent {
    readonly implementationId: string = "AudioContextAnalyzeComponent1.0.0";

    analyze(resourceUri: string, preScanResult?: PreScanResult): Promise<AnalysisWindowResult[]> {
        return Promise.resolve([]);
    }

    analyzeProgressEvent: ENFEventBase<[(number | AnalysisWindowResult)]> = new ENFEventBase();
}
