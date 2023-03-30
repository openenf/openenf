namespace ENFLookup;

public class NonConsecutiveResultLeague : ResultLeague
{
    public override void Add(LookupResult newResult)
    {
        lock (_lockObject)
        {
            // ReSharper disable once ReplaceWithSingleOrDefault.1 The resharper suggestion doesn't work for structs - you end up with a default LookupResult not a default nullable LookupResult? - i.e. null
            LookupResult? leftAdjacent = Results.Any(x => x.Position == newResult.Position - 1) ? Results.Single(x => x.Position == newResult.Position - 1) : null;
            // ReSharper disable once ReplaceWithSingleOrDefault.1
            LookupResult? rightAdjacent = Results.Any(x => x.Position == newResult.Position + 1) ? Results.Single(x => x.Position == newResult.Position + 1) : null;
            if (leftAdjacent != null && rightAdjacent == null)
            {
                if (leftAdjacent.Value.Score > newResult.Score)
                {
                    Results[Results.IndexOf(leftAdjacent.Value)] = newResult;
                }
                Results = Results.OrderBy(x => x.Score).ToList();
                return;
            }

            if (leftAdjacent == null && rightAdjacent != null)
            {
                if (leftAdjacent.Value.Score > newResult.Score)
                {
                    Results[Results.IndexOf(rightAdjacent.Value)] = newResult;
                }
                Results = Results.OrderBy(x => x.Score).ToList();
                return;
            }

            if (leftAdjacent != null && rightAdjacent != null)
            {
                var leftIndex = Results.IndexOf(leftAdjacent.Value);
                if (leftAdjacent.Value.Score > newResult.Score)
                {
                    Results.RemoveAt(leftIndex);
                }

                if (rightAdjacent.Value.Score > newResult.Score)
                {
                    Results.RemoveAt(Results.IndexOf(rightAdjacent.Value));
                }

                if (newResult.Score < leftAdjacent.Value.Score && newResult.Score < rightAdjacent.Value.Score)
                {
                    Results.Insert(leftIndex - 1, newResult);
                }
                Results = Results.OrderBy(x => x.Score).ToList();
                return;
            }

            base.Add(newResult);
        }
    }

    public NonConsecutiveResultLeague(int maxSize) : base(maxSize)
    {
    }
}