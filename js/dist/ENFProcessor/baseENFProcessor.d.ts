import { ENFProcessor } from "./ENFProcessor";
import { LookupResult } from "../model/lookupResult";
import { AnalysisWindowResult } from "../model/analysisWindowResult";
import { ENFAnalysis } from "../model/ENFAnalysis";
import { ENFAnalysisResult } from "../model/ENFAnalysisResult";
import { PreScanResultLike } from "../model/preScanResultLike";
import { PreScanUpdate } from "../model/preScanUpdate";
import { ENFEventBase } from "./events/ENFEventBase";
import { LookupComponent } from "../lookup/lookupComponent";
import { RefineComponent } from "../refine/refineComponent";
import { PreScanComponent } from "../preScan/preScanComponent";
import { AnalyzeComponent } from "../analyze/analyzeComponent";
import { ReduceComponent } from "../reduce/reduceComponent";
export declare class BaseENFProcessor implements ENFProcessor {
    /** @internal */
    lookupComponent: LookupComponent;
    /** @internal */
    refineComponent: RefineComponent;
    /** @internal */
    preScanComponent: PreScanComponent;
    /** @internal */
    analyzeComponent: AnalyzeComponent;
    /** @internal */
    reduceComponent: ReduceComponent;
    constructor(preScanComponent: PreScanComponent, analyzeComponent: AnalyzeComponent, reduceComponent: ReduceComponent, lookupComponent: LookupComponent, refineComponent: RefineComponent);
    closeOutENFAnalysis(enfAnalysis: ENFAnalysis): ENFAnalysis;
    private toIsoDate;
    performFullAnalysis(resourceUri: string, gridIds: string[], from?: Date, to?: Date, expectedFrequency?: 50 | 60): Promise<ENFAnalysis>;
    analysisProgressEvent: ENFEventBase<number>;
    fullAnalysisCompleteEvent: ENFEventBase<ENFAnalysis>;
    preScan(resourceUri: string): Promise<PreScanResultLike>;
    onPreScanProgressEvent: ENFEventBase<[PreScanUpdate, number]>;
    onPreScanCompleteEvent: ENFEventBase<PreScanResultLike>;
    analyze(resourceUri: string, preScanResult: PreScanResultLike, expectedFrequency: 50 | 60 | undefined): Promise<AnalysisWindowResult[]>;
    onAnalyzeProgressEvent: ENFEventBase<[AnalysisWindowResult, number]>;
    onAnalyzeCompleteEvent: ENFEventBase<AnalysisWindowResult[]>;
    reduce(analysisResults: AnalysisWindowResult[]): Promise<(number | null)[]>;
    onReduceCompleteEvent: ENFEventBase<(number | null)[]>;
    lookup(freqs: (number | null)[], gridIds: string[], from?: Date, to?: Date): Promise<LookupResult[]>;
    lookupProgressEvent: ENFEventBase<number>;
    logEvent: ENFEventBase<string>;
    onLookupCompleteEvent: ENFEventBase<LookupResult[]>;
    refine(lookupFrequencies: (number | null)[], lookupResults: LookupResult[]): Promise<ENFAnalysisResult[]>;
    onRefineCompleteEvent: ENFEventBase<ENFAnalysisResult[]>;
}
