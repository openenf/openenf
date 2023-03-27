namespace ENFLookup;

public class ResultLeague
{
    private readonly int _maxSize;
    
    private readonly object _lockObject = new();

    public ResultLeague(int maxSize)
    {
        _maxSize = maxSize;
    }

    public IList<LookupResult> Results { get; set; } = new List<LookupResult>();
    public int MaxValue { get; set; } = Int32.MaxValue;

    public void Add(LookupResult lookupResult)
    {
        lock (_lockObject) { // acquire the lock
            // perform thread-safe operations here
            bool inserting = false;
            var resultsSize = Results.Count();
            //Check to see if the results array is already at maximum size.
            if (resultsSize >= _maxSize) {
                //Because the array is always sorted from the lowest score to highest the last entry will always have the maximum value:
                int maxValue =  Results.Last().Score;
                //If the new score is greater than the current max value there's nothing left to do.
                if (lookupResult.Score >= maxValue) {
                    return;
                }
                //Conversely, if the new score is lower than the current maximum, we're going to need to evict the current maximum
                //value to make way for this one:
                else {
                    inserting = true;
                }
            }
            for (int i = resultsSize - 1; i >= 0; i--) {
                if (lookupResult.Score > Results[i].Score) {
                    Results.Insert(i+1, lookupResult);
                    if (inserting) {
                        Results.RemoveAt(Results.Count - 1);
                    }
                    return;
                }
            }
            Results.Insert(0, lookupResult);
            if (inserting) {
                Results.RemoveAt(Results.Count - 1);
            }

            MaxValue = Results.Last().Score;
        }
    }
}