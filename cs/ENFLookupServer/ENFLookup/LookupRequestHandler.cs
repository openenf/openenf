namespace ENFLookup;

/// <summary>
/// The responsibilities of a <see cref="LookupRequestHandler"/> are to:
/// - Convert absolute frequencies in a lookup request into normalised frequencies (i.e. change 49.999, 50, 50.001 into -1,0,1)
/// - Pass the request to the correct freqdb readers
/// - Aggregate the progress of the readers onProgress events into it's own unified onProgress event
/// </summary>
public class LookupRequestHandler : ICanAddDbReader
{
    /// <summary>
    /// See <see cref="IFreqDbReader"/> for an explanation of MaxSingleDiff. 
    /// </summary>
    const int DefaultMaxSingleDiff = 10000;
    
    /// <summary>
    /// The longest frequency sequence that will be searched directly. For sequences longer than <see cref="ContiguousSearchLimit"/>
    /// the best matches for a subsequence of length <see cref="ContiguousSearchLimit"/> will be searched directly and then scores for
    /// the full sequence will determined for each of those matches. This can speed up lookups considerably but at this risk of missing
    /// the best match if a strong signal lies outside the selected subsequence.
    /// </summary>
    const int ContiguousSearchLimit = 10000;
    
    /// <summary>
    /// The number of results to return from the lookup. Returning just one result can be much faster than returning multiple results
    /// but several results may be desirable if the original audio is noisy and the best match candidate is unclear.
    /// </summary>
    private const int DefaultNumResults = 1;

    /// <summary>
    /// We're specifying the number of results returned by a lookup in the constructor. See <see cref="DefaultNumResults"/> for why you might want to vary the
    /// number of results returned from a lookup.
    /// </summary>
    /// <param name="numResults"></param>
    public LookupRequestHandler(int? numResults = null)
    {
        _resultLeagueSize = numResults ?? DefaultNumResults;
        _numThreads = Environment.ProcessorCount;
        Console.WriteLine($"LookupRequestHandler created. MaxSingleDiff: {DefaultMaxSingleDiff}");
    }

    private readonly IDictionary<string, IFreqDbReader> _readers = new Dictionary<string, IFreqDbReader>();
    private readonly int _resultLeagueSize;
    private readonly int _numThreads;

    public async Task<IList<LookupResult>> Lookup(LookupRequest lookupRequest, Action<double>? onProgress,
        CancellationToken cancellationToken)
    {
        if (lookupRequest.EndTime < lookupRequest.StartTime)
        {
            throw new ArgumentException($"Was expecting start time to be before end time but got start time: {lookupRequest.StartTime} end time: {lookupRequest.EndTime}");
        }
        
        var normalisedFreqs = lookupRequest.Freqs.ToShortArray();
        var lookupFreqs = (short[])normalisedFreqs.Clone();
        var resultLeague = new ResultLeague(_resultLeagueSize);
        var gridCount = 0;
        var gridsToBeRead = _readers.Keys.Intersect(lookupRequest.GridIds).Count();
        var progressPerGrid = 1.0 / gridsToBeRead;
        long offset = 0;

        if (normalisedFreqs.Length > ContiguousSearchLimit)
        {
            var subsequence = FrequencyUtils.GetStrongestSubsequence(normalisedFreqs, ContiguousSearchLimit);
            offset = subsequence.position;
            lookupFreqs = subsequence.sequence;
        }

        foreach (var gridId in lookupRequest.GridIds)
        {
            if (!_readers.ContainsKey(gridId)) continue;
            var reader = _readers[gridId];
            var metaData = reader.GetFreqDbMetaData();
            var startEnd = GridDateHelper.CalculateLookupTs(lookupRequest.StartTime, lookupRequest.EndTime,
                metaData.StartDate, metaData.EndDate);
            var count = gridCount;
            reader.Lookup(lookupFreqs, DefaultMaxSingleDiff, startEnd.Item1, startEnd.Item2, _numThreads, resultLeague, cancellationToken, d =>
            {
                var aggregatedProgress = Math.Round(count * progressPerGrid + (d / gridsToBeRead), 3);
                onProgress?.Invoke(aggregatedProgress);
            });
            gridCount++;
        }

        if (normalisedFreqs.Length > ContiguousSearchLimit)
        {
            var results = new List<LookupResult>();
            var groups = resultLeague.Results.GroupBy(x => x.GridId);
            foreach (var group in groups)
            {
                var targets = group.Select(x => x.Position - offset);
                var targetedResults = await _readers[group.Key].TargetedLookup(lookupRequest.Freqs.ToShortArray(), targets);
                results.AddRange(targetedResults);
            }

            return results;
        }

        return resultLeague.Results;
    }

    public Task<IEnumerable<LookupResult>> ComprehensiveLookup(ComprehensiveLookupRequest comprehensiveLookupRequest)
    {
        var gridId = comprehensiveLookupRequest.GridId;
        if (!_readers.ContainsKey(gridId))
        {
            throw new ArgumentException($"No freqdb loaded with grid id ${gridId}");
        }

        long aroundTs = comprehensiveLookupRequest.Around;
        var reader = _readers[gridId];
        var normalisedFreqs = comprehensiveLookupRequest.Freqs.ToShortArray();
        var result = reader.ComprehensiveLookup(normalisedFreqs, aroundTs, comprehensiveLookupRequest.Range,
            comprehensiveLookupRequest.Range);
        return result;
    }

    public FreqDbMetaData? GetMetaData(string gridId)
    {
        if (!_readers.ContainsKey(gridId))
        {
            return null;
        }

        return _readers[gridId].GetFreqDbMetaData();
    }

    public static DateTime UnixTimeStampToDateTime(double unixTimeStamp)
    {
        // Unix timestamp is seconds past epoch
        DateTime dateTime = new DateTime(1970, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc);
        dateTime = dateTime.AddSeconds(unixTimeStamp).ToLocalTime();
        return dateTime;
    }

    public void AddFreqDbReader(IFreqDbReader freqDbReader)
    {
        var metaData = freqDbReader.GetFreqDbMetaData();
        Console.WriteLine(
            $"Loading {metaData.GridId} {metaData.BaseFrequency}Hz {UnixTimeStampToDateTime(metaData.StartDate)}-{UnixTimeStampToDateTime(metaData.EndDate)}");
        _readers[metaData.GridId] = freqDbReader;
    }
}