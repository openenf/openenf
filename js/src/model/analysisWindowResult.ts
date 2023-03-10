/**
 * The output of frequency analysis for a single window of af audio. 
 */
export interface AnalysisWindowResult {
    /**
     * The start time of the window in seconds
     */
    start: number,
    
    /**
     * The end time of the window in seconds
     */
    end: number,

    /**
     * The start time of the window in samples
     */
    startSamples: number,

    /**
     * The end time of the window in samples
     */
    endSamples: number,

    /**
     * The result of the data analysis. This object typically includes a frequency reading. The responsibility of
     * converting this object into a frequency falls to the {@link Analyzer.reduce} function
     */
    data: any

    /**
     * The channel number of the audio being analysed (1 for left or mono, 2 for right)
     */
    channelNum: number
}