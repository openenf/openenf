"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FullAnalysisErrorHandler = void 0;
const noMatch_1 = require("./noMatch");
class FullAnalysisErrorHandler {
    constructor(analysis) {
        this.analysis = analysis;
    }
    handleError(e) {
        if (e instanceof noMatch_1.NoMatch) {
            this.analysis.noMatchReason = e.noMatchReason;
        }
        else {
            console.error(e);
            throw e;
        }
    }
}
exports.FullAnalysisErrorHandler = FullAnalysisErrorHandler;
