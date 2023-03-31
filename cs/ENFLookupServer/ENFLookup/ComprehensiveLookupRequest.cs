namespace ENFLookup;

/// <summary>
/// ComprehensiveLookupRequest represents a request for a lookup score at every point around the
/// Around parameter, ± the Range.
/// </summary>
public class ComprehensiveLookupRequest
{
    /// <summary>
    /// A nullable-decimal array of frequencies.
    /// </summary>
    /// <example>[50, 49.99, null, 50.1]</example>
    public decimal?[] Freqs { get; set; } = Array.Empty<decimal?>();
    
    /// <summary>
    /// The the index in the grid array to search around. Note that this is not Unix timestamp but offset value from the start of the grid
    /// </summary>
    public long Around { get; set; }
    
    /// <summary>
    /// The range of values before and after the Around value that should be searched
    /// </summary>
    /// <example>12</example>
    public int Range { get; set; }

    /// <summary>
    /// The grid Id of the grid to be searched
    /// </summary>
    /// <example>"GB"</example>
    public string GridId { get; set; } = "";
}