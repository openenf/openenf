"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockAnalyzeComponent = void 0;
const ENFEventBase_1 = require("../events/ENFEventBase");
class MockAnalyzeComponent {
    constructor(onAnalyze, result) {
        this.analyzeProgressEvent = new ENFEventBase_1.ENFEventBase();
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
exports.MockAnalyzeComponent = MockAnalyzeComponent;
