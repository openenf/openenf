using BenchmarkDotNet.Attributes;
using Newtonsoft.Json;

namespace ENFLookup.Benchmark;

public class LookupBenchmark
{
    private readonly FsFreqDbReader _reader;
    private readonly short[] _lookupFreqs;  

    public LookupBenchmark()
    {
        _lookupFreqs =
            JsonConvert.DeserializeObject<short[]>(File.ReadAllText("TestResources/DEFreqs404956000.json"));
        var testPath = Path.Combine(LookupHelpers.GetDataFolder(), "DE.freqdb");
        _reader = new FsFreqDbReader(testPath);
    }

    //[Benchmark]
    public IList<LookupResult> OriginalResultLeague()
    {
        var resultLeague = new ResultLeague(1000);
        _reader.Lookup(_lookupFreqs, 10000, 404956000 - 1000000, 404956000 + 100000, 1, resultLeague, CancellationToken.None).ToArray();
        Console.WriteLine(JsonConvert.SerializeObject(resultLeague.Results));
        return resultLeague.Results;
    }

    //[Benchmark]
    public IList<LookupResult> NonConsecutiveResultLeague()
    {
        var resultLeague = new NonConsecutiveResultLeague(1000);
        _reader.Lookup(_lookupFreqs, 10000, 404956000 - 1000000, 404956000 + 100000, 1, resultLeague, CancellationToken.None).ToArray();
        Console.WriteLine(JsonConvert.SerializeObject(resultLeague.Results));
        return resultLeague.Results;
    }
    
    //[Benchmark]
    public IList<LookupResult> OriginalResultLeague10Results()
    {
        var resultLeague = new ResultLeague(10);
        _reader.Lookup(_lookupFreqs, 10000, 404956000 - 1000000, 404956000 + 100000, 1, resultLeague, CancellationToken.None).ToArray();
        Console.WriteLine(JsonConvert.SerializeObject(resultLeague.Results));
        return resultLeague.Results;
    }

    //[Benchmark]
    public IList<LookupResult> NonConsecutiveResultLeague10Results()
    {
        var resultLeague = new NonConsecutiveResultLeague(10);
        _reader.Lookup(_lookupFreqs, 10000, 404956000 - 100000000, 404956000 + 100000, 1, resultLeague, CancellationToken.None).ToArray();
        Console.WriteLine(JsonConvert.SerializeObject(resultLeague.Results));
        return resultLeague.Results;
    }
    
    //[Benchmark]
    public IList<LookupResult> OriginalResultLeagueLargerSearchPeriod()
    {
        var resultLeague = new ResultLeague(10);
        _reader.Lookup(_lookupFreqs, 10000, 304956800, 404956800, 1, resultLeague, CancellationToken.None).ToArray();
        Console.WriteLine(JsonConvert.SerializeObject(resultLeague.Results));
        return resultLeague.Results;
    }

    //[Benchmark]
    public IList<LookupResult> NonConsecutiveResultLeagueLargerSearchPeriod()
    {
        var resultLeague = new NonConsecutiveResultLeague(10);
        _reader.Lookup(_lookupFreqs, 10000, 304956800, 404956800, 1, resultLeague, CancellationToken.None).ToArray();
        Console.WriteLine(JsonConvert.SerializeObject(resultLeague.Results));
        return resultLeague.Results;
    }
    
    //[Benchmark]
    public IList<LookupResult> OriginalResultLeagueLargerSearchPeriod1000Results()
    {
        var resultLeague = new ResultLeague(1000);
        _reader.Lookup(_lookupFreqs, 10000, 304956800, 404956800, 1, resultLeague, CancellationToken.None).ToArray();
        Console.WriteLine(JsonConvert.SerializeObject(resultLeague.Results));
        return resultLeague.Results;
    }

    [Benchmark]
    public IList<LookupResult> NonConsecutiveResultLeagueLargerSearchPeriod1000Results()
    {
        var resultLeague = new NonConsecutiveResultLeague(1000);
        _reader.Lookup(_lookupFreqs, 10000, 304956800, 404956800, 1, resultLeague, CancellationToken.None).ToArray();
        Console.WriteLine(JsonConvert.SerializeObject(resultLeague.Results));
        return resultLeague.Results;
    }
}
