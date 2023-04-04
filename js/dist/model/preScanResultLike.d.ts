/**
 * The result of a pre-scan operation. Describes overall strengths of the first 3 harmonics at 50hz and 60hz for a piece of audio.
 */
export interface PreScanResultLike {
    /**
     * The strength of fundamental at 50hz
     */
    h50: number;
    /**
     * The strength of the first harmonic at 50hz
     */
    h100: number;
    /**
     * The strength of the third harmonic at 50hz
     */
    h200: number;
    /**
     * The strength of the fundamental at 60hz
     */
    h60: number;
    /**
     * The strength of the first harmonic at 60hz
     */
    h120: number;
    /**
     * The strength of the third harmonic at 60hz
     */
    h240: number;
    /**
     * The duration of the audio in seconds. Ih almost all cases this will be populated but could be null if the resource can't be read
     */
    duration: number | undefined;
    /**
     * The sample rate of the audio. Usually 44.1Khz or 48Khz.
     */
    sampleRate: number;
    /**
     * The total number of samples.
     */
    durationSamples: number;
    /**
     * The number of channels. Usually 1 (mono) or 2 (stereo)
     */
    numChannels: number;
}
