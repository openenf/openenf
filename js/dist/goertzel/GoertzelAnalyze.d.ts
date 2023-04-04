import { FrequencyRequestCache } from "./FrequencyRequestCache";
import { GoertzelHarmonicResult } from "./GoertzelHarmonicResult";
/**
 * Returns a {@link GoertzelHarmonicResult} at the specified frequency for the audio contained in the {@link FrequencyRequestCache}
 * @param freq The target frequency to analyse, e.g. 50Hz, 120Hz, etc. This function will return the peak frequency within +-0.5HZ of the target
 * @param requestCache The frequency request cache for the audio window you want to analyse
 */
export declare const getDataForWindow: (freq: number, requestCache: FrequencyRequestCache) => GoertzelHarmonicResult;
