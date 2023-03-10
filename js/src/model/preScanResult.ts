/**
 * The result of a pre-scan operation. Describes overall strengths of the first 3 harmonics at 50hz and 60hz for a piece of audio.
 */
export interface PreScanResult {

    h50:number;
    h100:number;
    h200:number;
    h60:number;
    h120:number;
    h240:number;

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

