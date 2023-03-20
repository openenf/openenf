namespace ENFLookup;

public struct LookupResult
{
    public LookupResult()
    {
        Score = 0;
        Position = 0;
    }

    public LookupResult(int score, double position)
    {
        Score = score; Position = position;
    }
    
    public double Position { get; set; }
    public int Score { get; set; }
}