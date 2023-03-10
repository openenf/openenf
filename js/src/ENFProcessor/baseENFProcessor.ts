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
import {FullAnalysisErrorHandler} from "./fullAnalysisErrorHandler";

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
        this.onPreScanProgressEvent.addHandler(data => {
            if (data != undefined) {
                this.analysisProgressEvent.trigger(data[1] / 3)
            }
        })
        this.analyzeComponent = analyzeComponent
        this.analyzeComponent.analyzeProgressEvent = this.onAnalyzeProgressEvent
        this.onAnalyzeProgressEvent.addHandler(data => {
            if (data != undefined) {
                this.analysisProgressEvent.trigger((1/3) + (data[1] / 3));
            }
        })
        this.reduceComponent = reduceComponent
        this.lookupComponent = lookupComponent
        this.lookupComponent.lookupProgressEvent = this.lookupProgressEvent
        this.lookupProgressEvent.addHandler(progress => {
            if (progress !== undefined) {
                this.analysisProgressEvent.trigger((2/3) + (progress / 3));
            }
        })
        this.refineComponent = refineComponent
    }

    closeOutENFAnalysis(enfAnalysis:ENFAnalysis):ENFAnalysis {
        enfAnalysis.analysisEndTime = new Date();
        enfAnalysis.preScanImplementationId = this.preScanComponent.implementationId;
        enfAnalysis.analyseImplementationId = this.analyzeComponent.implementationId;
        enfAnalysis.reduceImplementationId = this.reduceComponent.implementationId;
        enfAnalysis.lookupImplementationId = this.lookupComponent.implementationId;
        enfAnalysis.refineImplementationId = this.refineComponent.implementationId;
        this.fullAnalysisCompleteEvent.trigger(enfAnalysis);
        return enfAnalysis;
    }

    async performFullAnalysis(resourceUri: string, gridIds: string[], from?: Date, to?: Date): Promise<ENFAnalysis> {
        const enfAnalysis = new ENFAnalysis(resourceUri);
        const errorHandler = new FullAnalysisErrorHandler(enfAnalysis);
        enfAnalysis.preScanResult = await this.preScan(resourceUri);
        const analysisResult = await this.analyze(resourceUri, enfAnalysis.preScanResult).catch(function(e) {errorHandler.handleError(e)})
        enfAnalysis.analysisResult = analysisResult || null;
        if (!enfAnalysis.analysisResult) {
            return this.closeOutENFAnalysis(enfAnalysis);
        }
        const frequencies = await this.reduce(enfAnalysis.analysisResult).catch(function(e) {errorHandler.handleError(e)})
        enfAnalysis.frequencies = frequencies || null;
        if (!enfAnalysis.frequencies) {
            return this.closeOutENFAnalysis(enfAnalysis)
        }
        const lookupResults = await this.lookup(enfAnalysis.frequencies, gridIds, from, to).catch(function(e) {errorHandler.handleError(e)})
        enfAnalysis.lookupResults = lookupResults || null;
        if (!enfAnalysis.lookupResults) {
            return this.closeOutENFAnalysis(enfAnalysis)
        }
        enfAnalysis.ENFAnalysisResults = await this.refine(enfAnalysis.lookupResults)
        return this.closeOutENFAnalysis(enfAnalysis);
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
    onAnalyzeProgressEvent: ENFEventBase<[AnalysisWindowResult, number]> = new ENFEventBase<[AnalysisWindowResult, number]>();
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
