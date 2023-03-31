namespace ENFLookup;

public class GridDateHelper
{
    public static Tuple<long, long> CalculateLookupTs(DateTime? requestStart, DateTime? requestEnd, long gridStart,
        long gridEnd)
    {
        return new Tuple<long, long>(CalculateStartTs(requestStart, gridStart), CalculateEndTs(requestEnd, gridStart, gridEnd));
    }

    public static long CalculateStartTs(DateTime? requestStart, long gridStart)
    {
        if (!requestStart.HasValue)
        {
            return 0;
        }

        var requestStartTs = requestStart.Value.ToUnixTimeSeconds();
        if (requestStartTs < gridStart)
        {
            return 0;
        }

        return requestStartTs - gridStart;
    }
    
    public static long CalculateEndTs(DateTime? requestEnd, long gridStart, long gridEnd)
    {
        if (!requestEnd.HasValue)
        {
            return gridEnd - gridStart;
        }
        var requestEndTs = requestEnd.Value.ToUnixTimeSeconds();
        if (requestEndTs > gridEnd)
        {
            return gridEnd - gridStart; 
        }

        return requestEndTs - gridStart;
    }
}