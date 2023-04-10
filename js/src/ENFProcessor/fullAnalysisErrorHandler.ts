import {ENFAnalysis} from "../model/ENFAnalysis";
import {NoMatch} from "./noMatch";

export class FullAnalysisErrorHandler {
    private analysis: ENFAnalysis;

    constructor(analysis: ENFAnalysis) {
        this.analysis = analysis;
    }

    handleError(e: Error) {
        if (e instanceof NoMatch) {
            this.analysis.noMatchReason = e.noMatchReason;
        } else {
            console.error(e);
            throw e;
        }
    }
}
