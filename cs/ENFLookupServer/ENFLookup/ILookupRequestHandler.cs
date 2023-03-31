namespace ENFLookup;

/// <summary>
/// The responsibilities of a <see cref="LookupRequestHandler"/> are to:
/// - Convert absolute frequencies in a lookup request into normalised frequencies (i.e. change 49.999, 50, 50.001 into -1,0,1)
/// - Pass the request to the correct freqdb readers
/// - Aggregate the progress of the readers onProgress events into it's own unified onProgress event
/// </summary>
public interface ILookupRequestHandler
{
    /// <summary>
    /// Performs a frequency match lookup on each of the grids specified in the <see cref="LookupRequest"/>
    /// </summary>
    /// <param name="lookupRequest">
    ///Supplies the frequencies and specifies the grids and date ranges to search over.
    /// </param>
    /// <param name="onProgress">
    ///The <see cref="double"/> passed to this callback will be a value between 0 and 1 representing the progress through the lookup.
    /// Implementors of <see cref="ILookupRequestHandler"/> will have to determine how frequently to call this callback and how accurate the
    /// progress value will be.
    /// </param>
    /// <param name="cancellationToken">
    ///Allows requests to be cleanly cancelled.
    /// </param>
    /// <returns></returns>
    public Task<IList<LookupResult>> Lookup(LookupRequest lookupRequest, Action<double> onProgress,
        CancellationToken cancellationToken );

    /// <summary>
    /// Returns a closeness score for the frequency sequence specified in the request for each position around the <see cref="aroundTs"/> parameter. This is used at the
    /// Refine stage of analysis to obtain the scores for positions near the closest match so wen can calculate the kurtosis of the match.
    /// </summary>
    /// <param name="comprehensiveLookupRequest"></param>
    /// <returns></returns>
    public Task<IEnumerable<LookupResult>> ComprehensiveLookup(ComprehensiveLookupRequest comprehensiveLookupRequest);
    
    /// <summary>
    /// Returns the <see cref="FreqDbMetaData"/> for the grid with the specified <see cref="gridId"/>. Will return null if no grid
    /// with that id has been added to the handler.
    /// </summary>
    /// <param name="gridId"></param>
    /// <returns></returns>
    FreqDbMetaData? GetMetaData(string gridId);
}