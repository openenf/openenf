using System.Runtime.CompilerServices;

[assembly:InternalsVisibleTo("ENFLookup.test")]
namespace ENFLookup;

public static class LookupHelpers
{
    public static string GetDataFolder()
    {
        string path;
        if (OperatingSystem.IsWindows()) {
            // on Windows, use the ApplicationData folder
            path = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
        } else if (OperatingSystem.IsMacOS()) {
            // on macOS, use the Application Support folder
            var userPath = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
            path = Path.Combine(userPath, "Library", "Application Support");
        } else {
            // on Linux or other platforms, use the home directory
            path = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Personal),".config");
        }

        return Path.Combine(path, "openenf");
    }
    
    internal static IEnumerable<ThreadBounds> GetArrayThreadBounds(long startTime, long endTime, long numThreads, int freqLength)
    {
        var arrayLength = endTime - startTime;
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
                Start = start + startTime,
                End = end + startTime
            });
        }

        return results;
    }
}