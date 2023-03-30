namespace ENFLookup;

public class FrequencyUtils
{
    public static List<(int position, int length)> GetContiguousSequenceLengths(List<short> sequence)
    {
        var sequenceLengths = new List<(int position, int length)>();

        for (var i = 0; i < sequence.Count; i++)
        {
            for (var j = i; j < sequence.Count; j++)
            {
                if (sequence[j] == short.MaxValue)
                {
                    sequenceLengths.Add((position: i, length: j - i));
                    break;
                }

                if (j == sequence.Count - 1)
                {
                    sequenceLengths.Add((position: i, length: j - i + 1));
                }
            }
        }

        return sequenceLengths;
    }
    
    public static double GetStandardDeviation(int[] values)
    {
        if (values == null || values.Length == 0)
        {
            throw new ArgumentException("Array cannot be null or empty.", nameof(values));
        }

        double avg = values.Average();
        double sumOfSquares = values.Sum(x => Math.Pow(x - avg, 2));
        double variance = sumOfSquares / (values.Length - 1);
        return Math.Sqrt(variance);
    }
    
    public static (int position, int[] sequence) GetMaxStdDevSequence(Dictionary<int, int[]> subsequences)
    {
        var stdDevs = subsequences.Keys
            .Select(p => new
            {
                position = p,
                stdDev = GetStandardDeviation(subsequences[p])
            })
            .OrderByDescending(x => x.stdDev)
            .ToList();
        var position = stdDevs[0].position;
        return (position, subsequences[position]);
    }
    
    public static Dictionary<int, int[]> FindLongestNonNullSubsequences(IEnumerable<short> shorts, int max)
    {
        var sequence = shorts.ToList();
        var result = new Dictionary<int, int[]>();
        var sequenceLengths = GetContiguousSequenceLengths(sequence);
        sequenceLengths = sequenceLengths.OrderByDescending(x => x.length).ToList();
        if (!sequenceLengths.Any())
        {
            return new Dictionary<int, int[]>();
        }
        var maxLength = Math.Min(sequenceLengths[0].length, max);
        sequenceLengths = sequenceLengths.Where(x => x.length >= maxLength).ToList();
        foreach (var l in sequenceLengths)
        {
            result[l.position] = sequence.GetRange(l.position, maxLength).Select(x => (int)x).ToArray();
        }
        return result;
    }
    
    public static (long position, short[] sequence) GetStrongestSubsequence(IEnumerable<short> sequence, int max)
    {
        var longestSubsequences = FindLongestNonNullSubsequences(sequence, max);
        var minStdDevSequence = GetMaxStdDevSequence(longestSubsequences);
        return new ValueTuple<long, short[]>(minStdDevSequence.position,
            minStdDevSequence.sequence.Select(x => (short)x).ToArray());
    }
}