using System.Runtime.CompilerServices;

[assembly:InternalsVisibleTo("ENFLookup.test")]
namespace ENFLookup;

internal static class LookupHelpers
{
    public static IEnumerable<ThreadBounds> GetArrayThreadBounds(int arrayLength, int numThreads, int freqLength)
    {
        var results = new List<ThreadBounds>();
        var startInterval = Math.Floor((double)arrayLength / numThreads);
        var remainder = arrayLength - (startInterval * numThreads);
        for(int i = 0; i < numThreads; i++) {
            double chunkRemainder = 0;
            if (i == numThreads - 1) {
                chunkRemainder = remainder + 1;
            }
            double start = i * startInterval;
            double end = Math.Min(arrayLength, ((i+1) * startInterval) - 1 + chunkRemainder);
            results.Add(new ThreadBounds
            {
                Start = start,
                End = end
            });
        }

        return results;
    }
}