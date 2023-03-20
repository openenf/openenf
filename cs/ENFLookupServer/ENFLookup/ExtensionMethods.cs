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
}