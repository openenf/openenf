namespace ENFLookup.test;

public class MockLookupRequestHandler : ILookupRequestHandler {
    public IList<LookupResult> Lookup(LookupRequest lookupRequest, Action<double> onProgress = null)
    {
        LookupRequest = lookupRequest;
        return null;
    }

    public LookupRequest LookupRequest { get; set; }
}