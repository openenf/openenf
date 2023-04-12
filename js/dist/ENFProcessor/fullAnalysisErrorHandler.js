import { NoMatch } from "./noMatch";
export class FullAnalysisErrorHandler {
    constructor(analysis) {
        this.analysis = analysis;
    }
    handleError(e) {
        if (e instanceof NoMatch) {
            this.analysis.noMatchReason = e.noMatchReason;
        }
        else {
            console.error(e);
            throw e;
        }
    }
}
