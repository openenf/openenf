import {PreScanResultLike} from "../model/preScanResultLike";
import {NoMatch} from "../ENFProcessor/noMatch";
import {NoMatchReason} from "../model/noMatchReason";

/**
 * ValidatePreScanResult analyses a preScanResult and either returns a non-zero length array of frequencies to be scanned
 * by an analyzeComponent, or throws {@link NoMatch} error if a dominant fundamental mains frequency cannot be determined,
 * or the dominant frequency dos not match the {@link expectedFrequency}.
 * This function is designed to be used as an analyze-component-agnostic way of validating a {@link PreScanResult) prior to frequency analysis
 * Specific implementations of {@link analyzeComponent} may use a different method of validating a {@link PreScanResult) which is
 * better suited to the specific implementation. Validation of a PreScan is the responsibility of the {@link AnalyzeComponent}
 * because different implementations may be better able to tolerate weak signals.
 * @param preScanResult the output from a {@link PreScanComponent}
 * @param expectedFrequency optional, the expected mains frequency, if passed by the user. You'd use this if you know
 *   that the audio was recorded in, for example, Central Europe, so the expected frequency would be 50HZ
 * @todo return more than one value from the validation. At the time of writing (March 2023) implementations of AnalyzeComponent
 *   only analyze one harmonic but it's likely we'll get more accurate results if we analyze multiple harmonics and combine the results
 */
export const validatePreScanResult = (preScanResult:PreScanResultLike, expectedFrequency?:50|60):number[] => {
    const fifties = [preScanResult.h50, preScanResult.h100, preScanResult.h200];
    const sixties = [preScanResult.h60, preScanResult.h120, preScanResult.h240];
    const fiftyStrength = (fifties[0] +  fifties[1] + fifties[2]) / preScanResult.durationSamples;
    const sixtyStrength = (sixties[0] +  sixties[1] + sixties[2]) / preScanResult.durationSamples;
    if (fiftyStrength === 0 || sixtyStrength === 0) {
        throw new NoMatch(NoMatchReason.NoStrongSignal);
    }
    const relativeStrength = fiftyStrength/sixtyStrength > 1 ? fiftyStrength/sixtyStrength : sixtyStrength/fiftyStrength;
    if (fiftyStrength > sixtyStrength && expectedFrequency == 60) {
        throw new NoMatch(NoMatchReason.DominantFifty);
    }
    if (sixtyStrength > fiftyStrength && expectedFrequency == 50) {
        throw new NoMatch(NoMatchReason.DominantSixty);
    }
    if (fiftyStrength > sixtyStrength) {
        const max = Math.max(...fifties);
        const index = fifties.indexOf(max);
        switch(index) {
            case 0:
                return [50];
            case 1:
                return [100];
            case 2:
                return [200];
            default:
                throw new Error("Unknown harmonic.")
        }
    } else {
        const max = Math.max(...sixties);
        const index = sixties.indexOf(max);
        switch(index) {
            case 0:
                return [60];
            case 1:
                return [120];
            case 2:
                return [240];
            default:
                throw new Error("Unknown harmonic.")
        }
    }
}
