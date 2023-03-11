/**
 * The result of a pre-scan operation. Describes overall strengths of the first 3 harmonics at 50hz and 60hz for a piece of audio.
 */
export interface PreScanResult {

    /**
     * The strength of fundamental at 50hz
     */
    h50:number | undefined;

    /**
     * The strength of the first harmonic at 50hz
     */
    h100:number | undefined;

    /**
     * The strength of the third harmonic at 50hz
     */
    h200:number | undefined;

    /**
     * The strength of the fundamental at 60hz
     */
    h60:number | undefined;

    /**
     * The strength of the first harmonic at 60hz
     */
    h120:number | undefined;

    /**
     * The strength of the third harmonic at 60hz
     */
    h240:number | undefined;

    /**
     * If it can be determined the base frequency of the mains hum present in the audio signal will be added here. This is added after the prescan is complete
     */
    baseFrequency: 50 | 60 | undefined;

    /**
     * The duration of the audio in seconds. Ih almost all cases this will be populated but could be null if the resource can't be read
     */
    duration: number | undefined;

    /**
     * The sample rate of the audio. Usually 44.1Khz or 48Khz.
     */
    sampleRate: number | undefined;

    /**
     * The total number of samples.
     */
    durationSamples: number | undefined;

    /**
     * The number of channels. Usually 1 (mono) or 2 (stereo)
     */
    numChannels: number | undefined;

    /*get50Strength(): number {
        return this.h50 + this.h100 + this.h200
    }

    get60Strength(): number {
        return this.h60 + this.h120 + this.h240
    }

    getRecommendedHarmonic(): number {
        const harmonicStrengths = {
            h50: this.h50,
            h100: this.h100,
            h200: this.h200,
            h60: this.h60,
            h120: this.h120,
            h240: this.h240,
        };
        const key = Object.keys(harmonicStrengths).reduce((prev, current) => {
            return harmonicStrengths[prev] > harmonicStrengths[current] ? prev : current
        })
        return parseInt(key)
    }*/
}

