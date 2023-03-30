namespace ENFLookup.test;

public class MockFreqDbReader : IFreqDbReader
{
    public ResultLeague ResultLeague { get; set; }

    public IEnumerable<LookupResult> Lookup(short[] freqs, int maxSingleDiff, long startTime, long endTime, int numThreads, ResultLeague resultLeague, CancellationToken token, Action<double> onProgress)
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
        return null;
    }

    public Action<double> OnProgress { get; set; }
    
    public Action SimulateProgress { get; set; }

    public int MaxSingleDiff { get; set; }

    public short[] Freqs { get; set; }

    public int NumThreads { get; set; }

    public long EndTime { get; set; }

    public long StartTime { get; set; }

    public IEnumerable<LookupResult> ComprehensiveLookup(short[] freqs, long aroundTs, int diffBefore, int diffAfter)
    {
        Freqs = freqs;
        AroundTs = aroundTs;
        DiffBefore = diffBefore;
        DiffAfter = diffAfter;
        return null;
    }

    public IEnumerable<LookupResult> TargetedLookup(short[] freqs, IEnumerable<double> targets)
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

    public FreqDbMetaData FreqDbMetaData { get; set; } = null;
}