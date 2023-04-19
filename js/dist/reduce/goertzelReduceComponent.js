"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoertzelReduceComponent = void 0;
const noMatchReason_1 = require("../model/noMatchReason");
const noMatch_1 = require("../ENFProcessor/noMatch");
const interpolateUnconfidentSamples_1 = require("./goertzelReduceUtils/interpolateUnconfidentSamples");
const checkForStrongSignal_1 = require("./goertzelReduceUtils/checkForStrongSignal");
const structuredCloneWithFallback_1 = require("../polyfill/structuredCloneWithFallback");
const factors = {
    "50": 1,
    "100": 2,
    "200": 4,
    "60": 1,
    "120": 2,
    "240": 4
};
const bases = {
    "50": 50,
    "100": 50,
    "200": 50,
    "60": 60,
    "120": 60,
    "240": 60
};
//convertHarmonicFrequenciesToFundamental converts all harmonic frequencies to their corresponding fundamental/
//It also nullifies any frequency that deviates 0.4hz away from the fundamental
const convertHarmonicFrequenciesToFundamental = (windows) => {
    const tolerance = 0.4;
    windows.forEach(w => {
        w.data.forEach((d) => {
            const tk = d.target.toString();
            d.hz = d.hz / factors[tk];
            if (Math.abs(d.hz - bases[tk]) > tolerance) {
                d.hz = null;
            }
        });
    });
    return windows;
};
const transformWindowsToStreams = (windows) => {
    const returnDict = {
        "50": [],
        "100": [],
        "200": [],
        "60": [],
        "120": [],
        "240": []
    };
    windows.forEach(w => {
        w.data.forEach((d) => {
            const t = d.target.toString();
            if (!returnDict[t]) {
                throw new Error(`Unable to find Goertzel dict for '${t}'. Result: ${JSON.stringify(d, null, 2)}`);
            }
            returnDict[d.target.toString()].push(d);
        });
    });
    return returnDict;
};
const getStreamsWithTotalAmplitude = (streams) => {
    let rtrn = [];
    Object.keys(streams).forEach(k => {
        const amp = streams[k].reduce((a, b) => a = a + (b.hz === null ? 0 : b.amp), 0);
        rtrn.push({ amp, stream: streams[k], target: k });
    });
    rtrn = rtrn.sort((a, b) => b.amp - a.amp);
    return rtrn;
};
const downSample = (windows, overlapFactor, downSampleOffset) => {
    const wCopy = (0, structuredCloneWithFallback_1.structuredCloneWithFallback)(windows);
    overlapFactor = overlapFactor;
    const chunks = [];
    if (downSampleOffset === undefined) {
        downSampleOffset = 1;
    }
    const startPoint = overlapFactor * downSampleOffset;
    for (let i = startPoint; i < wCopy.length; i += overlapFactor) {
        chunks.push(wCopy.slice(i, i + overlapFactor));
    }
    return chunks.filter(x => x.length === overlapFactor).map(c => {
        if (c.find(x => x.hz === null)) {
            return null;
        }
        const avg = (c.reduce((a, b) => a + (b.hz || 0), 0)) / (c.length);
        return Math.round(avg * 1000) / 1000;
    });
};
class GoertzelReduceComponent {
    constructor(overlapFactor) {
        this.implementationId = "DefaultReduceV0.1";
        this.overlapFactor = overlapFactor;
    }
    async reduce(analysisResults) {
        if (!analysisResults.length) {
            throw new Error("Was expecting a non-empty windows array");
        }
        const windowSize = 1; //TODO FIX THIS!!!
        analysisResults = convertHarmonicFrequenciesToFundamental(analysisResults);
        const s = transformWindowsToStreams(analysisResults);
        const amps = getStreamsWithTotalAmplitude(s);
        const initialTargetStream = amps.filter(x => x.target !== "240" && x.target !== "120" && x.target !== "240")[0].stream;
        console.log('initialTargetStream', JSON.stringify(initialTargetStream.slice(0, 50), null, 2));
        const targetStream = (0, interpolateUnconfidentSamples_1.interpolateUnconfidentSamples)(initialTargetStream, 0.005, windowSize);
        console.log('targetStream', targetStream);
        const downSampledStream = downSample(targetStream, this.overlapFactor);
        console.log('downSampledStream', downSampledStream);
        const isStrongSignal = (0, checkForStrongSignal_1.checkForStrongSignal)(downSampledStream);
        if (!isStrongSignal) {
            throw new noMatch_1.NoMatch(noMatchReason_1.NoMatchReason.NoStrongSignal);
        }
        return downSampledStream;
    }
}
exports.GoertzelReduceComponent = GoertzelReduceComponent;
