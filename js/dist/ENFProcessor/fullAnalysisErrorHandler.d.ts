import { ENFAnalysis } from "../model/ENFAnalysis";
export declare class FullAnalysisErrorHandler {
    private analysis;
    constructor(analysis: ENFAnalysis);
    handleError(e: Error): void;
}
