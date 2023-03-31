namespace ENFLookup;

/// <summary>
/// Represents a comparison of a frequency sequence to grid frequency data at the specified position. A score of zero represents
/// a perfect match.
/// </summary>
public struct LookupResult
{
    public LookupResult()
    {
        Score = 0;
        Position = 0;
        GridId = "";
    }

    public LookupResult(int score, double position, string gridId)
    {
        Score = score; 
        Position = position;
        GridId = gridId;
    }
    
    public LookupResult(int score, double position)
    {
        Score = score; 
        Position = position;
        GridId = "";
    }
    
    /// <summary>
    /// The id of the grid for against which this result was calculated.
    /// </summary>
    public string GridId { get; set; }
    
    /// <summary>
    /// The relative position of this result in the grid. To convert this to a UNIX timestamp you'll need to add it to the StartTime value
    /// from the grids <see cref="FreqDbMetaData"/>
    /// </summary>
    public double Position { get; set; }
    
    /// <summary>
    /// This is defined as the absolute difference of each frequency value of a frequency sequence and the subsequence of grid data starting at
    /// <see cref="Position"/>. A score of 0 represents a perfect match.
    /// </summary>
    public int Score { get; set; }
}