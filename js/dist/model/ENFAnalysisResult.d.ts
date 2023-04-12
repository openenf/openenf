/**
 * Represents a single match against a grid database. An ENFAnalysisResult array is the output of the final Refine stage
 * of analysis.
 */
export interface ENFAnalysisResult {
    /**
    The UTC time of the match against the grid.
     ]*/
    time: Date;
    /**
    The closeness of the match. Carried over from the corresponding {@link LookupResult}
     */
    score: number;
    /**
     * A score representing a prominent a match is compared to nearby matches. A high kurtosis score represents
     * a better match probability.
     */
    kurtosis: number | null;
    /**
     * This is the score divided by the {@link ENFAnalysis.nonNullDuration} value. It gives us a way of comparing
     * scores from pieces of audio of different lengths. Typically a score between 0 and -5 represents a good match,
     * between -5 and -10 is a possible match, and a score lower than -10 is a poor match, however short pieces of audio
     * are very difficult to match so this score should not be relied upon for authentication in the absence of
     * corroborating evidence
     */
    normalisedScore: number;
    /**
     * The gridID of the grid for this match.
     */
    gridId: string;
}
