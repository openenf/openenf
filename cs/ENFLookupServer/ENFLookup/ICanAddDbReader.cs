namespace ENFLookup;

public interface ICanAddDbReader: ILookupRequestHandler
{
    public void AddFreqDbReader(IFreqDbReader freqDbReader);
}