/**
 * Reasons why an analysis fails to find a timestamp
 */
export declare enum NoMatchReason {
    /**
     * The sample rate or number of channels cannot be determined from the audio resource.
     */
    MetaDataError = "MetaDataError",
    /**
     * A piece of audio expected to contain 60hz mains hum instead contains a strong 50hz signal. This typically
     * happens when another low frequency sound source (e.g. bass guitar/machinery) is present in the audio.
     */
    DominantFifty = "DominantFifty",
    /**
     * A piece of audio expected to contain 50hz mains hum instead contains a strong 60hz signal. This typically
     * happens when another low frequency sound source (e.g. bass guitar/machinery) is present in the audio.
     */
    DominantSixty = "DominantSixty",
    /**
     * No strong hum signal is found in the audio. This is pretty common, especially if the audio is recorded outside
     */
    NoStrongSignal = "NoStrongSignal",
    /**
     * A hum signal is found but returns no results when compared to the database. This is relatively rare and is usually
     * caused by audio where a lot of non-mains noise is present.
     */
    NoResultsOnLookup = "NoResultsOnLookup"
}
