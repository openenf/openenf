namespace ENFLookup;

public interface ILookupRequestHandler
{
    public IList<LookupResult> Lookup(LookupRequest lookupRequest, Action<double> onProgress = null);
}