import { NoMatchReason } from "./noMatchReason";
import { AnalysisWindowResult } from "./analysisWindowResult";
import { LookupResult } from "./lookupResult";
import { ENFAnalysisResult } from "./ENFAnalysisResult";
import { PreScanResultLike } from "./preScanResultLike";
import { CompletionTimes } from "./CompletionTimes";
import { StageDurations } from "./StageDurations";
/**
 * Represents an occurrence of ENF Analysis for a specific media file
 *
 * A single media resource could be analysed several times. The `ENFAnalysis` object represents one analysis event.
 */
export declare class ENFAnalysis {
    durations: StageDurations;
    constructor(uri: string, id?: string);
    /**
     * A unique GUID identifier for the analysis.
     */
    id: string;
    /**
     * A URI pointing to the original media resource. Typically, this will use a `file://` or `https://` schema.
     */
    uri: string;
    /**
     * An optional string representing the MD5 hash of the media resource. Useful for caching the various stages of analysis
     * however, analysers implementing {@link ENFAnalyzer} should be able to complete an analysis when an MD5 is
     * not present
     */
    md5: string | null;
    /**
     * The time the analysis started.
     */
    analysisStartTime: Date;
    /**
     * The time the analysis completed. For a completed analysis this property will always be populated, whether or not the analysis was successful
     */
    analysisEndTime: Date | null;
    /**
     * If an error was encountered during analysis it will be present here
     */
    error: Error | null;
    /**
     * If no match was found, the reason will be populated here.
     */
    noMatchReason: NoMatchReason | null;
    /**
     * True if the media resource is artificially generated for testing purposes.
     */
    synthetic: boolean;
    /**
     * Optional array of frequencies expected to be returned from the frequency analysis stage. Used with synthetic testing files.
     */
    expectedFrequencies: (number | null)[] | null;
    /**
     * Optional user-defined notes pertaining to the analysis
     *
     * @example
     * "Interior - prominent hum at 100HZ"
     */
    notes: string | null;
    /**
     * The result of the Pre-scan will be populated here when complete.
     */
    preScanResult: PreScanResultLike | null;
    /**
     * A string identifying the preScan implementation used in this analysis
     *
     * @example
     * "Goertzel1.1"
     */
    preScanImplementationId: string | null;
    /**
     * The output from the main frequency analysis. Populated when the Analysis stage is complete.
     */
    analysisResult: AnalysisWindowResult[] | null;
    /**
     * A string identifying the analyse implementation used in this analysis
     *
     * @example
     * "Goertzel1.2"
     */
    analyseImplementationId: string | null;
    /**
     * The mains hum frequencies, measured at 1 second intervals, will be present here after the Reduce stage
     * is complete
     */
    frequencies: (number | null)[] | null;
    /**
     * A string identifying the reduce implementation used in this analysis
     *
     * @example
     * "InterpolateNulls1.1"
     */
    reduceImplementationId: string | null;
    /**
     * This is a count of non-null values in the {@link frequencies array}. It is effectively a measure of the quality
     * of the signal in the audio and is used when calculating the {@link ENFAnalysisResult.normalisedScore} value
     */
    nonNullDuration: number | null;
    /**
     * The date from which to start lookup in a grid frequency data stream. If null then the lookup begins from the start of the data stream
     */
    start: Date | null;
    /**
     * The date at which to stop lookup in a grid frequency data stream. If null then the lookup continues to the end of the data stream
     */
    end: Date | null;
    /**
     * The grids that should be searched in the lookup phase
     *
     * @example
     * ["GB","DE"]
     */
    gridIds: string[];
    /**
     * This is the output from the lookup stage of the analysis. It's an list of typically 100+ lookup results ordered by closeness
     * to the {@link frequencies} array. Typically you'll find many consecutive results here, e.g. a cluster of ten results
     * all separated by a second. These results need to be refined into a more meaningful ENFAnalysisResult array by the
     * Refine analysis stage
     */
    lookupResults: LookupResult[] | null;
    /**
     * A string identifying the Lookup implementation used in this analysis
     *
     * @example
     * "HTTPFullScan1.1"
     */
    lookupImplementationId: string | null;
    /**
     * The final result of the analysis. Typically, this will be more than 20 distinct results, ordered by closeness with the
     * best match at the top of the array
     */
    ENFAnalysisResults: ENFAnalysisResult[] | null;
    /**
     * A string identifying the Refine implementation used in this analysis
     *
     * @example
     * "WithKurtosis1.1"
     */
    refineImplementationId: string | null;
    completionTimes: CompletionTimes;
}
