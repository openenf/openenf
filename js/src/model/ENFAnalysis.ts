import {NoMatchReason} from "./noMatchReason";
import {AnalysisWindowResult} from "./analysisWindowResult";
import {LookupResult} from "./lookupResult";
import {ENFAnalysisResult} from "./ENFAnalysisResult";
import {PreScanResult} from "./preScanResult";
import * as crypto from "crypto";

/**
 * Represents an occurence of ENF Analysis for a specific media file
 *
 * A single media resource could be analysed several times. The `ENFAnalysis` object represents one analysis event.
 */
export class ENFAnalysis {

    constructor(uri: string, id?: string) {
        this.id = id || crypto.randomUUID();
        this.uri = uri;
        this.analysisStartTime = new Date();
    }

    /**
     * A unique GUID identifier for the analysis.
     */
    public id: string

    /**
     * A URI pointing to the original media resource. Typically, this will use a `file://` or `https://` schema.
     */
    public uri: string

    /**
     * An optional string representing the MD5 hash of the media resource. Useful for caching the various stages of analysis
     * however, analysers implementing {@link ENFAnalyzer} should be able to complete an analysis when an MD5 is
     * not present
     */
    public md5: string | null = null;

    /**
     * The time the analysis started.
     */
    public analysisStartTime: Date

    /**
     * The time the analysis completed. For a completed analysis this property will always be populated, whether or not the analysis was successful
     */
    public analysisEndTime: Date | null = null;

    /**
     * If an error was encountered during analysis it will be present here
     */
    public error: Error | null = null;

    /**
     * If no match was found, the reason will be populated here.
     */
    public noMatchReason: NoMatchReason | null = null;

    /**
     * True if the media resource is artificially generated for testing purposes.
     */
    public synthetic = false

    /**
     * Optional array of frequencies expected to be returned from the frequency analysis stage. Used with synthetic testing files.
     */
    public expectedFrequencies: (number|null)[] | null = null;

    /**
     * If it can be determined the base frequency of the mains hum present in the audio signal will be added here. This is added after the prescan is complete
     */
    public baseFrequency: 50 | 60 | null = null;

    /**
     * Optional user-defined notes pertaining to the analysis
     *
     * @example
     * "Interior - prominent hum at 100HZ"
     */
    public notes: string | null = null;

    /**
     * The result of the Pre-scan will be populated here when complete.
     */
    public preScanResult: PreScanResult | null = null;

    /**
     * A string identifying the preScan implementation used in this analysis
     *
     * @example
     * "Goertzel1.1"
     */
    public preScanImplementationId: string | null = null;

    /**
     * The output from the main frequency analysis. Populated when the Analysis stage is complete.
     */
    public analysisResult: AnalysisWindowResult[] | null = null;

    /**
     * A string identifying the analyse implementation used in this analysis
     *
     * @example
     * "Goertzel1.2"
     */
    public analyseImplementationId: string | null = null;

    /**
     * The mains hum frequencies, measured at 1 second intervals, will be present here after the Reduce stage
     * is complete
     */
    public frequencies: (number|null)[] | null = null;

    /**
     * A string identifying the reduce implementation used in this analysis
     *
     * @example
     * "InterpolateNulls1.1"
     */
    public reduceImplementationId: string | null = null;

    /**
     * This is a count of non-null values in the {@link frequencies array}. It is effectively a measure of the quality
     * of the signal in the audio and is used when calculating the {@link ENFAnalysisResult.normalisedScore} value
     */
    public nonNullDuration: number|null = null;

    /**
     * The date from which to start lookup in a grid frequency data stream. If null then the lookup begins from the start of the data stream
     */
    public start: Date | null = null;

    /**
     * The date at which to stop lookup in a grid frequency data stream. If null then the lookup continues to the end of the data stream
     */
    public end: Date | null = null;

    /**
     * The grids that should be searched in the lookup phase
     *
     * @example
     * ["GB","DE"]
     */
    public gridIds: string[] = [];

    /**
     * This is the output from the lookup stage of the analysis. It's an list of typically 100+ lookup results ordered by closeness
     * to the {@link frequencies} array. Typically you'll find many consecutive results here, e.g. a cluster of ten results
     * all separated by a second. These results need to be refined into a more meaningful ENFAnalysisResult array by the
     * Refine analysis stage
     */
    public lookupResults: LookupResult[] | null = null;

    /**
     * A string identifying the Lookup implementation used in this analysis
     *
     * @example
     * "HTTPFullScan1.1"
     */
    public lookupImplementationId: string | null = null;

    /**
     * The final result of the analysis. Typically, this will be more than 20 distinct results, ordered by closeness with the
     * best match at the top of the array
     */
    public ENFAnalysisResults: ENFAnalysisResult[] | null = null;

    /**
     * A string identifying the Refine implementation used in this analysis
     *
     * @example
     * "WithKurtosis1.1"
     */
    public refineImplementationId: string | null = null;
}
