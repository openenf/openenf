namespace ENFLookup;

/// <summary>
/// Key data relating to a .freqdb file.
/// </summary>
public class FreqDbMetaData
{
    /// <summary>
    /// A unique string identifier for the grid, currently 2 characters, e.g. "GB", "DE"
    /// </summary>
    public string GridId { get; set; } = "";
    
    /// <summary>
    /// A UNIX timestamp for the start time of the grid data
    /// </summary>
    public long StartDate { get; set; }
    
    /// <summary>
    /// A UNIX timestamp for the end time of the grid data
    /// </summary>
    public long EndDate { get; set; }
    
    /// <summary>
    /// Either 50 or 60, representing the base frequency of the grid
    /// </summary>
    public int BaseFrequency { get; set; }
}