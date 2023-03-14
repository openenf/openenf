/**
 * GoertzelHarmonicResult is the result of analysing one harmonic for window of audio:
 */
export interface GoertzelHarmonicResult extends HzWithConfidence{

    /**
     * The target frequency to be analysed, e.g. 50, 100, 60, 240, etc. The actual peak frequency within +-0.5HZ of this frequency
     * is given in the {@link hz} property
     */
    target:number

    /**
     * The amplitude of the frequency.
     */
    amp: number,

    /**
     * The standard deviation of frequencies around the peak. A smaller number means the frequency is less likely to be noise
     */
    standardDev: number,
}

export interface HzWithConfidence {
    /**
     * The peak frequency within +-0.5Hz of the {@link target} within this window. Not that a value at either end of this range
     * (e.g. 49.5Hz, 50.5Hz) is highly likely to be noise as mains grids very rarely deviate that far from their nominal frequency.
     * A null value here indicates that the window has been deemed noise by the reduce process and won't be passed to the lookup stage
     */
    hz: number|null,
    /**
     * This is just deviation/amp bit gives a crude normalised measure of the confidence of we can place in the reading
     */
    confidence: number,
}
