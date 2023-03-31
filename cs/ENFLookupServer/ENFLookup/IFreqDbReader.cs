namespace ENFLookup;

/// <summary>
/// A freqdb reader implementing <see cref="IFreqDbReader"/> can read a sequence of frequency differences from a single electrical grid. It compares a specified sequence of frequency differences against frequencies in it's store
/// (which could be a stream over a network, local memory, etc) and returns the magnitude of those differences as a score and the position of that score within the db
/// </summary>
public interface IFreqDbReader
{
    /// <summary>
    /// Calculates the absolute difference between the supplied frequency sequence and the subsequence at every position in the grid between
    /// the startTime and endTime parameters. The results are inserted to the
    /// resultLeague which has a maximum size and which will only store the lowest scores. Storing a limited number of scores allows for considerable
    /// efficiency improvement as we can stop calculating scores that are already greater than the highest score currently in the result league
    /// </summary>
    /// <param name="freqs">
    /// A normalised sequence of shorts representing the deviation from the base frequency. A null value is represented by short.max.
    /// Example: a sequence of absolute frequencies like <code>[49.999, 50, 50.001, null]</code> should be passed to the lookup as <code>[-1,0,1,32768]</code>
    /// </param>
    /// <param name="maxSingleDiff">
    /// The maximum difference allowed for a single comparison of values on the grid.
    /// Example: if a maxSingleDiff value of 10 was used with a freq array like [1,2,3,4] then the subsequence [11,2,3,4] would be rejected
    /// completely as soon as the first single diff (1 - 11) was calculated. Passing a low value here can yield considerable speed improvements
    /// at the cost of rejecting potentially good matches if the freq array contains a small number of outlier values. If you're confident
    /// that the values in your frequency sequence are accurate you can set this value fairly low (e.g. 10) to see a roughly 4x speed improvement
    /// - but bear in mind that you will likely miss the best match if your frequency sequence contains even a small amount of noise.
    /// <example></example>
    /// </param>
    /// <param name="startTime">
    /// The index from which to start searching. This can be derived from a UNIX timestamp by subtracting the StartDate from the reader's
    /// <see cref="GetFreqDbMetaData"/> result.
    /// </param>
    /// <param name="endTime">
    /// The index at which to stop searching. This can be derived from a UNIX timestamp by the StartDate from the reader's
    /// <see cref="GetFreqDbMetaData"/> result.</param>
    /// <param name="numThreads">
    /// The number of threads to use during the lookup operation. Generally it makes sense to set this as the number of cores available to the machine.
    /// </param>
    /// <param name="resultLeague">
    /// This is where the Lookup will pass the results. We pass a <see cref="ResultLeague"/> as a parameter because if we use a single
    /// ResultLeague across multiple readers (i.e. when we're searching across multiple grids) we can search much more efficiently.
    /// </param>
    /// <param name="cancellationToken">
    /// A standard .Net <see cref="CancellationToken"/>. It's important to pass one of these if you ever want to cancel a lookup request
    /// as if you don't it's likely that the very processor-intensive request will continue running until completion.
    /// </param>
    /// <param name="onProgress">
    /// An optional callback action fired when progress has been made during the lookup operation. The double value passed to this callback
    /// is between 0 and 1 where 0 means no progress and 1 means the lookup has completed. Any class implementing <see cref="IFreqDbReader"/> must
    /// decide how to implement this callback and how accurate and frequent any calls to this action will be.
    /// </param>
    public Task Lookup(short[] freqs, int maxSingleDiff, long startTime, long endTime,
        int numThreads, ResultLeague resultLeague, CancellationToken cancellationToken, Action<double>? onProgress = null);

    /// <summary>
    /// Returns a closeness score for <see cref="freqs"/> for each position around the <see cref="aroundTs"/> parameter. This is used to at the
    /// Refine stage of the ENF Analysis to obtain the scores for positions near the closest match so wen can calculate the Kurtosis of the match.
    /// </summary>
    /// <param name="freqs">This is the same sequence of frequencies used in the Lookup stage and passed to the <see cref="Lookup" method/></param>
    /// <param name="aroundTs">This will be the position of the match we want to search around. Typically this is the best match returned from
    /// the <see cref="Lookup"/> method.</param>
    /// <param name="diffBefore">The number of seconds preceding the <see cref="aroundTs"/> position we want to get scores for.</param>
    /// <param name="diffAfter">The number of seconds following the <see cref="aroundTs"/> position we want to get scores for.</param>
    /// <returns>A series of <see cref="LookupResult"/>s for each position around <see cref="aroundTs"/> </returns>
    public Task<IEnumerable<LookupResult>> ComprehensiveLookup(short[] freqs, long aroundTs, int diffBefore, int diffAfter);
    
    /// <summary>
    /// This returns closeness scores to the <see cref="freqs"/> sequence for each position in <see cref="positions"/>. Performing a lookup
    /// for long sequences of frequencies (typically longer than 10 minutes) can take a long time. It can be more efficient to obtain, say,
    /// the 100 closest matches for a shorter section of the sequence and then get the scores for the full sequence at each of the closest matches.
    /// We'd use the <see cref="TargetedLookup"/> method for that purposes.
    /// </summary>
    /// <param name="freqs">This is the same sequence of frequencies used in the Lookup stage and passed to the <see cref="Lookup" method/></param>
    /// <param name="positions">An enumerable of specific positions within the grid where we want to get a score.</param>
    /// <returns>A series of <see cref="LookupResult"/>s for each of the <see cref="positions"/> </returns>
    public Task<IEnumerable<LookupResult>> TargetedLookup(short[] freqs, IEnumerable<double> positions);

    /// <summary>
    /// Returns the <see cref="FreqDbMetaData"/> for the grid.
    /// </summary>
    /// <returns></returns>
    public FreqDbMetaData GetFreqDbMetaData();
}