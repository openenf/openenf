using Newtonsoft.Json;

namespace ENFLookup;

/// <summary>
/// A FreqDBReader that reads an entire .freqdb file from the filesystem into memory. It's very memory intensive and very fast!
/// </summary>
public class FsFreqDbReader : IFreqDbReader
{
    /// <summary>
    /// The entire contents of .freqdb file (less the header) converted shorts and stored in memory,
    /// </summary>
    private readonly short[] _gridArray;

    /// <summary>
    /// If the file doesn't have a valid header (perhaps it's not a real .freqdb file) then we stop reading after 1024 bytes
    /// </summary>
    private const int MaxHeaderLength = 1024;

    /// <summary>
    /// Constructs a freqdb reader and immediately (synchronously) reads the header from the file. If the header is valid the entire
    /// file is read into memory
    /// </summary>
    /// <param name="filepath">
    /// A path pointing towards a file in .freqdb format. A .freqdb format file is just a JSON object, then 5 `0x0d` characters acting as a separator
    /// then a stream of bytes which is read into a byte array. The byte array is then converted into a signed short array
    /// where each short represents the deviation from the base frequency of the electrical grid for a specific second in time.
    /// </param>
    /// <exception cref="FormatException">
    /// Thrown if the header cannot be parsed to JSON or if the separator can't be found after <see cref="MaxHeaderLength"/> bytes
    /// </exception>
    public FsFreqDbReader(string filepath)
    {
        var filepath1 = filepath;
        var filestream = new FileStream(filepath1, FileMode.Open);
        var header = "";
        var separatorCount = 0;
        while (true)
        {
            var buffer = new byte[1];
            
            var numRead = filestream.Read(buffer);
            if (numRead == 0)
            {
                break;
            }
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
                throw new FormatException($"File at {filepath1} does not seem to be in the correct format.");
            }
        }

        if (separatorCount < 5)
        {
            throw new FormatException($"File at {filepath1} does not seem to be in the correct format.");
        }

        FreqDbMetaData = JsonConvert.DeserializeObject<FreqDbMetaData>(header);
        var remainingBytes = filestream.Length - filestream.Position;
        FreqDbMetaData.EndDate = FreqDbMetaData.StartDate + (int)(remainingBytes / 2);
        var byteArray = new byte[remainingBytes];
        // ReSharper disable once MustUseReturnValue as we're reading the whole of the remaining file
        filestream.Read(byteArray);
        _gridArray = byteArray.ToShortArray();
    }

    /// <summary>
    /// The metadata relating to the .freqdb
    /// </summary>
    public FreqDbMetaData FreqDbMetaData { get; set; }

    internal short[] ReadDbToArray()
    {
        return _gridArray;
    }

    /// <summary>
    /// Implements a <see cref="IFreqDbReader.ComprehensiveLookup"/> lookup synchronously.
    /// </summary>
    /// <param name="freqs"></param>
    /// <param name="aroundTs"></param>
    /// <param name="diffBefore"></param>
    /// <param name="diffAfter"></param>
    /// <returns></returns>
    public Task<IEnumerable<LookupResult>> ComprehensiveLookup(short[] freqs, long aroundTs, int diffBefore, int diffAfter)
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
            GridArray = _gridArray
        };
        this.ThreadSafeLookup(request, (score, position) =>
        {
            LookupResult lookupResult = new LookupResult
            {
                Position = position,
                Score = score,
                GridId = this.FreqDbMetaData.GridId
            };
            results.Add(lookupResult);
        }, CancellationToken.None);
        return Task.FromResult(results.AsEnumerable());
    }

    public Task<IEnumerable<LookupResult>> TargetedLookup(short[] freqs, IEnumerable<double> positions)
    {
        var lookupResults = new List<LookupResult>();
        foreach (var target in positions)
        {
            var score = 0;
            for (var i = 0; i < freqs.Length; i++)
            {
                var freq = freqs[i];
                if (freq != short.MaxValue)
                {
                    var gridFreq = _gridArray[(int)(target + i)];
                    if (gridFreq != short.MaxValue)
                    {
                        score += Math.Abs(gridFreq - freq);
                    }
                }
            }
            lookupResults.Add(new LookupResult(score, target)
            {
                GridId = this.FreqDbMetaData.GridId
            });
        }

        return Task.FromResult(lookupResults.AsEnumerable());
    }

    public FreqDbMetaData GetFreqDbMetaData()
    {
        return this.FreqDbMetaData;
    }

    public async Task Lookup(short[] freqs, int maxSingleDiff, long startTime, long endTime,
        int numThreads, ResultLeague resultLeague, CancellationToken token, Action<double>? onProgress = null)
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
                GridArray = _gridArray,
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
                }, token);
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
                }, token);
            }

            tasks.Add(task);
            threadCount++;
        }

        await Task.WhenAll(tasks.ToArray());
        Console.WriteLine("Complete");
        Console.WriteLine();
    }

    private void LoopCompareArray(int compareArraySize, List<ushort> scores, List<short> compareArray, short gridValue,
        int maxSingleDiff, int maxTotal)
    {
        for (var j = 0; j < compareArraySize; j++)
        {
            if (scores[j] == ushort.MaxValue) continue;
            var compareValue = compareArray[compareArraySize - 1 - j];
            if (compareValue == short.MaxValue) continue;
            var newDiff = (ushort)Math.Abs(compareValue - gridValue);
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

    internal void ThreadSafeLookup(ThreadLookupRequest request, Action<int, double> onNewResult, CancellationToken token,
        Action<double>? onProgress = null, ResultLeague? resultLeague = null)
    {
        var i = request.StartTime;
        var total = request.EndTime - request.StartTime;
        var progressChunk = total / 100;
        var nextProgress = i + progressChunk;
        var resultPosition = request.StartTime - 1;
        var scores = new List<ushort>();
        var compareArray = new List<short>();
        var gridArraySize = request.GridArray.Length;
        var freqsSize = request.Freqs.Count;
        var lastIndexToRead = Math.Min(gridArraySize, (request.EndTime + freqsSize));
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
            var gridValue = request.GridArray[(int)i];
            i++;
            if (i >= nextProgress)
            {
                if (onProgress != null)
                {
                    onProgress((i - request.StartTime) / total);
                }

                nextProgress += progressChunk;
            }
            LoopCompareArray(compareArraySize, scores, compareArray, gridValue, maxSingleDiff, maxTotal);

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