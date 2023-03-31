namespace ENFLookup;

/// <summary>
/// The command types the <see cref="ENFLookupServer"/> understands.
/// </summary>
public enum ENFLookupServerCommands
{
    /// <summary>
    /// Pings the server just to check it's up and running.
    /// </summary>
    Ping,
    
    /// <summary>
    /// Finds the closest match to a given frequency array on the grid
    /// </summary>
    Lookup,
    
    /// <summary>
    /// Loads a grid .freqdb file into memory.
    /// </summary>
    LoadGrid,
    
    /// <summary>
    /// Returns an array of match scores for every grid position in the specified range
    /// </summary>
    ComprehensiveLookup,
    
    /// <summary>
    /// Returns the base frequency, grid id, start and end dates for a specific grid
    /// </summary>
    GetMetaData
}