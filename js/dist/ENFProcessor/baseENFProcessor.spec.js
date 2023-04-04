"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const baseENFProcessor_1 = require("./baseENFProcessor");
const mockPreScanComponent_mock_1 = require("./mocks/mockPreScanComponent.mock");
const mockAnalyzeComponent_mock_1 = require("./mocks/mockAnalyzeComponent.mock");
const mockLookupComponent_mock_1 = require("./mocks/mockLookupComponent.mock");
const mockReduceComponent_mock_1 = require("./mocks/mockReduceComponent.mock");
const mockRefineComponent_mock_1 = require("./mocks/mockRefineComponent.mock");
const noMatch_1 = require("./noMatch");
const noMatchReason_1 = require("../model/noMatchReason");
const ENFAnalysis_1 = require("../model/ENFAnalysis");
describe('BaseAnalyzer', () => {
    it('Sends data to preScan component when fullAnalysis invoked', async () => {
        let urlReceived = "";
        const mockPreScanComponent = new mockPreScanComponent_mock_1.MockPreScanComponent(url => {
            urlReceived = url;
        });
        const baseAnalyzer = new baseENFProcessor_1.BaseENFProcessor(mockPreScanComponent, new mockAnalyzeComponent_mock_1.MockAnalyzeComponent(), new mockReduceComponent_mock_1.MockReduceComponent(), new mockLookupComponent_mock_1.MockLookupComponent(), new mockRefineComponent_mock_1.MockRefineComponent());
        await baseAnalyzer.performFullAnalysis("TEST_URL", []);
        expect(urlReceived).toBe("TEST_URL");
    });
    it('Sends data to analysis component when fullAnalysisInvoked', async () => {
        const preScanResult = {
            duration: undefined,
            durationSamples: 0,
            h100: 0,
            h120: 0,
            h200: 0,
            h240: 0,
            h50: 0,
            h60: 0,
            numChannels: 0,
            sampleRate: 0
        };
        let eventFired = false;
        const baseAnalyzer = new baseENFProcessor_1.BaseENFProcessor(new mockPreScanComponent_mock_1.MockPreScanComponent(undefined, preScanResult), new mockAnalyzeComponent_mock_1.MockAnalyzeComponent((url, result) => {
            expect(url).toBe("TEST_URL");
            expect(result).toBe(preScanResult);
            eventFired = true;
        }), new mockReduceComponent_mock_1.MockReduceComponent(), new mockLookupComponent_mock_1.MockLookupComponent(), new mockRefineComponent_mock_1.MockRefineComponent());
        await baseAnalyzer.performFullAnalysis("TEST_URL", []);
        expect(eventFired).toBe(true);
    });
    it('Sends data to reduce component when fullAnalysisInvoked', async () => {
        let eventFired = false;
        const analysisResult = [];
        const baseAnalyzer = new baseENFProcessor_1.BaseENFProcessor(new mockPreScanComponent_mock_1.MockPreScanComponent(), new mockAnalyzeComponent_mock_1.MockAnalyzeComponent(undefined, analysisResult), new mockReduceComponent_mock_1.MockReduceComponent(windowResult => {
            expect(windowResult).toBe(analysisResult);
            eventFired = true;
        }), new mockLookupComponent_mock_1.MockLookupComponent(), new mockRefineComponent_mock_1.MockRefineComponent());
        await baseAnalyzer.performFullAnalysis("TEST_URL", []);
        expect(eventFired).toBe(true);
    });
    it('Sends data to lookup component when fullAnalysisInvoked', async () => {
        let eventFired = false;
        const reduceResult = [1, 2, 3];
        const gridIds = ["DE", "GB"];
        const from = new Date("2010-01-01");
        const to = new Date("2030-01-01");
        const baseAnalyzer = new baseENFProcessor_1.BaseENFProcessor(new mockPreScanComponent_mock_1.MockPreScanComponent(), new mockAnalyzeComponent_mock_1.MockAnalyzeComponent(), new mockReduceComponent_mock_1.MockReduceComponent(undefined, reduceResult), new mockLookupComponent_mock_1.MockLookupComponent((arg1, arg2, arg3, arg4) => {
            expect(arg1).toBe(reduceResult);
            expect(arg2).toBe(gridIds);
            expect(arg3).toBe(from);
            expect(arg4).toBe(to);
            eventFired = true;
        }), new mockRefineComponent_mock_1.MockRefineComponent());
        await baseAnalyzer.performFullAnalysis("TEST_URL", gridIds, from, to);
        expect(eventFired).toBe(true);
    });
    it('Sends data to refine component when fullAnalysisInvoked', async () => {
        let eventFired = false;
        const lookupResult = [];
        const baseAnalyzer = new baseENFProcessor_1.BaseENFProcessor(new mockPreScanComponent_mock_1.MockPreScanComponent(), new mockAnalyzeComponent_mock_1.MockAnalyzeComponent(), new mockReduceComponent_mock_1.MockReduceComponent(), new mockLookupComponent_mock_1.MockLookupComponent(undefined, lookupResult), new mockRefineComponent_mock_1.MockRefineComponent(arg1 => {
            expect(arg1).toBe(lookupResult);
            eventFired = true;
        }));
        await baseAnalyzer.performFullAnalysis("TEST_URL", []);
        expect(eventFired).toBe(true);
    });
    it('Fires onPreScan complete event', async () => {
        let eventFired = false;
        const baseAnalyzer = new baseENFProcessor_1.BaseENFProcessor(new mockPreScanComponent_mock_1.MockPreScanComponent(), new mockAnalyzeComponent_mock_1.MockAnalyzeComponent(), new mockReduceComponent_mock_1.MockReduceComponent(), new mockLookupComponent_mock_1.MockLookupComponent(), new mockRefineComponent_mock_1.MockRefineComponent());
        baseAnalyzer.onPreScanCompleteEvent.addHandler(_result => {
            eventFired = true;
        });
        await baseAnalyzer.performFullAnalysis("TEST_URL", []);
        expect(eventFired).toBe(true);
    });
    it('Fires onAnalyzeComplete event', async () => {
        let eventFired = false;
        const baseAnalyzer = new baseENFProcessor_1.BaseENFProcessor(new mockPreScanComponent_mock_1.MockPreScanComponent(), new mockAnalyzeComponent_mock_1.MockAnalyzeComponent(), new mockReduceComponent_mock_1.MockReduceComponent(), new mockLookupComponent_mock_1.MockLookupComponent(), new mockRefineComponent_mock_1.MockRefineComponent());
        baseAnalyzer.onAnalyzeCompleteEvent.addHandler(_result => {
            eventFired = true;
        });
        await baseAnalyzer.performFullAnalysis("TEST_URL", []);
        expect(eventFired).toBe(true);
    });
    it('Fires onReduceComplete event', async () => {
        let eventFired = false;
        const baseAnalyzer = new baseENFProcessor_1.BaseENFProcessor(new mockPreScanComponent_mock_1.MockPreScanComponent(), new mockAnalyzeComponent_mock_1.MockAnalyzeComponent(), new mockReduceComponent_mock_1.MockReduceComponent(), new mockLookupComponent_mock_1.MockLookupComponent(), new mockRefineComponent_mock_1.MockRefineComponent());
        baseAnalyzer.onReduceCompleteEvent.addHandler(_result => {
            eventFired = true;
        });
        await baseAnalyzer.performFullAnalysis("TEST_URL", []);
        expect(eventFired).toBe(true);
    });
    it('Fires onLookupComplete event', async () => {
        let eventFired = false;
        const baseAnalyzer = new baseENFProcessor_1.BaseENFProcessor(new mockPreScanComponent_mock_1.MockPreScanComponent(), new mockAnalyzeComponent_mock_1.MockAnalyzeComponent(), new mockReduceComponent_mock_1.MockReduceComponent(), new mockLookupComponent_mock_1.MockLookupComponent(), new mockRefineComponent_mock_1.MockRefineComponent());
        baseAnalyzer.onLookupCompleteEvent.addHandler(_result => {
            eventFired = true;
        });
        await baseAnalyzer.performFullAnalysis("TEST_URL", []);
        expect(eventFired).toBe(true);
    });
    it('Fires onRefineComplete event', async () => {
        let eventFired = false;
        const baseAnalyzer = new baseENFProcessor_1.BaseENFProcessor(new mockPreScanComponent_mock_1.MockPreScanComponent(), new mockAnalyzeComponent_mock_1.MockAnalyzeComponent(), new mockReduceComponent_mock_1.MockReduceComponent(), new mockLookupComponent_mock_1.MockLookupComponent(), new mockRefineComponent_mock_1.MockRefineComponent());
        baseAnalyzer.onRefineCompleteEvent.addHandler(_result => {
            eventFired = true;
        });
        await baseAnalyzer.performFullAnalysis("TEST_URL", []);
        expect(eventFired).toBe(true);
    });
    it('Adds default properties to ENFAnalysisResult ', async () => {
        const baseAnalyzer = new baseENFProcessor_1.BaseENFProcessor(new mockPreScanComponent_mock_1.MockPreScanComponent(), new mockAnalyzeComponent_mock_1.MockAnalyzeComponent(), new mockReduceComponent_mock_1.MockReduceComponent(), new mockLookupComponent_mock_1.MockLookupComponent(), new mockRefineComponent_mock_1.MockRefineComponent());
        const result = await baseAnalyzer.performFullAnalysis("TEST_URL", []);
        expect(result.analysisStartTime?.getTime()).toBeCloseTo(new Date().getTime(), -2);
        expect(result.analysisEndTime?.getTime()).toBeCloseTo(new Date().getTime(), -2);
        expect(result.error).toBeNull();
        expect(result.noMatchReason).toBeNull();
        expect(result.preScanImplementationId).toBe(new mockPreScanComponent_mock_1.MockPreScanComponent().implementationId);
        expect(result.analyseImplementationId).toBe(new mockAnalyzeComponent_mock_1.MockAnalyzeComponent().implementationId);
        expect(result.reduceImplementationId).toBe(new mockReduceComponent_mock_1.MockReduceComponent().implementationId);
        expect(result.lookupImplementationId).toBe(new mockLookupComponent_mock_1.MockLookupComponent().implementationId);
        expect(result.refineImplementationId).toBe(new mockRefineComponent_mock_1.MockRefineComponent().implementationId);
        expect(result.uri).toBe("TEST_URL");
    });
    it('Can handle NoMatch error at analyze stage', async () => {
        const analyzeComponentThrowsError = new mockAnalyzeComponent_mock_1.MockAnalyzeComponent(() => {
            throw new noMatch_1.NoMatch(noMatchReason_1.NoMatchReason.DominantFifty);
        });
        const baseAnalyzer = new baseENFProcessor_1.BaseENFProcessor(new mockPreScanComponent_mock_1.MockPreScanComponent(), analyzeComponentThrowsError, new mockReduceComponent_mock_1.MockReduceComponent(), new mockLookupComponent_mock_1.MockLookupComponent(), new mockRefineComponent_mock_1.MockRefineComponent());
        const result = await baseAnalyzer.performFullAnalysis("TEST_URL", []);
        expect(result.noMatchReason).toBe(noMatchReason_1.NoMatchReason.DominantFifty);
        expect(result.analysisEndTime?.getTime()).toBeCloseTo(new Date().getTime(), -2);
    });
    it('Can handle NoMatch error at reduce stage', async () => {
        const reduceComponentThrowsError = new mockReduceComponent_mock_1.MockReduceComponent(() => {
            throw new noMatch_1.NoMatch(noMatchReason_1.NoMatchReason.NoStrongSignal);
        });
        const baseAnalyzer = new baseENFProcessor_1.BaseENFProcessor(new mockPreScanComponent_mock_1.MockPreScanComponent(), new mockAnalyzeComponent_mock_1.MockAnalyzeComponent(), reduceComponentThrowsError, new mockLookupComponent_mock_1.MockLookupComponent(), new mockRefineComponent_mock_1.MockRefineComponent());
        const result = await baseAnalyzer.performFullAnalysis("TEST_URL", []);
        expect(result.noMatchReason).toBe(noMatchReason_1.NoMatchReason.NoStrongSignal);
        expect(result.analysisEndTime?.getTime()).toBeCloseTo(new Date().getTime(), -2);
    });
    it('Can handle NoMatch error at lookup stage', async () => {
        const lookupComponentThrowsError = new mockLookupComponent_mock_1.MockLookupComponent(() => {
            throw new noMatch_1.NoMatch(noMatchReason_1.NoMatchReason.NoResultsOnLookup);
        });
        const baseAnalyzer = new baseENFProcessor_1.BaseENFProcessor(new mockPreScanComponent_mock_1.MockPreScanComponent(), new mockAnalyzeComponent_mock_1.MockAnalyzeComponent(), new mockReduceComponent_mock_1.MockReduceComponent(), lookupComponentThrowsError, new mockRefineComponent_mock_1.MockRefineComponent());
        const result = await baseAnalyzer.performFullAnalysis("TEST_URL", []);
        expect(result.noMatchReason).toBe(noMatchReason_1.NoMatchReason.NoResultsOnLookup);
        expect(result.analysisEndTime?.getTime()).toBeCloseTo(new Date().getTime(), -2);
    });
    it('Attaches correct stage results during performFullAnalysis()', async () => {
        const preScanResult = {
            duration: undefined,
            durationSamples: 0,
            h100: 0,
            h120: 0,
            h200: 0,
            h240: 0,
            h50: 0,
            h60: 0,
            numChannels: 0,
            sampleRate: 0
        };
        const analyzeResult = [];
        const reduceResult = [];
        const lookupResult = [];
        const refineResult = [];
        const preScanComponent = new mockPreScanComponent_mock_1.MockPreScanComponent(undefined, preScanResult);
        const analyzeComponent = new mockAnalyzeComponent_mock_1.MockAnalyzeComponent(undefined, analyzeResult);
        const reduceComponent = new mockReduceComponent_mock_1.MockReduceComponent(undefined, reduceResult);
        const lookupComponent = new mockLookupComponent_mock_1.MockLookupComponent(undefined, lookupResult);
        const refineComponent = new mockRefineComponent_mock_1.MockRefineComponent(undefined, refineResult);
        const baseAnalyzer = new baseENFProcessor_1.BaseENFProcessor(preScanComponent, analyzeComponent, reduceComponent, lookupComponent, refineComponent);
        const result = await baseAnalyzer.performFullAnalysis("TEST_URL", []);
        expect(result.preScanResult).toBe(preScanResult);
        expect(result.analysisResult).toBe(analyzeResult);
        expect(result.frequencies).toBe(reduceResult);
        expect(result.lookupResults).toBe(lookupResult);
        expect(result.ENFAnalysisResults).toBe(refineResult);
    });
    it('fires full analysis complete event', async () => {
        let result;
        let resultFromHandler = new ENFAnalysis_1.ENFAnalysis("not_from_handler");
        const baseENFProcessor = new baseENFProcessor_1.BaseENFProcessor(new mockPreScanComponent_mock_1.MockPreScanComponent(), new mockAnalyzeComponent_mock_1.MockAnalyzeComponent(), new mockReduceComponent_mock_1.MockReduceComponent(), new mockLookupComponent_mock_1.MockLookupComponent(), new mockRefineComponent_mock_1.MockRefineComponent());
        baseENFProcessor.fullAnalysisCompleteEvent.addHandler(r => {
            if (r) {
                resultFromHandler = r;
            }
        });
        result = await baseENFProcessor.performFullAnalysis("TEST_URL", []);
        expect(result).toBe(resultFromHandler);
    });
    it('fires log event', async () => {
        let result;
        const baseENFProcessor = new baseENFProcessor_1.BaseENFProcessor(new mockPreScanComponent_mock_1.MockPreScanComponent(), new mockAnalyzeComponent_mock_1.MockAnalyzeComponent(), new mockReduceComponent_mock_1.MockReduceComponent(), new mockLookupComponent_mock_1.MockLookupComponent(), new mockRefineComponent_mock_1.MockRefineComponent());
        let logFiredCount = 0;
        baseENFProcessor.logEvent.addHandler((s) => {
            logFiredCount++;
            switch (logFiredCount) {
                case 1:
                    expect(s).toBe('Starting analysis for resource: TEST_URL, grids: [GB,DE], from 2015-01-01 to 2016-01-01');
                    break;
                case 2:
                    expect(s).toBe('Pre-scanning resource...');
                    break;
                case 3:
                    expect(s).toBe('Pre-scan complete.');
                    break;
                case 4:
                    expect(s).toBe('Obtaining frequency data...');
                    break;
                case 5:
                    expect(s).toBe('Analysing frequency data...');
                    break;
                case 6:
                    expect(s).toBe('Frequency analysis complete.');
                    break;
                case 7:
                    expect(s).toBe('Comparing frequencies to grid data...');
                    break;
                case 8:
                    expect(s).toBe('Refining results...');
                    break;
                case 9:
                    expect(s).toBe('ENF analysis complete.');
                    break;
            }
        });
        await baseENFProcessor.performFullAnalysis("TEST_URL", ["GB", "DE"], new Date("2015-01-01"), new Date("2016-01-01"));
        expect(logFiredCount).toBe(9);
    });
    it('passes start, end times and gridIDs to lookup component, and attaches them to response', async () => {
        const startDate = new Date('2010-01-01');
        const endDate = new Date('2020-01-01');
        const gridIds = ["GB", "DE"];
        let lookupCalled = false;
        const mockLookupComponentChecksDates = new mockLookupComponent_mock_1.MockLookupComponent((freqs, ids, from, to) => {
            expect(from).toBe(startDate);
            expect(to).toBe(endDate);
            expect(ids).toStrictEqual(gridIds);
            lookupCalled = true;
        });
        const baseAnalyzer = new baseENFProcessor_1.BaseENFProcessor(new mockPreScanComponent_mock_1.MockPreScanComponent(), new mockAnalyzeComponent_mock_1.MockAnalyzeComponent(), new mockReduceComponent_mock_1.MockReduceComponent(), mockLookupComponentChecksDates, new mockRefineComponent_mock_1.MockRefineComponent());
        const result = await baseAnalyzer.performFullAnalysis("TEST_URL", gridIds, startDate, endDate);
        expect(result.start).toBe(startDate);
        expect(result.end).toBe(endDate);
        expect(lookupCalled).toBe(true);
        expect(result.gridIds).toStrictEqual(gridIds);
    });
    it('populates durations', async () => {
        const startDate = new Date('2010-01-01');
        const endDate = new Date('2020-01-01');
        const gridIds = ["GB", "DE"];
        const baseAnalyzer = new baseENFProcessor_1.BaseENFProcessor(new mockPreScanComponent_mock_1.MockPreScanComponent(), new mockAnalyzeComponent_mock_1.MockAnalyzeComponent(), new mockReduceComponent_mock_1.MockReduceComponent(), new mockLookupComponent_mock_1.MockLookupComponent(), new mockRefineComponent_mock_1.MockRefineComponent());
        const result = await baseAnalyzer.performFullAnalysis("TEST_URL", gridIds, startDate, endDate);
        const completionTimes = result.completionTimes;
        expect(completionTimes.preScan).not.toBeFalsy();
        expect(completionTimes.analyze).not.toBeFalsy();
        expect(completionTimes.reduce).not.toBeFalsy();
        expect(completionTimes.lookup).not.toBeFalsy();
        expect(completionTimes.refine).not.toBeFalsy();
        const durations = result.durations;
        expect(durations.preScan).not.toBeUndefined();
        expect(durations.analyze).not.toBeUndefined();
        expect(durations.reduce).not.toBeUndefined();
        expect(durations.lookup).not.toBeUndefined();
        expect(durations.refine).not.toBeUndefined();
    });
    it('fires progress event', async () => {
        let eventCount = 0;
        const mockPreScanComponentFiresProgressTwice = new mockPreScanComponent_mock_1.MockPreScanComponent(() => {
            const preScanUpdate = { f50: 0, f100: 0, f200: 0, f60: 0, f120: 0, f240: 0, startSamples: 0, endSamples: 44100 };
            mockPreScanComponentFiresProgressTwice.preScanProgressEvent.trigger([preScanUpdate, 0.5]);
            mockPreScanComponentFiresProgressTwice.preScanProgressEvent.trigger([preScanUpdate, 1]);
        });
        const mockAnalyzeComponentFiresProgressThreeTimes = new mockAnalyzeComponent_mock_1.MockAnalyzeComponent(() => {
            const analysisWindowResult = {
                start: 0,
                end: 1,
                startSamples: 0,
                endSamples: 44100,
                data: {},
                channelNum: 1
            };
            mockAnalyzeComponentFiresProgressThreeTimes.analyzeProgressEvent.trigger([analysisWindowResult, 1 / 3]);
            mockAnalyzeComponentFiresProgressThreeTimes.analyzeProgressEvent.trigger([analysisWindowResult, 2 / 3]);
            mockAnalyzeComponentFiresProgressThreeTimes.analyzeProgressEvent.trigger([analysisWindowResult, 1]);
        });
        const mockLookupComponentFiresProgressFourTimes = new mockLookupComponent_mock_1.MockLookupComponent(() => {
            mockLookupComponentFiresProgressFourTimes.lookupProgressEvent.trigger(0.25);
            mockLookupComponentFiresProgressFourTimes.lookupProgressEvent.trigger(0.5);
            mockLookupComponentFiresProgressFourTimes.lookupProgressEvent.trigger(0.75);
            mockLookupComponentFiresProgressFourTimes.lookupProgressEvent.trigger(1);
        });
        const baseAnalyzer = new baseENFProcessor_1.BaseENFProcessor(mockPreScanComponentFiresProgressTwice, mockAnalyzeComponentFiresProgressThreeTimes, new mockReduceComponent_mock_1.MockReduceComponent(), mockLookupComponentFiresProgressFourTimes, new mockRefineComponent_mock_1.MockRefineComponent());
        baseAnalyzer.analysisProgressEvent.addHandler(progress => {
            eventCount++;
            switch (eventCount) {
                case 1:
                    //because we're halfway through the first progressible phase
                    expect(progress).toEqual(0.5 * (1 / 3));
                    break;
                case 2:
                    //because we've completed the first progressable phase
                    expect(progress).toEqual(1 * (1 / 3));
                    break;
                case 3:
                    //because we've completed the first progressable phase and are 1/3 the way through the second:
                    expect(progress).toEqual(1 / 3 + (1 / 3 * 1 / 3));
                    break;
                case 4:
                    //because we've completed the first progressable phase and are 2/3 the way through the second:
                    expect(progress).toEqual(1 / 3 + (2 / 3 * 1 / 3));
                    break;
                case 5:
                    //because we've completed the first 2 progressable phases.
                    expect(progress).toEqual(2 / 3);
                    break;
                case 6:
                    //because we've completed the first 2 progressable phases and are 0.25 the way through the third:
                    expect(progress).toEqual(2 / 3 + (0.25 * 1 / 3));
                    break;
                case 7:
                    //because we've completed the first 2 progressable phases and are 0.5 the way through the third:
                    expect(progress).toEqual(2 / 3 + (0.5 * 1 / 3));
                    break;
                case 8:
                    //because we've completed the first 2 progressable phases and are 0.75 the way through the third:
                    expect(progress).toEqual(2 / 3 + (0.75 * 1 / 3));
                    break;
                case 9:
                    //because all progressable phases are complete:
                    expect(progress).toEqual(1);
                    break;
                default:
                    throw new Error("Event should only fire 9 times");
            }
        });
        await baseAnalyzer.performFullAnalysis("TEST_URL", []);
        expect(eventCount).toBe(9);
    });
});
