namespace ENFLookup.test;

public class MockFreqDbReader : IFreqDbReader
{
    public ResultLeague? ResultLeague { get; set; }

    public Task Lookup(short[] freqs, int maxSingleDiff, long startTime, long endTime, int numThreads, ResultLeague resultLeague, CancellationToken cancellationToken, Action<double>? onProgress)
    {
        Freqs = freqs;
        MaxSingleDiff = maxSingleDiff;
        StartTime = startTime;
        EndTime = endTime;
        NumThreads = numThreads;
        ResultLeague = resultLeague;
        OnProgress = onProgress;
        if (SimulateProgress != null)
        {
            SimulateProgress();
        }
        return Task.CompletedTask;
    }

    public Action<double>? OnProgress { get; set; }
    
    public Action? SimulateProgress { get; set; }

    public int MaxSingleDiff { get; set; }

    public short[] Freqs { get; set; } = Array.Empty<short>();

    public int NumThreads { get; set; }

    public long EndTime { get; set; }

    public long StartTime { get; set; }

    public Task<IEnumerable<LookupResult>> ComprehensiveLookup(short[] freqs, long aroundTs, int diffBefore, int diffAfter)
    {
        Freqs = freqs;
        AroundTs = aroundTs;
        DiffBefore = diffBefore;
        DiffAfter = diffAfter;
        return Task.FromResult(new List<LookupResult>().AsEnumerable());
    }

    public Task<IEnumerable<LookupResult>> TargetedLookup(short[] freqs, IEnumerable<double> positions)
    {
        throw new NotImplementedException();
    }

    public int DiffAfter { get; set; }

    public int DiffBefore { get; set; }

    public long AroundTs { get; set; }

    public FreqDbMetaData GetFreqDbMetaData()
    {
        if (FreqDbMetaData == null)
        {
            FreqDbMetaData = new FreqDbMetaData
            {
                GridId = "XX",
                EndDate = 86400
            };
        }

        return FreqDbMetaData;
    }

    public FreqDbMetaData? FreqDbMetaData { get; set; }
}