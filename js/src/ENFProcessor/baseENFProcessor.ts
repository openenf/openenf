import {ENFProcessor} from "./ENFProcessor";
import {LookupResult} from "../model/lookupResult";
import {AnalysisWindowResult} from "../model/analysisWindowResult";
import {ENFAnalysis} from "../model/ENFAnalysis";
import {ENFAnalysisResult} from "../model/ENFAnalysisResult";
import {PreScanResult} from "../model/preScanResult";
import {PreScanUpdate} from "../model/preScanUpdate";
import {ENFEventBase} from "./events/ENFEventBase";
import {LookupComponent} from "../lookup/lookupComponent";
import {RefineComponent} from "../refine/refineComponent";
import {PreScanComponent} from "../preScan/preScanComponent";
import {AnalyzeComponent} from "../analyze/analyzeComponent";
import {ReduceComponent} from "../reduce/reduceComponent";

export class BaseENFProcessor implements ENFProcessor {

    /** @internal */
    public lookupComponent: LookupComponent;

    /** @internal */
    public refineComponent: RefineComponent;

    /** @internal */
    public preScanComponent: PreScanComponent;

    /** @internal */
    public analyzeComponent: AnalyzeComponent;

    /** @internal */
    public reduceComponent: ReduceComponent;

    constructor(preScanComponent: PreScanComponent,
                analyzeComponent: AnalyzeComponent,
                reduceComponent: ReduceComponent,
                lookupComponent: LookupComponent,
                refineComponent: RefineComponent) {
        this.preScanComponent = preScanComponent
        this.preScanComponent.preScanProgressEvent = this.onPreScanProgressEvent
        this.analyzeComponent = analyzeComponent
        this.analyzeComponent.analyzeProgressEvent = this.onAnalyzeProgressEvent
        this.reduceComponent = reduceComponent
        this.lookupComponent = lookupComponent
        this.lookupComponent.lookupProgressEvent = this.lookupProgressEvent
        this.refineComponent = refineComponent
    }

    async performFullAnalysis(resourceUri: string, gridIds: string[], from?: Date, to?: Date): Promise<ENFAnalysis> {
        const enfAnalysis = new ENFAnalysis(resourceUri);
        enfAnalysis.preScanResult = await this.preScan(resourceUri);
        enfAnalysis.analysisResult = await this.analyze(resourceUri, enfAnalysis.preScanResult);
        enfAnalysis.frequencies = await this.reduce(enfAnalysis.analysisResult);
        enfAnalysis.lookupResults = await this.lookup(enfAnalysis.frequencies, gridIds, from, to);
        enfAnalysis.ENFAnalysisResults = await this.refine(enfAnalysis.lookupResults)
        return enfAnalysis;
    }

    analysisProgressEvent: ENFEventBase<number> = new ENFEventBase<number>();
    fullAnalysisCompleteEvent: ENFEventBase<ENFAnalysis> = new ENFEventBase<ENFAnalysis>();

    /*PreScan*/
    async preScan(resourceUri: string): Promise<PreScanResult> {
        const result = await this.preScanComponent.preScan(resourceUri)
        this.onPreScanCompleteEvent.trigger(result);
        return result;
    }
    onPreScanProgressEvent: ENFEventBase<[PreScanUpdate, number]> = new ENFEventBase<[PreScanUpdate, number]>();
    onPreScanCompleteEvent: ENFEventBase<PreScanResult> = new ENFEventBase<PreScanResult>();

    /*Analyze*/
    async analyze(resourceUri: string, preScanResult?: PreScanResult): Promise<AnalysisWindowResult[]> {
        const result = await this.analyzeComponent.analyze(resourceUri, preScanResult);
        this.onAnalyzeCompleteEvent.trigger(result);
        return result;
    }
    onAnalyzeProgressEvent: ENFEventBase<[number | AnalysisWindowResult]> = new ENFEventBase<[(number | AnalysisWindowResult)]>();
    onAnalyzeCompleteEvent: ENFEventBase<AnalysisWindowResult[]> = new ENFEventBase<AnalysisWindowResult[]>()

    /*Reduce*/
    async reduce(analysisResults: AnalysisWindowResult[]): Promise<(number|null)[]> {
        const result = await this.reduceComponent.reduce(analysisResults);
        this.onReduceCompleteEvent.trigger(result);
        return result;
    }
    onReduceCompleteEvent: ENFEventBase<(number|null)[]> = new ENFEventBase<(number|null)[]>()

    /*Lookup*/
    async lookup(freqs: (number|null)[], gridIds: string[], from?: Date, to?: Date): Promise<LookupResult[]> {
        const result = await this.lookupComponent.lookup(freqs,gridIds,from,to);
        this.onLookupCompleteEvent.trigger(result);
        return result;
    }
    lookupProgressEvent: ENFEventBase<number> = new ENFEventBase<number>()
    onLookupCompleteEvent: ENFEventBase<LookupResult[]> = new ENFEventBase<LookupResult[]>()

    /*Refine*/
    async refine(lookupResults: LookupResult[]): Promise<ENFAnalysisResult[]> {
        const result = await this.refineComponent.refine(lookupResults);
        this.onRefineCompleteEvent.trigger(result);
        return result;
    }
    onRefineCompleteEvent: ENFEventBase<ENFAnalysisResult[]> = new ENFEventBase<ENFAnalysisResult[]>()
}
