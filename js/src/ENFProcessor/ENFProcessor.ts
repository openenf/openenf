import {ENFAnalysis} from "../model/ENFAnalysis";
import {PreScanResultLike} from "../model/preScanResultLike";
import {AnalysisWindowResult} from "../model/analysisWindowResult";
import {LookupResult} from "../model/lookupResult";
import {ENFAnalysisResult} from "../model/ENFAnalysisResult";
import {ENFEventBase} from "./events/ENFEventBase";
import {PreScanUpdate} from "../model/preScanUpdate";

/**
 * A class implementing ENFProcessor can perform ENF Analysis on media sources
 */
export interface ENFProcessor {
    /**
     * Performs a full ENF analysis on the supplied resource.
     *
     * @param resourceUri
     * A URI pointing towards an audiovisual source. Not all implementations of Analyzer will be able to
     * handle all media source types
     * @param gridIds
     * a string array containing grid identifiers
     * @param from
     * an optional date to start searching from
     * @param to
     * an optional date at which to stop searching
     * @param expectedFrequency
     * an optional integer of either 50 or 60 defining the expected frequency of the mains hum on the recording
     */
    performFullAnalysis(resourceUri: string, gridIds: string[], from?: Date, to?: Date, expectedFrequency?: 50|60): Promise<ENFAnalysis>

    /**
     Fired when any stage of the analysis progresses. The number returned by the event is between 0 and 1 and represents the
     approximate progress of the entire analysis.
     @eventProperty
     */
    readonly analysisProgressEvent: ENFEventBase<number>

    /**
     Fires logging information.
     @eventProperty
     */
    readonly logEvent: ENFEventBase<string>

    /**
     * Fired whenever a full ENF Analysis of a file is completed
     * @eventProperty
     */
    readonly fullAnalysisCompleteEvent: ENFEventBase<ENFAnalysis>

    /**
     * Performs a pre-scan of the supplied resource. A pre-scan should analyze the resource as quickly as possible
     * and return frequency strengths at the fundamental and first 2 harmonics at both 50 and 60HZ
     * (so 50Hz, 100Hz, 200Hz and 60Hz, 120Hz and 180Hz). The {@link PreScanResultLike} can then be passed to the
     * {@link analyze} function to determine if a full analysis should take place and at what frequency(s)
     * @param resourceUri
     * A URI pointing towards an audiovisual source.
     */
    preScan(resourceUri: string): Promise<PreScanResultLike>

    /**
     * Fired when a new window of audio has been pre-scanned. The number in the second argument is between 0 and 1 and
     * represents the approximate progress of the pre-scan phase
     * @eventProperty
     */
    readonly onPreScanProgressEvent: ENFEventBase<[PreScanUpdate, number]>

    /**
     * Fired when a pre-scan has completed
     * @eventProperty
     */
    readonly onPreScanCompleteEvent: ENFEventBase<PreScanResultLike>

    /**
     * Extracts mains-hum frequencies from the supplied resource. The returned {@link AnalysisWindowResult}[]
     * contains the analysis performed on windows of data. Note that:
     * - the windows could overlap
     * - the type of {@link AnalysisWindowResult.data} returned by {@link analyze} is undefined so this type
     * must be consumable by the subsequent {@link reduce} function
     *
     * @param resourceUri
     * A URI pointing towards an audiovisual source.
     * @param preScanResult
     * A preScanResult object from the previous step. A preScanResult allows the analysis step to:
     * - decide if an analysis should run at all
     * - decide which frequencies to scan for
     * @param expectedFrequency optional, the expected mains frequency, if passed by the user. You'd use this if you know
     * that the audio was recorded in, for example, Central Europe, so the expected frequency would be 50HZ
     *
     * @throws {NoMatch} if the {@link PreScanResultLike} indicates a full analysis should not take place
     */
    analyze(resourceUri: string, preScanResult: PreScanResultLike, expectedFrequency: 50|60|undefined): Promise<AnalysisWindowResult[]>

    /**
     Fired when a window of audio has been analyzed. The number in the second argument is between 0 and 1 and represents
     the approximate progress of the analysis phase
     @eventProperty
     */
    readonly onAnalyzeProgressEvent: ENFEventBase<[AnalysisWindowResult, number]>

    /**
     Fired when the analysis phase is completed
     @eventProperty
     */
    readonly onAnalyzeCompleteEvent: ENFEventBase<AnalysisWindowResult[]>

    /**
     * Reduces an array of {@link AnalysisWindowResult} to a nullable number array representing the mains hum frequency
     * for each second of audio. The frequencies should be normalised to the base frequency (either 50 or 60hz) even if the
     * analysis is performed on a higher harmonic (i.e. 100, 200, 120 or 240hz). A null value here represents a second
     * of audio for which the mains hum frequency could not be accurately determined.
     *
     * During the analysis phase frequency data could be returned for multiple harmonics and for multiple channels and for
     * overlapping windows of time. The {@link reduce) phase is responsible for reducing this data to a frequency array
     * of float values and nulls, representing the mains-hum frequency for each second of audio. The frequency array
     * is then passed to the {@link lookup} function
     *
     * @param analysisResults
     * The AnalysisWindowResult array returned from the analysis phase.
     *
     * @throws {NoMatch} if a sufficiently strong mains hum signal cannot be derived from the audio. This can happen if
     * - The low-frequency signal is weak
     * - The low-frequency signal is too variable (and hence is unlikely to be caused by mains hum)
     */
    reduce(analysisResults: AnalysisWindowResult[]): Promise<(number | null)[]>

    /**
     Fired when the reduce phase is completed
     @eventProperty
     */
    readonly onReduceCompleteEvent: ENFEventBase<(number | null)[]>

    /**
     * Compares the nullable-numeric hum frequency array to one or more grid frequency databases as specified
     * by the gridIds parameter. The grid frequency comparison could take place over a network, via a scripted
     * command line tool, or by directly querying a local grid frequency database.
     * @param freqs
     * A list of nullable floats representing the mains frequency detected for each second of audio. A null value
     * here represents a second of audio where mains hum could not be detected. Regardless of implementation
     * a lookup will require at least 10 non-contiguous non-null values to return a good result
     * @param gridIds
     * And array of grid IDs representing the grids to which the frequencies should be compared. Eg. ["DE","GB"].
     * At least one grid id is required.
     * @param from
     * an optional date to start searching from. If not present the grids will be searched from the start.
     * @param to
     * an optional date at which to stop searching. If not present the grids will be searched to the end.
     *
     * @returns
     * An array of {@link LookupResult} ordered by match closeness. Typically, this could return several hundred items,
     * many of which will be clusters of time-adjacent results. This array will be passed to a {@link refine} function
     * to determine for which value within each cluster is the best match and hence give a more meaningful result
     *
     * @throws {NoMatch} if no match can be found in the specified grids. Normally this is the result of a very short
     * frequency array or date search range
     *
     * @throws {RangeError} if the gridIds array is empty
     */
    lookup(freqs: (number | null)[], gridIds: string[], from?: Date, to?: Date): Promise<LookupResult[]>

    /**
     Fired when the lookup phase is completed. The number returned by the event is between 0 and 1 and represents the
     approximate lookup progress.
     @eventProperty
     */
    readonly lookupProgressEvent: ENFEventBase<number>

    /**
     Fired when the lookup phase is completed
     @eventProperty
     */
    readonly onLookupCompleteEvent: ENFEventBase<LookupResult[]>

    /**
     * Refines an array of type LookupResult to an ENFAnalysisResult array. Implementations would typically:
     * - group the LookupResults into clusters of time-contiguous results
     * - determine the peak match within each cluster
     * - retrieve all the results around each peak to determine the kurtosis (peakiness) of the result
     * - convert the timestamp offsets into dates for each result
     */
    refine(lookupFrequencies:(number|null)[], lookupResults: LookupResult[]): Promise<ENFAnalysisResult[]>

    /**
     Fired when the refine phase is completed
     @eventProperty
     */
    readonly onRefineCompleteEvent: ENFEventBase<ENFAnalysisResult[]>
}
