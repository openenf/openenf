namespace ENFLookup.test;

public class MockLookupRequestHandler : ILookupRequestHandler {
    public void Lookup(LookupRequest lookupRequest)
    {
        this.LookupRequest = lookupRequest;
    }

    public LookupRequest LookupRequest { get; set; }
}