import { ENFEventBase } from "../events/ENFEventBase";
export class MockAnalyzeComponent {
    constructor(onAnalyze, result) {
        this.analyzeProgressEvent = new ENFEventBase();
        this.implementationId = "MockAnalyzeComponent";
        this.onAnalyze = onAnalyze;
        this.result = result || [];
    }
    analyze(resourceUri, preScanResult) {
        if (this.onAnalyze) {
            this.onAnalyze(resourceUri, preScanResult);
        }
        return Promise.resolve(this.result);
    }
}
