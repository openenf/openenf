namespace ENFLookup;

public class ComprehensiveLookupRequest
{
    public decimal?[] Freqs { get; set; }
    public int Around { get; set; }
    public int Range { get; set; }
    public string GridId { get; set; }
}