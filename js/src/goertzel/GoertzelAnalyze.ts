import {FrequencyRequestCache} from "./FrequencyRequestCache";

const detectPeakAround = (goertzelRequestCache:FrequencyRequestCache, target:number):any => {
    const min = target - 1.5;
    const max = target + 1.5;
    let currentMinHz = min;
    let currentMaxHz = max;
    let amp = 0;
    let hz;
    let i = 0;
    while (i < 1000) { //Artificial hard limit here. We should quit well before i = 1000 but this is just a stopgap in case something goes wrong
        const currentAvgHz = (currentMinHz + currentMaxHz) / 2;
        const currentMinAmp = goertzelRequestCache.analyze(currentMinHz);
        const currentMaxAmp = goertzelRequestCache.analyze(currentMaxHz);
        const currentAvgAmp = goertzelRequestCache.analyze(currentAvgHz);
        if ((currentAvgAmp + currentMinAmp) > (currentMaxAmp + currentAvgAmp)) {
            currentMaxHz = currentAvgHz
        } else {
            currentMinHz = currentAvgHz
        }
        amp = currentAvgAmp;
        if (hz === currentAvgHz) {
            break;
        }
        hz = currentAvgHz;
        i++;
    }
    return {hz, amp};
}

const getStandardDeviation = (array:number[]) => {
    const n = array.length
    const mean = array.reduce((a, b) => a + b) / n
    return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n)
}

const detectDeviationAround = (goertzelRequestCache:FrequencyRequestCache, peak:number):any => {
    const precision = 0.01;
    const freqs = []
    for (let f = peak - (10 * precision); f < peak + (10 * precision); f = f + precision) {
        freqs.push(goertzelRequestCache.analyze(f))
    }
    return getStandardDeviation(freqs)
}

export const getDataForWindow = (freq:number, requestCache:FrequencyRequestCache):any => {
    const result = detectPeakAround(requestCache, freq);
    result.deviation = detectDeviationAround(requestCache, result.hz);
    result.confidence = result.deviation / result.amp;
    return result;
}
