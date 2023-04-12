import { NoMatchReason } from "../model/noMatchReason";
import { NoMatch } from "../ENFProcessor/noMatch";
import { interpolateUnconfidentSamples } from "./goertzelReduceUtils/interpolateUnconfidentSamples";
import { checkForStrongSignal } from "./goertzelReduceUtils/checkForStrongSignal";
import { structuredCloneWithFallback } from "../polyfill/structuredCloneWithFallback";
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
    windows.forEach(w => {
        w.data.forEach((d) => {
            const tk = d.target.toString();
            if (d.hz !== null) {
                d.hz = d.hz / factors[tk];
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
    const wCopy = structuredCloneWithFallback(windows);
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
export class GoertzelReduceComponent {
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
        const targetStream = interpolateUnconfidentSamples(initialTargetStream, 0.005, windowSize);
        const downSampledStream = downSample(targetStream, this.overlapFactor);
        const isStrongSignal = checkForStrongSignal(downSampledStream);
        if (!isStrongSignal) {
            throw new NoMatch(NoMatchReason.NoStrongSignal);
        }
        return downSampledStream;
    }
}
