namespace ENFLookup;

public interface IResultLeague
{
    public IList<LookupResult> Results { get; set; }
    public int MaxValue { get; set; }

    public void Add(LookupResult newResult);
}