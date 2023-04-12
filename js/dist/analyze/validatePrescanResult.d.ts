import { PreScanResultLike } from "../model/preScanResultLike";
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
export declare const validatePreScanResult: (preScanResult: PreScanResultLike, expectedFrequency?: 50 | 60) => number[];
