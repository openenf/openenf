namespace ENFLookup;

public interface IFreqDbReader
{
    public IEnumerable<LookupResult> Lookup(short[] freqs, int maxSingleDiff, long startTime, long endTime,
        int numThreads, ResultLeague resultLeague, CancellationToken token, Action<double> onProgress = null);

    public IEnumerable<LookupResult> ComprehensiveLookup(short[] freqs, long aroundTs, int diffBefore, int diffAfter);
    
    public IEnumerable<LookupResult> TargetedLookup(short[] freqs, IEnumerable<double> targets);

    public FreqDbMetaData GetFreqDbMetaData();
}