import * as Benchmark from "benchmark";
import fs from "fs";
import path from "path";
import {GoertzelReduceComponent} from "../../src/reduce/goertzelReduceComponent";
import {TcpServerComponentOptions} from "../../src/lookup/tcpServerComponentOptions";
import {getTestExecutablePath} from "../../src/testUtils";
import {TcpServerLookupComponent} from "../../src/lookup/tcpServerLookupComponent";
import {BaseENFProcessor} from "../../src/ENFProcessor/baseENFProcessor";
import {MockPreScanComponent} from "../../src/ENFProcessor/mocks/mockPreScanComponent.mock";
import {MockAnalyzeComponent} from "../../src/ENFProcessor/mocks/mockAnalyzeComponent.mock";
import {MockRefineComponent} from "../../src/ENFProcessor/mocks/mockRefineComponent.mock";

// Function that returns a Promise
function lookup(freqPath:string) {
    return new Promise<void>(async resolve => {
        const lookupFreqs:(number | null)[] = JSON.parse(fs.readFileSync(path.resolve(freqPath)).toString());
        const overlapFactor = 1;
        const preScanComponent = new MockPreScanComponent()
        const analyzeComponent = new MockAnalyzeComponent();
        const reduceComponent = new GoertzelReduceComponent(overlapFactor);

        const tcpServerComponentOptions = new TcpServerComponentOptions();
        tcpServerComponentOptions.executablePath = getTestExecutablePath();

        const lookupComponent = new TcpServerLookupComponent(tcpServerComponentOptions);
        const refineComponent = new MockRefineComponent();

        const baseENFProcessor = new BaseENFProcessor(preScanComponent, analyzeComponent, reduceComponent, lookupComponent, refineComponent);
        const results = await baseENFProcessor.lookup(lookupFreqs,["GB"], new Date("2020-11-01"), new Date("20-12-01"));
        if (results[0].position !== 1339200 || results[0].score !== 0) {
            throw new Error("Result error on benchmark")
        }
        resolve();
    });
}

// Define the benchmarks
const suite = new Benchmark.Suite('Async benchmarks')
    .add('Promise', {
        defer: true,
        fn: (deferred: { resolve: () => void; }) => {
            lookup("test/testFreqs/GBFreqs1339200.json").then(() => {
                deferred.resolve();
            });
        }
    })
    /*.add('Promise', {
        defer: true,
        fn: (deferred: { resolve: () => void; }) => {
            lookup("test/testFreqs/GB_2020-11-28T210904_saw_3600_J_secs_05amp_8Harmonics.wav.freqs.json").then(() => {
                deferred.resolve();
            });
        }
    })*/
    .on('cycle', (event: { target: any; }) => {
        console.log(String(event.target));
    })
    .on('complete', (results:any) => {
        console.log(`Average completion time: ${results.target.stats.mean}`);
    });

// Run the benchmarks
suite.run({ async: true });
