namespace ENFLookup;

public static class ExtensionMethods
{
    /// <summary>
    /// Converts a byte array as contained in a .freqdb file into an array of shorts of half the length
    /// </summary>
    /// <param name="bytes">An array of bytes read from a .freqdb file</param>
    /// <returns>
    /// An array of shorts representing the difference from the base frequency per second
    /// <example>[0,0.01,-0.09,-0.1]</example>
    /// </returns>
    internal static short[] ToShortArray(this byte[] bytes)
    {
        var shortArray = new short[bytes.Length / 2];
        for (var i = 0; i < shortArray.Length; i++)
        {
            shortArray[i] = BitConverter.ToInt16(new[] { bytes[i * 2], bytes[(i * 2) + 1] });
        }

        return shortArray;
    }
    
    /// <summary>
    /// Converts an array of nullable decimals such as that produced at the ENF Analyze/Reduce stages into an array of shorts which are
    /// offsets from the base frequency.
    /// </summary>
    /// <param name="decimals">
    /// <code>[50.001, 49.989, null, 50.002]</code>
    /// </param>
    /// <returns>
    /// <code>[1,-11,32767,2]</code>
    /// </returns>
    /// <exception cref="ArgumentOutOfRangeException">Thrown if a decimal is supplied which results in a short outside of the range -32768 to 32768</exception>
    /// <remarks>
    /// <list type="number">
    /// <item>
    /// <description>
    ///  The function calculates the likely base frequency to save you having to pass it as an argument.
    /// </description>
    /// </item>
    /// <item>
    /// <description>
    ///  This code was ported from WASM-bound C++ which required the use of non-nullable values hence representing a null
    /// frequency here by short.MaxValue. In future versions we're likely to change to a short?[] array.
    /// </description>
    /// </item>
    /// </list>
    /// </remarks>
    internal static short[] ToShortArray(this decimal?[] decimals)
    {
        var baseFreq = GetBaseFrequency(decimals);
        var normalisedFreqs = decimals.Select(x => (x - baseFreq) * 1000);
        var outOfRangeValues = normalisedFreqs.Where(x => x < short.MinValue || x > short.MaxValue).ToArray();
        if (outOfRangeValues.Any())
        {
            var reconvertedValues = outOfRangeValues.Select(x => (x / 1000) + baseFreq);
            throw new ArgumentOutOfRangeException(nameof(decimals), $"The following values were out of range: '{string.Join(",",reconvertedValues)}'");
        }
        return decimals.Select(x => x.HasValue ? (short)((x.Value - baseFreq)*1000) : short.MaxValue).ToArray();
    }

    internal static int GetBaseFrequency(this decimal?[] decimals)
    {
        var baseFreqs = new []{50,60};
        var totalDiffAgainstFreqs =
            baseFreqs.Select(x => decimals.Where(y => y.HasValue).Sum(y => Math.Abs(x - y!.Value))).ToArray();
        var s50 = totalDiffAgainstFreqs[0];
        var s60 = totalDiffAgainstFreqs[1];
        var baseFreq = s50 < s60 ? 50 : 60;
        return baseFreq;
    }
    
    internal static long ToUnixTimeSeconds(this DateTime dateTime)
    {
        return ((DateTimeOffset)dateTime).ToUnixTimeSeconds();
    }

    internal static long? ToUnixTimeSeconds(this DateTime? dateTime)
    {
        var unixTimeSeconds = dateTime.HasValue
            ? ((DateTimeOffset)dateTime.Value).ToUnixTimeSeconds()
            : default(long?);
        return unixTimeSeconds;
    }
}