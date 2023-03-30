namespace ENFLookup;

public class LookupRequest
{
    public decimal?[] Freqs { get; set; }
    public string[] GridIds { get; set; }
    public DateTime? StartTime { get; set; }
    public DateTime? EndTime { get; set; }
}