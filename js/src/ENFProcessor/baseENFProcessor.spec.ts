import {BaseENFProcessor} from "./baseENFProcessor";
import {MockPreScanComponent} from "./mocks/mockPreScanComponent.mock";
import {MockAnalyzeComponent} from "./mocks/mockAnalyzeComponent.mock";
import {MockLookupComponent} from "./mocks/mockLookupComponent.mock";
import {MockReduceComponent} from "./mocks/mockReduceComponent.mock";
import {MockRefineComponent} from "./mocks/mockRefineComponent.mock";
import {AnalysisWindowResult} from "../model/analysisWindowResult";
import {LookupResult} from "../model/lookupResult";
import {NoMatch} from "./noMatch";
import {NoMatchReason} from "../model/noMatchReason";
import {PreScanResult} from "../model/preScanResult";
import {ENFAnalysisResult} from "../model/ENFAnalysisResult";

describe('BaseAnalyzer', () => {
    it('Sends data to preScan component when fullAnalysis invoked', async () => {
        let urlReceived = "";
        const mockPreScanComponent = new MockPreScanComponent(url => {
            urlReceived = url;
        })
        const baseAnalyzer = new BaseENFProcessor(
            mockPreScanComponent,
            new MockAnalyzeComponent(),
            new MockReduceComponent(),
            new MockLookupComponent(),
            new MockRefineComponent())
        await baseAnalyzer.performFullAnalysis("TEST_URL",[]);
        expect(urlReceived).toBe("TEST_URL");
    })
    it('Sends data to analysis component when fullAnalysisInvoked', async () => {
        const preScanResult = {
            h50:50,h100:100,h200:200,h60:60,h120:120,h240:240
        }
        let eventFired = false;
        const baseAnalyzer = new BaseENFProcessor(
            new MockPreScanComponent(undefined, preScanResult),
            new MockAnalyzeComponent((url, result) => {
                expect(url).toBe("TEST_URL");
                expect(result).toBe(preScanResult)
                eventFired = true;
            }),
            new MockReduceComponent(),
            new MockLookupComponent(),
            new MockRefineComponent())
        await baseAnalyzer.performFullAnalysis("TEST_URL",[]);
        expect(eventFired).toBe(true);
    })
    it('Sends data to reduce component when fullAnalysisInvoked', async () => {
        let eventFired = false;
        const analysisResult: AnalysisWindowResult[] = []
        const baseAnalyzer = new BaseENFProcessor(
            new MockPreScanComponent(),
            new MockAnalyzeComponent(undefined, analysisResult),
            new MockReduceComponent(windowResult => {
                expect(windowResult).toBe(analysisResult);
                eventFired = true;
            }),
            new MockLookupComponent(),
            new MockRefineComponent())
        await baseAnalyzer.performFullAnalysis("TEST_URL",[]);
        expect(eventFired).toBe(true);
    })
    it('Sends data to lookup component when fullAnalysisInvoked', async () => {
        let eventFired = false;
        const reduceResult = [1,2,3];
        const gridIds = ["DE","GB"]
        const from = new Date("2010-01-01")
        const to = new Date("2030-01-01")
        const baseAnalyzer = new BaseENFProcessor(
            new MockPreScanComponent(),
            new MockAnalyzeComponent(),
            new MockReduceComponent(undefined, reduceResult),
            new MockLookupComponent((arg1,arg2,arg3,arg4) => {
                expect(arg1).toBe(reduceResult)
                expect(arg2).toBe(gridIds)
                expect(arg3).toBe(from)
                expect(arg4).toBe(to)
                eventFired = true;
            }),
            new MockRefineComponent())
        await baseAnalyzer.performFullAnalysis("TEST_URL", gridIds, from, to);
        expect(eventFired).toBe(true);
    })
    it('Sends data to refine component when fullAnalysisInvoked', async () => {
        let eventFired = false;
        const lookupResult:LookupResult[] = [];
        const baseAnalyzer = new BaseENFProcessor(
            new MockPreScanComponent(),
            new MockAnalyzeComponent(),
            new MockReduceComponent(),
            new MockLookupComponent(undefined, lookupResult),
            new MockRefineComponent(arg1 => {
                expect(arg1).toBe(lookupResult);
                eventFired = true;
            })
        )
        await baseAnalyzer.performFullAnalysis("TEST_URL",[]);
        expect(eventFired).toBe(true);
    })
    it('Fires onPreScan complete event', async () => {
        let eventFired = false;
        const baseAnalyzer = new BaseENFProcessor(
            new MockPreScanComponent(),
            new MockAnalyzeComponent(),
            new MockReduceComponent(),
            new MockLookupComponent(),
            new MockRefineComponent())
        baseAnalyzer.onPreScanCompleteEvent.addHandler(_result => {
            eventFired = true;
        })
        await baseAnalyzer.performFullAnalysis("TEST_URL",[]);
        expect(eventFired).toBe(true);
    })
    it('Fires onAnalyzeComplete event', async () => {
        let eventFired = false;
        const baseAnalyzer = new BaseENFProcessor(
            new MockPreScanComponent(),
            new MockAnalyzeComponent(),
            new MockReduceComponent(),
            new MockLookupComponent(),
            new MockRefineComponent())
        baseAnalyzer.onAnalyzeCompleteEvent.addHandler(_result => {
            eventFired = true;
        })
        await baseAnalyzer.performFullAnalysis("TEST_URL",[]);
        expect(eventFired).toBe(true);
    })
    it('Fires onReduceComplete event', async () => {
        let eventFired = false;
        const baseAnalyzer = new BaseENFProcessor(
            new MockPreScanComponent(),
            new MockAnalyzeComponent(),
            new MockReduceComponent(),
            new MockLookupComponent(),
            new MockRefineComponent())
        baseAnalyzer.onReduceCompleteEvent.addHandler(_result => {
            eventFired = true;
        })
        await baseAnalyzer.performFullAnalysis("TEST_URL",[]);
        expect(eventFired).toBe(true);
    })
    it('Fires onLookupComplete event', async () => {
        let eventFired = false;
        const baseAnalyzer = new BaseENFProcessor(
            new MockPreScanComponent(),
            new MockAnalyzeComponent(),
            new MockReduceComponent(),
            new MockLookupComponent(),
            new MockRefineComponent())
        baseAnalyzer.onLookupCompleteEvent.addHandler(_result => {
            eventFired = true;
        })
        await baseAnalyzer.performFullAnalysis("TEST_URL",[]);
        expect(eventFired).toBe(true);
    })
    it('Fires onRefineComplete event', async () => {
        let eventFired = false;
        const baseAnalyzer = new BaseENFProcessor(
            new MockPreScanComponent(),
            new MockAnalyzeComponent(),
            new MockReduceComponent(),
            new MockLookupComponent(),
            new MockRefineComponent())
        baseAnalyzer.onRefineCompleteEvent.addHandler(_result => {
            eventFired = true;
        })
        await baseAnalyzer.performFullAnalysis("TEST_URL",[]);
        expect(eventFired).toBe(true);
    })
    it('Can adds default properties ENFAnalysisResult ', async () => {
        const baseAnalyzer = new BaseENFProcessor(
            new MockPreScanComponent(),
            new MockAnalyzeComponent(),
            new MockReduceComponent(),
            new MockLookupComponent(),
            new MockRefineComponent())
        const result = await baseAnalyzer.performFullAnalysis("TEST_URL",[]);
        expect(result.analysisStartTime?.getTime()).toBeCloseTo(new Date().getTime(), -1);
        expect(result.analysisEndTime?.getTime()).toBeCloseTo(new Date().getTime(), -1);
        expect(result.error).toBeNull();
        expect(result.noMatchReason).toBeNull();
        expect(result.preScanImplementationId).toBe(new MockPreScanComponent().implementationId);
        expect(result.analyseImplementationId).toBe(new MockAnalyzeComponent().implementationId);
        expect(result.reduceImplementationId).toBe(new MockReduceComponent().implementationId);
        expect(result.lookupImplementationId).toBe(new MockLookupComponent().implementationId);
        expect(result.refineImplementationId).toBe(new MockRefineComponent().implementationId);
        expect(result.uri).toBe("TEST_URL");
        console.log('result', result);
    })
    it('Can handle NoMatch at analyze stage', async () => {
        const analyzeComponentThrowsError = new MockAnalyzeComponent(() => {
            throw new NoMatch(NoMatchReason.DominantFifty);
        })
        const baseAnalyzer = new BaseENFProcessor(
            new MockPreScanComponent(),
            analyzeComponentThrowsError,
            new MockReduceComponent(),
            new MockLookupComponent(),
            new MockRefineComponent())
        const result = await baseAnalyzer.performFullAnalysis("TEST_URL",[]);
        expect(result.noMatchReason).toBe(NoMatchReason.DominantFifty);
        expect(result.analysisEndTime?.getTime()).toBeCloseTo(new Date().getTime(), -1);
    })
    it('Can handle NoMatch at reduce stage', async () => {
        const reduceComponentThrowsError = new MockReduceComponent(() => {
            throw new NoMatch(NoMatchReason.NoStrongSignal);
        })
        const baseAnalyzer = new BaseENFProcessor(
            new MockPreScanComponent(),
            new MockAnalyzeComponent(),
            reduceComponentThrowsError,
            new MockLookupComponent(),
            new MockRefineComponent())
        const result = await baseAnalyzer.performFullAnalysis("TEST_URL",[]);
        expect(result.noMatchReason).toBe(NoMatchReason.NoStrongSignal);
        expect(result.analysisEndTime?.getTime()).toBeCloseTo(new Date().getTime(), -1);
    })
    it('Can handle NoMatch at lookup stage', async () => {
        const lookupComponentThrowsError = new MockLookupComponent(() => {
            throw new NoMatch(NoMatchReason.NoResultsOnLookup);
        })
        const baseAnalyzer = new BaseENFProcessor(
            new MockPreScanComponent(),
            new MockAnalyzeComponent(),
            new MockReduceComponent(),
            lookupComponentThrowsError,
            new MockRefineComponent())
        const result = await baseAnalyzer.performFullAnalysis("TEST_URL",[]);
        expect(result.noMatchReason).toBe(NoMatchReason.NoResultsOnLookup);
        expect(result.analysisEndTime?.getTime()).toBeCloseTo(new Date().getTime(), -1);
    })
    it('Attaches stage result to ENFAnalysis at lookup stage', async () => {
        const preScanResult:PreScanResult = {
            h50:0, h100:0, h200:0, h60:0, h120:0, h240:0
        };
        const analyzeResult:AnalysisWindowResult[] = [];
        const reduceResult:number[] = [];
        const lookupResult:LookupResult[] = [];
        const refineResult:ENFAnalysisResult[] = [];

        const preScanComponent = new MockPreScanComponent(undefined, preScanResult);
        const analyzeComponent = new MockAnalyzeComponent(undefined, analyzeResult);
        const reduceComponent = new MockReduceComponent(undefined, reduceResult);
        const lookupComponent = new MockLookupComponent(undefined, lookupResult);
        const refineComponent = new MockRefineComponent(undefined, refineResult);
        const baseAnalyzer = new BaseENFProcessor(
            preScanComponent,
            analyzeComponent,
            reduceComponent,
            lookupComponent,
            refineComponent)
        const result = await baseAnalyzer.performFullAnalysis("TEST_URL",[]);
        expect(result.preScanResult).toBe(preScanResult);
        expect(result.analysisResult).toBe(analyzeResult);
        expect(result.frequencies).toBe(reduceResult);
        expect(result.lookupResults).toBe(lookupResult);
        expect(result.ENFAnalysisResults).toBe(refineResult);
    })
});
