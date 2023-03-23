namespace ENFLookup;

public class LookupRequestHandler : ICanAddDbReader
{
    //TODO Max the MaxSingleDiff variable dependent on the request and/or grid
    const int DefaultMaxSingleDiff = 1000;

    public LookupRequestHandler(int resultLeagueSize = 100)
    {
        _resultLeagueSize = resultLeagueSize;
        _numThreads = Environment.ProcessorCount;
    }

    private IDictionary<string, IFreqDbReader> _readers = new Dictionary<string, IFreqDbReader>();
    private readonly int _resultLeagueSize;
    private readonly int _numThreads;

    private readonly object _lockObject = new();

    public IList<LookupResult> Lookup(LookupRequest lookupRequest, Action<double> onProgress = null)
    {
        Console.WriteLine(
            $"Lookup request received for grids: {string.Join(",", lookupRequest.GridIds)}. Using {_numThreads} threads.");
        var normalisedFreqs = lookupRequest.Freqs.ToShortArray();
        var unixSecsStart = lookupRequest.StartTime.HasValue
            ? ((DateTimeOffset)lookupRequest.StartTime.Value).ToUnixTimeSeconds()
            : default(long?);
        var unixSecsEnd = lookupRequest.EndTime.HasValue
            ? ((DateTimeOffset)lookupRequest.EndTime.Value).ToUnixTimeSeconds()
            : default(long?);
        var resultLeague = new ResultLeague(_resultLeagueSize);
        var gridCount = 0;
        var gridsToBeRead = _readers.Keys.Intersect(lookupRequest.GridIds).Count();
        var progressPerGrid = 1.0 / gridsToBeRead;
        foreach (var gridId in lookupRequest.GridIds)
        {
            if (!_readers.ContainsKey(gridId)) continue;
            var reader = _readers[gridId];
            var metaData = reader.GetFreqDbMetaData();
            var unixStart = unixSecsStart.HasValue
                ? Math.Max(unixSecsStart.Value, metaData.StartDate)
                : metaData.StartDate;
            var unixEnd = unixSecsEnd.HasValue
                ? Math.Min(unixSecsEnd.Value, metaData.EndDate)
                : metaData.EndDate;
            var start = unixStart - metaData.StartDate;
            var end = unixEnd - unixStart;
            double lastAggregatedProgress = 0;
            reader.Lookup(normalisedFreqs, DefaultMaxSingleDiff, start, end, _numThreads, resultLeague, d =>
            {
                var aggregatedProgress = Math.Round(gridCount * progressPerGrid + (d / gridsToBeRead), 3);
                //if (aggregatedProgress > lastAggregatedProgress)
                //{
                    Console.WriteLine($"Progresszz: {aggregatedProgress}");
                    onProgress(aggregatedProgress);
                //}

                //lastAggregatedProgress = aggregatedProgress;
            });
            gridCount++;
        }

        return resultLeague.Results;
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