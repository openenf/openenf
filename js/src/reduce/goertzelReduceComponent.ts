import {ReduceComponent} from "./reduceComponent";
import {AnalysisWindowResult} from "../model/analysisWindowResult";
import {GoertzelHarmonicResult, HzWithConfidence} from "../goertzel/GoertzelHarmonicResult";
import {NoMatchReason} from "../model/noMatchReason";
import {OverlapFactor} from "../bufferedAudioProcessor/bufferedAudioProcessor";
import {NoMatch} from "../ENFProcessor/noMatch";
import {interpolateUnconfidentSamples} from "./goertzelReduceUtils/interpolateUnconfidentSamples";
import {checkForStrongSignal} from "./goertzelReduceUtils/checkForStrongSignal";
import {structuredCloneWithFallback} from "../polyfill/structuredCloneWithFallback";

const factors:{ [id: string] : number; } = {
    "50":1,
    "100":2,
    "200":4,
    "60":1,
    "120":2,
    "240":4
};

const bases:{ [id: string] : number; } = {
    "50":50,
    "100":50,
    "200":50,
    "60":60,
    "120":60,
    "240":60
};

//convertHarmonicFrequenciesToFundamental converts all harmonic frequencies to their corresponding fundamental/
//It also nullifies any frequency that deviates 0.4hz away from the fundamental
const convertHarmonicFrequenciesToFundamental = (windows:AnalysisWindowResult[]):AnalysisWindowResult[] => {
    const tolerance = 0.4;
    windows.forEach(w => {
        w.data.forEach((d:any) => {
            const tk = d.target.toString();
            d.hz = d.hz / factors[tk]
            if (Math.abs(d.hz - bases[tk]) > tolerance) {
                d.hz = null;
            }
        })
    })
    return windows;
}

const transformWindowsToStreams = (windows:AnalysisWindowResult[]):{[id:string]:GoertzelHarmonicResult[]} => {
    const returnDict:{[id:string]:GoertzelHarmonicResult[]} = {
        "50":[],
        "100":[],
        "200":[],
        "60":[],
        "120":[],
        "240":[]
    };
    windows.forEach(w => {
        w.data.forEach((d:GoertzelHarmonicResult) => {
            const t = d.target.toString();
            if (!returnDict[t]) {
                throw new Error(`Unable to find Goertzel dict for '${t}'. Result: ${JSON.stringify(d, null, 2)}`);
            }
            returnDict[d.target.toString()].push(d);
        })
    })
    return returnDict;
}

interface HarmonicStreamWithAmplitude {
    amp:number,
    stream:GoertzelHarmonicResult[],
    target:string
}

const getStreamsWithTotalAmplitude = (streams:{[id:string]:GoertzelHarmonicResult[]}):HarmonicStreamWithAmplitude[] => {
    let rtrn:HarmonicStreamWithAmplitude[] = [];
    Object.keys(streams).forEach(k => {
        const amp = streams[k].reduce((a,b) => a = a + (b.hz === null ? 0 : b.amp ),0);
        rtrn.push({amp, stream:streams[k], target:k})
    });
    rtrn = rtrn.sort((a, b) => b.amp - a.amp);
    return rtrn;
}

const downSample = (windows:HzWithConfidence[], overlapFactor:OverlapFactor, downSampleOffset?: number):(number|null)[] => {
    const wCopy:HzWithConfidence[] = structuredCloneWithFallback(windows);
    overlapFactor = overlapFactor
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
        const avg = (c.reduce((a,b) => a + (b.hz || 0),0))/(c.length);
        return Math.round(avg * 1000) / 1000;
    })
}

export class GoertzelReduceComponent implements ReduceComponent {
    private overlapFactor: OverlapFactor;

    constructor(overlapFactor:OverlapFactor) {
        this.overlapFactor = overlapFactor;
    }

    readonly implementationId: string = "DefaultReduceV0.1"

    async reduce(analysisResults: AnalysisWindowResult[]): Promise<(number | null)[]> {
        if (!analysisResults.length) {
            throw new Error("Was expecting a non-empty windows array")
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
