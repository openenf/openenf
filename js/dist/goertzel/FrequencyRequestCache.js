"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrequencyRequestCache = void 0;
const GoertzelFilter_1 = require("./GoertzelFilter");
/**
 * Adaptive Goertzel analysis requires that we calculate the strength of different frequencies over a given sample window. These calculations
 * are computationally expensive, so we store the results here to save us having to perform the calculation more the once.
 */
class FrequencyRequestCache {
    /**
     * A new FrequencyRequestCache is created for each window of audio
     * @param context creating {@link GoertzelFilter}s  for specific frequencies is also computationally expensive, so we use pass
     * in a {@link GoertzelFilterStore} so we can re-use filters created for previous audio windows.
     * @param samples the audio window relating to this {@link FrequencyRequestCache}
     */
    constructor(context, samples) {
        this.requests = {};
        /**
         * Returns the relative frequency strength at the supplied frequency for the audio window passed to the constructor
         * @param hz the frequency to check for
         */
        this.analyze = (hz) => {
            if (!hz.toFixed) {
                throw new Error(`Was expecting frequency ket to be number but got '${hz}'`);
            }
            const frequencyKey = hz.toFixed(3);
            if (this.requests[frequencyKey]) {
                return this.requests[frequencyKey];
            }
            if (!this.context.goertzelFilters[frequencyKey]) {
                const gf = new GoertzelFilter_1.GoertzelFilter();
                gf.init(hz, this.context.sampleRate, this.context.windowSize);
                this.context.goertzelFilters[frequencyKey] = gf;
            }
            try {
                this.requests[frequencyKey] = this.context.goertzelFilters[frequencyKey].run(this.samples);
            }
            catch (e) {
                throw new Error(`Tried to run Goertzel filter for key '${frequencyKey}' but got '${e}'`);
            }
            return this.requests[frequencyKey];
        };
        this.context = context;
        this.samples = samples;
        this.requests = {};
    }
}
exports.FrequencyRequestCache = FrequencyRequestCache;
