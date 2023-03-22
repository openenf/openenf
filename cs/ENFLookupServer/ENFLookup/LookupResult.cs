namespace ENFLookup;

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

    public string GridId { get; set; }

    public double Position { get; set; }
    public int Score { get; set; }
}