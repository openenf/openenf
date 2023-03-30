namespace ENFLookup;

public class ResultLeague : IResultLeague
{
    private readonly int _maxSize;

    protected readonly object _lockObject = new();

    public ResultLeague(int maxSize)
    {
        _maxSize = maxSize;
    }

    public IList<LookupResult> Results { get; set; } = new List<LookupResult>();
    public int MaxValue { get; set; } = Int32.MaxValue;

    public virtual void Add(LookupResult newResult)
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
                if (newResult.Score >= maxValue) {
                    return;
                }
                //Conversely, if the new score is lower than the current maximum, we're going to need to evict the current maximum
                //value to make way for this one:
                else {
                    inserting = true;
                }
            }
            for (int i = resultsSize - 1; i >= 0; i--) {
                if (newResult.Score > Results[i].Score) {
                    Results.Insert(i+1, newResult);
                    if (inserting) {
                        Results.RemoveAt(Results.Count - 1);
                    }
                    return;
                }
            }
            Results.Insert(0, newResult);
            if (inserting) {
                Results.RemoveAt(Results.Count - 1);
            }

            MaxValue = Results.Last().Score;
        }
    }
}