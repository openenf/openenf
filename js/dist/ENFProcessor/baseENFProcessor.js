"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseENFProcessor = void 0;
const ENFAnalysis_1 = require("../model/ENFAnalysis");
const ENFEventBase_1 = require("./events/ENFEventBase");
const fullAnalysisErrorHandler_1 = require("./fullAnalysisErrorHandler");
const StageDurations_1 = require("../model/StageDurations");
const noMatchReason_1 = require("../model/noMatchReason");
class BaseENFProcessor {
    constructor(preScanComponent, analyzeComponent, reduceComponent, lookupComponent, refineComponent, dispose) {
        this.progressEvent = new ENFEventBase_1.ENFEventBase();
        this.fullAnalysisCompleteEvent = new ENFEventBase_1.ENFEventBase();
        this.onPreScanProgressEvent = new ENFEventBase_1.ENFEventBase();
        this.onPreScanCompleteEvent = new ENFEventBase_1.ENFEventBase();
        this.onAnalyzeProgressEvent = new ENFEventBase_1.ENFEventBase();
        this.onAnalyzeCompleteEvent = new ENFEventBase_1.ENFEventBase();
        this.onReduceCompleteEvent = new ENFEventBase_1.ENFEventBase();
        this.lookupProgressEvent = new ENFEventBase_1.ENFEventBase();
        this.logEvent = new ENFEventBase_1.ENFEventBase();
        this.onLookupCompleteEvent = new ENFEventBase_1.ENFEventBase();
        this.onRefineCompleteEvent = new ENFEventBase_1.ENFEventBase();
        this.disposeFunction = dispose;
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
        enfAnalysis.durations = new StageDurations_1.StageDurations(enfAnalysis.analysisStartTime, enfAnalysis.completionTimes);
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
        const enfAnalysis = new ENFAnalysis_1.ENFAnalysis(resourceUri);
        enfAnalysis.start = from || null;
        enfAnalysis.end = to || null;
        enfAnalysis.gridIds = gridIds;
        const errorHandler = new fullAnalysisErrorHandler_1.FullAnalysisErrorHandler(enfAnalysis);
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
        let lookupResults = await this.lookup(enfAnalysis.frequencies, gridIds, from, to).catch(function (e) { errorHandler.handleError(e); });
        if (!lookupResults?.length) {
            lookupResults = undefined;
            enfAnalysis.noMatchReason = noMatchReason_1.NoMatchReason.NoResultsOnLookup;
        }
        ;
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
    async dispose() {
        if (this.disposeFunction) {
            this.disposeFunction();
        }
    }
}
exports.BaseENFProcessor = BaseENFProcessor;
