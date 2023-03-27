namespace ENFLookup.test;

public class MockLookupRequestHandler : ILookupRequestHandler {
    public IList<LookupResult> Lookup(LookupRequest lookupRequest, Action<double> onProgress,
        CancellationToken cancellationToken)
    {
        LookupRequest = lookupRequest;
        return null;
    }

    public IEnumerable<LookupResult> ComprehensiveLookup(ComprehensiveLookupRequest comprehensiveLookupRequest)
    {
        throw new NotImplementedException();
    }

    public FreqDbMetaData GetMetaData(string gridId)
    {
        throw new NotImplementedException();
    }

    public LookupRequest LookupRequest { get; set; }
}