namespace ENFLookup;

public class LookupRequestHandler : ICanAddDbReader
{
    //TODO Max the MaxSingleDiff variable dependent on the request and/or grid
    const int DefaultMaxSingleDiff = 10000;

    public LookupRequestHandler(int resultLeagueSize = 10)
    {
        _resultLeagueSize = resultLeagueSize;
        _numThreads = Environment.ProcessorCount;
        Console.WriteLine($"LookupRequestHandler created. MaxSingleDiff: {DefaultMaxSingleDiff}");
    }

    private readonly IDictionary<string, IFreqDbReader> _readers = new Dictionary<string, IFreqDbReader>();
    private readonly int _resultLeagueSize;
    private readonly int _numThreads;

    public IList<LookupResult> Lookup(LookupRequest lookupRequest, Action<double> onProgress,
        CancellationToken cancellationToken)
    {
        if (lookupRequest.EndTime < lookupRequest.StartTime)
        {
            Console.WriteLine($"Was expecting start time to be before end time but got start time: {lookupRequest.StartTime} end time: {lookupRequest.EndTime}");
            return new List<LookupResult>();
        }
        Console.WriteLine(
            $"Lookup request received for grids: {string.Join(",", lookupRequest.GridIds)}. Using {_numThreads} threads.");
        var normalisedFreqs = lookupRequest.Freqs.ToShortArray();
        var resultLeague = new ResultLeague(_resultLeagueSize);
        var gridCount = 0;
        var gridsToBeRead = _readers.Keys.Intersect(lookupRequest.GridIds).Count();
        var progressPerGrid = 1.0 / gridsToBeRead;
        foreach (var gridId in lookupRequest.GridIds)
        {
            if (!_readers.ContainsKey(gridId)) continue;
            var reader = _readers[gridId];
            var metaData = reader.GetFreqDbMetaData();
            var startEnd = GridDateHelper.CalculateLookupTs(lookupRequest.StartTime, lookupRequest.EndTime,
                metaData.StartDate, metaData.EndDate);
            reader.Lookup(normalisedFreqs, DefaultMaxSingleDiff, startEnd.Item1, startEnd.Item2, _numThreads, resultLeague, cancellationToken, d =>
            {
                var aggregatedProgress = Math.Round(gridCount * progressPerGrid + (d / gridsToBeRead), 3);
                onProgress(aggregatedProgress);
            });
            gridCount++;
        }

        return resultLeague.Results;
    }

    public IEnumerable<LookupResult> ComprehensiveLookup(ComprehensiveLookupRequest comprehensiveLookupRequest)
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

    public FreqDbMetaData GetMetaData(string gridId)
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