namespace ENFLookup;

internal class ThreadLookupRequest
{
    public double StartTime { get; set; }
    public double EndTime { get; set; }
    public List<short> Freqs { get; set; } = new ();
    public int MaxSingleDiff { get; set; }
    public short[] GridArray { get; set; } = Array.Empty<short>();
}