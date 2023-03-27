namespace ENFLookup;

public interface ILookupRequestHandler
{
    public IList<LookupResult> Lookup(LookupRequest lookupRequest, Action<double> onProgress,
        CancellationToken cancellationToken );

    public IEnumerable<LookupResult> ComprehensiveLookup(ComprehensiveLookupRequest comprehensiveLookupRequest);
    FreqDbMetaData GetMetaData(string gridId);
}