using Newtonsoft.Json;

namespace ENFLookup;

public class FsFreqDbReader
{
    private readonly string _filepath;
    private readonly short[] _shortArray;

    public FsFreqDbReader(string filepath)
    {
        _filepath = filepath;
        var filestream = new FileStream(_filepath, FileMode.Open);
        var header = "";
        var separatorCount = 0;
        while (true)
        {
            var buffer = new byte[1];
            filestream.Read(buffer);
            if (buffer[0] != 0x0d)
            {
                header += (char)buffer[0];
            }
            else
            {
                separatorCount++;
            }

            if (separatorCount == 5)
            {
                break;
            }
        }

        FreqDbMetaData = JsonConvert.DeserializeObject<FreqDbMetaData>(header);
        var remainingBytes = filestream.Length - filestream.Position;
        FreqDbMetaData.EndDate = FreqDbMetaData.StartDate + (int)(remainingBytes / 2);
        var byteArray = new byte[remainingBytes];
        filestream.Read(byteArray);
        _shortArray = byteArray.ToShortArray();
    }

    public FreqDbMetaData FreqDbMetaData { get; set; }

    public short[] ReadDbToArray()
    {
        return _shortArray;
    }

    public IEnumerable<LookupResult> ComprehensiveLookup(short[] freqs, int aroundTs, int diffBefore, int diffAfter)
    {
        int startTime = aroundTs - diffBefore;
        int endTime = aroundTs + diffAfter;
        int maxSingleDiff = 10000;
        List<LookupResult> results = new List<LookupResult>();
        this.ThreadSafeLookup(startTime, endTime, freqs.ToList(), maxSingleDiff, _shortArray, (score, position) => {
            LookupResult lookupResult = new LookupResult();
            lookupResult.Position = position;
            lookupResult.Score = score;
            results.Add(lookupResult);
        });
        return results;
    }

    public IEnumerable<LookupResult> Lookup(short[] freqs, int maxSingleDiff, int startTime, int endTime,
        int numThreads)
    {
        if (endTime <= startTime)
        {
            throw new ArgumentException("Was expecting endTime to be greater than startTime");
        }
        var threadBounds = LookupHelpers.GetArrayThreadBounds(endTime - startTime, numThreads, freqs.Length);
        var resultLeague = new ResultLeague(100);
        var tasks = new List<Task>();
        foreach (var threadBound in threadBounds)
        {
            var clone = ((short[])freqs.Clone()).ToList();
            var task = Task.Run(() =>
            {
                ThreadSafeLookup(threadBound.Start, threadBound.End, clone, maxSingleDiff, _shortArray, (score, position) =>
                {
                    resultLeague.Add(new LookupResult(score,position));
                });
            });
            tasks.Add(task);
        }

        Task.WaitAll(tasks.ToArray());
        return resultLeague.Results;
    }

    public void ThreadSafeLookup(double startTime, double endTime, List<short> freqs, int maxSingleDiff, short[] largeArray, Action<int, double> onNewResult) {
        var i = startTime;
        var resultPosition = startTime - 1;
        var scores = new List<ushort>();
        var compareArray = new List<short>();
        var largeArraySize = largeArray.Length;
        var freqsSize = freqs.Count;
        var lastIndexToRead = Math.Min(largeArraySize, (endTime + freqsSize));
        while (true) {
            scores.Add(0);
            if (freqs.Count > 0) {
                var firstElement = freqs[0];
                compareArray.Add(firstElement);
                freqs.RemoveAt(0);
            }
            if (i >= lastIndexToRead) {
                break;
            }
            var compareArraySize = compareArray.Count;
            var newValue = largeArray[(int)i];
            i++;
            for (var j = 0; j < compareArraySize; j++)
            {
                if (scores[j] == ushort.MaxValue) continue;
                var compareValue = compareArray[compareArraySize - 1 - j];
                if (compareValue == ushort.MaxValue) continue;
                var newDiff = (ushort)Math.Abs(compareValue - newValue);
                if (newDiff > maxSingleDiff) {
                    scores[j] = ushort.MaxValue;
                } else {
                    scores[j] += newDiff;
                }
            }

            if (scores.Count < freqsSize) continue;
            resultPosition++;
            ushort front = scores[0];
            if (front != ushort.MaxValue) {
                onNewResult(front, resultPosition);
            }
            scores.RemoveAt(0);
        }
    }

}