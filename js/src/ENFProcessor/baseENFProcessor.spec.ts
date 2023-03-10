import {BaseENFProcessor} from "./baseENFProcessor";
import {MockPreScanComponent} from "./mocks/mockPreScanComponent.mock";
import {MockAnalyzeComponent} from "./mocks/mockAnalyzeComponent.mock";
import {MockLookupComponent} from "./mocks/mockLookupComponent.mock";
import {MockReduceComponent} from "./mocks/mockReduceComponent.mock";
import {MockRefineComponent} from "./mocks/mockRefineComponent.mock";
import {AnalysisWindowResult} from "../model/analysisWindowResult";
import {LookupResult} from "../model/lookupResult";

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
});
