using Newtonsoft.Json;

namespace ENFLookup;

public class FsFreqDbReader : IFreqDbReader
{
    private readonly string _filepath;
    private readonly short[] _shortArray;

    private const int MaxHeaderLength = 1024;

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

            if (filestream.Position > MaxHeaderLength)
            {
                throw new FormatException($"File at {_filepath} does not seem to be in the correct format.");
            }
        }

        if (separatorCount < 5)
        {
            throw new FormatException($"File at {_filepath} does not seem to be in the correct format.");
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

    public IEnumerable<LookupResult> ComprehensiveLookup(short[] freqs, long aroundTs, int diffBefore, int diffAfter)
    {
        var startTime = aroundTs - diffBefore;
        var endTime = aroundTs + diffAfter;
        int maxSingleDiff = 10000;
        List<LookupResult> results = new List<LookupResult>();
        var request = new ThreadLookupRequest
        {
            StartTime = startTime,
            EndTime = endTime,
            Freqs = freqs.ToList(),
            MaxSingleDiff = maxSingleDiff,
            LargeArray = _shortArray
        };
        this.ThreadSafeLookup(request, (score, position) =>
        {
            LookupResult lookupResult = new LookupResult();
            lookupResult.Position = position;
            lookupResult.Score = score;
            results.Add(lookupResult);
        }, CancellationToken.None);
        return results;
    }

    public FreqDbMetaData GetFreqDbMetaData()
    {
        return this.FreqDbMetaData;
    }

    public IEnumerable<LookupResult> Lookup(short[] freqs, int maxSingleDiff, long startTime, long endTime,
        int numThreads, ResultLeague resultLeague, CancellationToken token, Action<double> onProgress = null)
    {
        if (endTime <= startTime)
        {
            throw new ArgumentException("Was expecting endTime to be greater than startTime");
        }

        var threadBounds = LookupHelpers.GetArrayThreadBounds(startTime, endTime, numThreads, freqs.Length);
        var tasks = new List<Task>();
        var threadCount = 0;
        foreach (var threadBound in threadBounds)
        {
            var clone = ((short[])freqs.Clone()).ToList();
            Task task;
            //We're only adding a progress callback to the last thread since all threads are likely to progress at a similar rate:
            var request = new ThreadLookupRequest
            {
                StartTime = threadBound.Start,
                EndTime = threadBound.End,
                Freqs = clone,
                LargeArray = _shortArray,
                MaxSingleDiff = maxSingleDiff
            };
            if (threadCount == 0)
            {
                task = Task.Run(() =>
                {
                    ThreadSafeLookup(request,
                        (score, position) =>
                        {
                            resultLeague.Add(new LookupResult(score, position, FreqDbMetaData.GridId));
                        }, token, onProgress, resultLeague);
                });
            }
            else
            {
                task = Task.Run(() =>
                {
                    ThreadSafeLookup(request,
                        (score, position) =>
                        {
                            resultLeague.Add(new LookupResult(score, position, FreqDbMetaData.GridId));
                        }, token, null, resultLeague);
                });
            }

            tasks.Add(task);
            threadCount++;
        }

        Task.WaitAll(tasks.ToArray());
        Console.WriteLine("Complete");
        Console.WriteLine();
        return resultLeague.Results;
    }

    private void LoopCompareArray(int compareArraySize, List<ushort> scores, List<short> compareArray, short newValue,
        int maxSingleDiff, int maxTotal)
    {
        for (var j = 0; j < compareArraySize; j++)
        {
            if (scores[j] == ushort.MaxValue) continue;
            var compareValue = compareArray[compareArraySize - 1 - j];
            if (compareValue == short.MaxValue) continue;
            var newDiff = (ushort)Math.Abs(compareValue - newValue);
            if (newDiff > maxSingleDiff)
            {
                scores[j] = ushort.MaxValue;
            }
            else
            {
                scores[j] += newDiff;
                if (scores[j] > maxTotal)
                {
                    scores[j] = ushort.MaxValue;
                }
            }
        }
    }

    public void ThreadSafeLookup(ThreadLookupRequest request, Action<int, double> onNewResult, CancellationToken token,
        Action<double> onProgress = null, ResultLeague resultLeague = null)
    {
        var i = request.StartTime;
        var total = request.EndTime - request.StartTime;
        var progressChunk = total / 100;
        var nextProgress = i + progressChunk;
        var resultPosition = request.StartTime - 1;
        var scores = new List<ushort>();
        var compareArray = new List<short>();
        var largeArraySize = request.LargeArray.Length;
        var freqsSize = request.Freqs.Count;
        var lastIndexToRead = Math.Min(largeArraySize, (request.EndTime + freqsSize));
        var maxSingleDiff = request.MaxSingleDiff;
        var maxTotal = int.MaxValue;
        while (!token.IsCancellationRequested)
        {
            scores.Add(0);
            if (request.Freqs.Count > 0)
            {
                var firstElement = request.Freqs[0];
                compareArray.Add(firstElement);
                request.Freqs.RemoveAt(0);
            }

            if (i >= lastIndexToRead)
            {
                break;
            }

            var compareArraySize = compareArray.Count;
            var newValue = request.LargeArray[(int)i];
            i++;
            if (i >= nextProgress)
            {
                if (onProgress != null)
                {
                    onProgress((i - request.StartTime) / total);
                }

                nextProgress += progressChunk;
            }
            LoopCompareArray(compareArraySize, scores, compareArray, newValue, maxSingleDiff, maxTotal);

            if (scores.Count < freqsSize) continue;
            resultPosition++;
            ushort front = scores[0];
            if (front != ushort.MaxValue)
            {
                onNewResult(front, resultPosition);
                if (resultLeague != null)
                {
                    maxTotal = resultLeague.MaxValue;
                }
            }
            scores.RemoveAt(0);
        }
    }
}