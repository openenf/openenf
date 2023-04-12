const detectPeakAround = (goertzelRequestCache, target) => {
    const min = target - 2;
    const max = target + 2;
    let currentMinHz = min;
    let currentMaxHz = max;
    let amp = 0;
    let hz = -1;
    let i = 0;
    while (i < 1000) { //Artificial hard limit here. We should quit well before i = 1000 but this is just a stopgap in case something goes wrong
        const currentAvgHz = (currentMinHz + currentMaxHz) / 2;
        const currentMinAmp = goertzelRequestCache.analyze(currentMinHz);
        const currentMaxAmp = goertzelRequestCache.analyze(currentMaxHz);
        const currentAvgAmp = goertzelRequestCache.analyze(currentAvgHz);
        if ((currentAvgAmp + currentMinAmp) > (currentMaxAmp + currentAvgAmp)) {
            currentMaxHz = currentAvgHz;
        }
        else {
            currentMinHz = currentAvgHz;
        }
        amp = currentAvgAmp;
        if (hz === currentAvgHz) {
            break;
        }
        hz = currentAvgHz;
        i++;
    }
    return { hz, amp };
};
const getStandardDeviation = (array) => {
    const n = array.length;
    const mean = array.reduce((a, b) => a + b) / n;
    return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
};
const detectDeviationAround = (goertzelRequestCache, peak) => {
    const precision = 0.01;
    const freqs = [];
    for (let f = peak - (10 * precision); f < peak + (10 * precision); f = f + precision) {
        freqs.push(goertzelRequestCache.analyze(f));
    }
    return getStandardDeviation(freqs);
};
/**
 * Returns a {@link GoertzelHarmonicResult} at the specified frequency for the audio contained in the {@link FrequencyRequestCache}
 * @param freq The target frequency to analyse, e.g. 50Hz, 120Hz, etc. This function will return the peak frequency within +-0.5HZ of the target
 * @param requestCache The frequency request cache for the audio window you want to analyse
 */
export const getDataForWindow = (freq, requestCache) => {
    const { amp, hz } = detectPeakAround(requestCache, freq);
    const deviation = detectDeviationAround(requestCache, hz);
    const confidence = deviation / amp;
    return { amp, hz, standardDev: deviation, confidence, target: freq };
};
