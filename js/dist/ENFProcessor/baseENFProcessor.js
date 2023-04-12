import { ENFAnalysis } from "../model/ENFAnalysis";
import { ENFEventBase } from "./events/ENFEventBase";
import { FullAnalysisErrorHandler } from "./fullAnalysisErrorHandler";
import { StageDurations } from "../model/StageDurations";
export class BaseENFProcessor {
    constructor(preScanComponent, analyzeComponent, reduceComponent, lookupComponent, refineComponent) {
        this.progressEvent = new ENFEventBase();
        this.fullAnalysisCompleteEvent = new ENFEventBase();
        this.onPreScanProgressEvent = new ENFEventBase();
        this.onPreScanCompleteEvent = new ENFEventBase();
        this.onAnalyzeProgressEvent = new ENFEventBase();
        this.onAnalyzeCompleteEvent = new ENFEventBase();
        this.onReduceCompleteEvent = new ENFEventBase();
        this.lookupProgressEvent = new ENFEventBase();
        this.logEvent = new ENFEventBase();
        this.onLookupCompleteEvent = new ENFEventBase();
        this.onRefineCompleteEvent = new ENFEventBase();
        this.preScanComponent = preScanComponent;
        this.preScanComponent.preScanProgressEvent = this.onPreScanProgressEvent;
        this.onPreScanProgressEvent.addHandler(data => {
            if (data != undefined) {
                this.progressEvent.trigger(data[1] / 3);
            }
        });
        this.analyzeComponent = analyzeComponent;
        this.analyzeComponent.analyzeProgressEvent = this.onAnalyzeProgressEvent;
        this.onAnalyzeProgressEvent.addHandler(data => {
            if (data != undefined) {
                this.progressEvent.trigger((1 / 3) + (data[1] / 3));
            }
        });
        this.reduceComponent = reduceComponent;
        this.lookupComponent = lookupComponent;
        this.lookupComponent.lookupProgressEvent = this.lookupProgressEvent;
        this.lookupProgressEvent.addHandler(progress => {
            if (progress !== undefined) {
                this.progressEvent.trigger((2 / 3) + (progress / 3));
            }
        });
        this.refineComponent = refineComponent;
    }
    closeOutENFAnalysis(enfAnalysis) {
        enfAnalysis.analysisEndTime = new Date();
        enfAnalysis.preScanImplementationId = this.preScanComponent.implementationId;
        enfAnalysis.analyseImplementationId = this.analyzeComponent.implementationId;
        enfAnalysis.reduceImplementationId = this.reduceComponent.implementationId;
        enfAnalysis.lookupImplementationId = this.lookupComponent.implementationId;
        enfAnalysis.refineImplementationId = this.refineComponent.implementationId;
        this.fullAnalysisCompleteEvent.trigger(enfAnalysis);
        enfAnalysis.durations = new StageDurations(enfAnalysis.analysisStartTime, enfAnalysis.completionTimes);
        if (enfAnalysis.noMatchReason) {
            this.logEvent.trigger(`Ending ENF analysis early because: ${enfAnalysis.noMatchReason}`);
        }
        return enfAnalysis;
    }
    toIsoDate(date) {
        if (date === undefined || date === null) {
            return 'unspecified';
        }
        return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
            .toISOString()
            .split("T")[0];
    }
    async performFullAnalysis(resourceUri, gridIds, from, to, expectedFrequency) {
        this.logEvent.trigger(`Starting analysis for resource: ${resourceUri}, grids: [${gridIds.join(',')}], from ${this.toIsoDate(from)} to ${this.toIsoDate(to)}`);
        const enfAnalysis = new ENFAnalysis(resourceUri);
        enfAnalysis.start = from || null;
        enfAnalysis.end = to || null;
        enfAnalysis.gridIds = gridIds;
        const errorHandler = new FullAnalysisErrorHandler(enfAnalysis);
        this.logEvent.trigger(`Pre-scanning resource...`);
        enfAnalysis.preScanResult = await this.preScan(resourceUri);
        this.logEvent.trigger(`Pre-scan complete.`);
        enfAnalysis.completionTimes.preScan = new Date();
        this.logEvent.trigger(`Obtaining frequency data...`);
        const analysisResult = await this.analyze(resourceUri, enfAnalysis.preScanResult, expectedFrequency).catch(function (e) { errorHandler.handleError(e); });
        enfAnalysis.analysisResult = analysisResult || null;
        enfAnalysis.completionTimes.analyze = new Date();
        if (!enfAnalysis.analysisResult) {
            return this.closeOutENFAnalysis(enfAnalysis);
        }
        this.logEvent.trigger(`Analysing frequency data...`);
        const frequencies = await this.reduce(enfAnalysis.analysisResult).catch(function (e) { errorHandler.handleError(e); });
        enfAnalysis.frequencies = frequencies || null;
        enfAnalysis.completionTimes.reduce = new Date();
        if (!enfAnalysis.frequencies) {
            return this.closeOutENFAnalysis(enfAnalysis);
        }
        this.logEvent.trigger(`Frequency analysis complete.`);
        this.logEvent.trigger(`Comparing frequencies to grid data...`);
        const lookupResults = await this.lookup(enfAnalysis.frequencies, gridIds, from, to).catch(function (e) { errorHandler.handleError(e); });
        enfAnalysis.lookupResults = lookupResults || null;
        enfAnalysis.completionTimes.lookup = new Date();
        if (!enfAnalysis.lookupResults) {
            return this.closeOutENFAnalysis(enfAnalysis);
        }
        this.logEvent.trigger(`Refining results...`);
        enfAnalysis.ENFAnalysisResults = await this.refine(enfAnalysis.frequencies, enfAnalysis.lookupResults);
        enfAnalysis.completionTimes.refine = new Date();
        this.logEvent.trigger(`ENF analysis complete.`);
        return this.closeOutENFAnalysis(enfAnalysis);
    }
    /*PreScan*/
    async preScan(resourceUri) {
        const result = await this.preScanComponent.preScan(resourceUri);
        this.onPreScanCompleteEvent.trigger(result);
        return result;
    }
    /*Analyze*/
    async analyze(resourceUri, preScanResult, expectedFrequency) {
        const result = await this.analyzeComponent.analyze(resourceUri, preScanResult, expectedFrequency);
        this.onAnalyzeCompleteEvent.trigger(result);
        return result;
    }
    /*Reduce*/
    async reduce(analysisResults) {
        const result = await this.reduceComponent.reduce(analysisResults);
        this.onReduceCompleteEvent.trigger(result);
        return result;
    }
    /*Lookup*/
    async lookup(freqs, gridIds, from, to) {
        const result = await this.lookupComponent.lookup(freqs, gridIds, from, to);
        this.onLookupCompleteEvent.trigger(result);
        return result;
    }
    /*Refine*/
    async refine(lookupFrequencies, lookupResults) {
        const result = await this.refineComponent.refine(lookupFrequencies, lookupResults);
        this.onRefineCompleteEvent.trigger(result);
        return result;
    }
}