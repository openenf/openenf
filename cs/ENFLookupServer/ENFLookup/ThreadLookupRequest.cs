namespace ENFLookup;

public class ThreadLookupRequest
{
    public double StartTime { get; set; }
    public double EndTime { get; set; }
    public List<short> Freqs { get; set; }
    public int MaxSingleDiff { get; set; }
    public short[] GridArray { get; set; }
}