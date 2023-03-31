namespace ENFLookup;

/// <summary>
/// A ResultLeague is responsible for:
/// - Holding the top N <see cref="LookupResult"/>s
/// - Rejecting results that are greater than the maximum result once the ResultLeague is full
/// - Keeping the results ordered, with the lowest scoring (and hence closest) <see cref="LookupResult"/> at the top opf the Results list.
/// - Reporting the current highest scoring result in the league.
/// - Handling requests to add new results from multiple threads (i.e. it's thread-safe)
/// </summary>
public class ResultLeague
{
    private readonly int _maxSize;

    protected readonly object _lockObject = new();

    /// <summary>
    /// We need to specify the size of the result league in the constructor
    /// </summary>
    /// <param name="maxSize"></param>
    public ResultLeague(int maxSize)
    {
        _maxSize = maxSize;
    }

    public IList<LookupResult> Results { get; } = new List<LookupResult>();
    
    /// <summary>
    /// This is used during lookup so we can terminate a frequency sequence calculation early if the score has already
    /// exceeded the <see cref="MaxValue"/> in the league.
    /// </summary>
    public int MaxValue { get; private set; } = Int32.MaxValue;

    /// <summary>
    /// Attempts to add a new result to the league.
    /// </summary>
    /// <param name="newResult"></param>
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