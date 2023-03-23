namespace ENFLookup;

public static class ExtensionMethods
{
    public static short[] ToShortArray(this byte[] bytes)
    {
        var shortArray = new short[bytes.Length / 2];
        for (var i = 0; i < shortArray.Length; i++)
        {
            shortArray[i] = BitConverter.ToInt16(new[] { bytes[i * 2], bytes[(i * 2) + 1] });
        }

        return shortArray;
    }
    
    public static short[] ToShortArray(this decimal?[] decimals)
    {
        var baseFreq = GetBaseFrequency(decimals);
        return decimals.Select(x => x.HasValue ? (short)((x.Value - baseFreq)*100) : short.MaxValue).ToArray();
    }

    public static int GetBaseFrequency(this decimal?[] decimals)
    {
        var baseFreqs = new []{50,60};
        var totalDiffAgainstFreqs =
            baseFreqs.Select(x => decimals.Where(y => y.HasValue).Sum(y => Math.Abs(x - y.Value))).ToArray();
        var s50 = totalDiffAgainstFreqs[0];
        var s60 = totalDiffAgainstFreqs[1];
        var baseFreq = s50 < s60 ? 50 : 60;
        return baseFreq;
    }
    
    public static long? ToUnixTimeSeconds(this DateTime dateTime)
    {
        return ((DateTimeOffset)dateTime).ToUnixTimeSeconds();
    }

    public static long? ToUnixTimeSeconds(this DateTime? dateTime)
    {
        var unixTimeSeconds = dateTime.HasValue
            ? ((DateTimeOffset)dateTime.Value).ToUnixTimeSeconds()
            : default(long?);
        return unixTimeSeconds;
    }
}