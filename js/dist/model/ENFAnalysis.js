import * as crypto from "crypto";
import { CompletionTimes } from "./CompletionTimes";
import { StageDurations } from "./StageDurations";
/**
 * Represents an occurrence of ENF Analysis for a specific media file
 *
 * A single media resource could be analysed several times. The `ENFAnalysis` object represents one analysis event.
 */
export class ENFAnalysis {
    constructor(uri, id) {
        /**
         * An optional string representing the MD5 hash of the media resource. Useful for caching the various stages of analysis
         * however, analysers implementing {@link ENFAnalyzer} should be able to complete an analysis when an MD5 is
         * not present
         */
        this.md5 = null;
        /**
         * The time the analysis completed. For a completed analysis this property will always be populated, whether or not the analysis was successful
         */
        this.analysisEndTime = null;
        /**
         * If an error was encountered during analysis it will be present here
         */
        this.error = null;
        /**
         * If no match was found, the reason will be populated here.
         */
        this.noMatchReason = null;
        /**
         * True if the media resource is artificially generated for testing purposes.
         */
        this.synthetic = false;
        /**
         * Optional array of frequencies expected to be returned from the frequency analysis stage. Used with synthetic testing files.
         */
        this.expectedFrequencies = null;
        /**
         * Optional user-defined notes pertaining to the analysis
         *
         * @example
         * "Interior - prominent hum at 100HZ"
         */
        this.notes = null;
        /**
         * The result of the Pre-scan will be populated here when complete.
         */
        this.preScanResult = null;
        /**
         * A string identifying the preScan implementation used in this analysis
         *
         * @example
         * "Goertzel1.1"
         */
        this.preScanImplementationId = null;
        /**
         * The output from the main frequency analysis. Populated when the Analysis stage is complete.
         */
        this.analysisResult = null;
        /**
         * A string identifying the analyse implementation used in this analysis
         *
         * @example
         * "Goertzel1.2"
         */
        this.analyseImplementationId = null;
        /**
         * The mains hum frequencies, measured at 1 second intervals, will be present here after the Reduce stage
         * is complete
         */
        this.frequencies = null;
        /**
         * A string identifying the reduce implementation used in this analysis
         *
         * @example
         * "InterpolateNulls1.1"
         */
        this.reduceImplementationId = null;
        /**
         * This is a count of non-null values in the {@link frequencies array}. It is effectively a measure of the quality
         * of the signal in the audio and is used when calculating the {@link ENFAnalysisResult.normalisedScore} value
         */
        this.nonNullDuration = null;
        /**
         * The date from which to start lookup in a grid frequency data stream. If null then the lookup begins from the start of the data stream
         */
        this.start = null;
        /**
         * The date at which to stop lookup in a grid frequency data stream. If null then the lookup continues to the end of the data stream
         */
        this.end = null;
        /**
         * The grids that should be searched in the lookup phase
         *
         * @example
         * ["GB","DE"]
         */
        this.gridIds = [];
        /**
         * This is the output from the lookup stage of the analysis. It's an list of typically 100+ lookup results ordered by closeness
         * to the {@link frequencies} array. Typically you'll find many consecutive results here, e.g. a cluster of ten results
         * all separated by a second. These results need to be refined into a more meaningful ENFAnalysisResult array by the
         * Refine analysis stage
         */
        this.lookupResults = null;
        /**
         * A string identifying the Lookup implementation used in this analysis
         *
         * @example
         * "HTTPFullScan1.1"
         */
        this.lookupImplementationId = null;
        /**
         * The final result of the analysis. Typically, this will be more than 20 distinct results, ordered by closeness with the
         * best match at the top of the array
         */
        this.ENFAnalysisResults = null;
        /**
         * A string identifying the Refine implementation used in this analysis
         *
         * @example
         * "WithKurtosis1.1"
         */
        this.refineImplementationId = null;
        this.completionTimes = new CompletionTimes();
        this.id = id || crypto.randomUUID();
        this.uri = uri;
        this.analysisStartTime = new Date();
        this.durations = new StageDurations(this.analysisStartTime, this.completionTimes);
    }
}
