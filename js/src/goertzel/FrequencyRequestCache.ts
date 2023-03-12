import {GoertzelFilterStore} from "./GoertzelFilterStore";
import {GoertzelFilter} from "./GoertzelFilter";

export class FrequencyRequestCache {
    private context: GoertzelFilterStore;
    private readonly samples: number[];
    private readonly requests: any;

    constructor(context: GoertzelFilterStore, samples: number[]) {
        this.context = context;
        this.samples = samples;
        this.requests = {};
    }

    analyze = (hz:number) => {
        if (!hz.toFixed) {
            throw new Error(`Was expecting frequency ket to be number but got '${hz}'`)
        }
        const frequencyKey = hz.toFixed(3);
        if (this.requests[frequencyKey]) {
            return this.requests[frequencyKey];
        }
        if (!this.context.goertzelFilters[frequencyKey]) {
            const gf = new GoertzelFilter();
            gf.init(hz, this.context.sampleRate, this.context.windowSize);
            this.context.goertzelFilters[frequencyKey] = gf;
        }
        try {
            this.requests[frequencyKey] = this.context.goertzelFilters[frequencyKey].run(this.samples)
        } catch (e) {
            throw new Error(`Tried to run Goertzel filter for key '${frequencyKey}' but got '${e}'`)
        }
        return this.requests[frequencyKey]
    }
}
