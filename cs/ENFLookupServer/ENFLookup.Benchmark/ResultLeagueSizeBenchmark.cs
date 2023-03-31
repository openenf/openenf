using BenchmarkDotNet.Attributes;
using Newtonsoft.Json;

namespace ENFLookup.Benchmark;

/// <summary>
/// The purpose of this benchmark is to compare the speed of lookups over different time periods using larger and smaller <see cref="ResultLeague"/> s.
/// At the time of writing the only lookup implementation uses a resultLeague size of 1, meaning that only the closest match is returned from a
/// lookup. This is extremely efficient if only the best result is required but for noisy or potentially doctored audio sources returning
/// a range of results from a single lookup might be preferable. More work needs to be done to ascertain the optimum ResultLeague size but I've left
/// this here for the time being for reference.
/// </summary>
public class ResultLeagueSizeBenchmark
{
    private readonly FsFreqDbReader _reader;
    private readonly short[] _lookupFreqs;  

    public ResultLeagueSizeBenchmark()
    {
        _lookupFreqs =
            JsonConvert.DeserializeObject<short[]>(File.ReadAllText("TestResources/DEFreqs404956000.json"));
        var testPath = Path.Combine(LookupHelpers.GetDataFolder(), "DE.freqdb");
        _reader = new FsFreqDbReader(testPath);
    }

    /// <summary>
    /// 1000 results over a relatively short search range
    /// </summary>
    /// <returns></returns>
    [Benchmark]
    public async Task<IList<LookupResult>> OriginalResultLeague()
    {
        var resultLeague = new ResultLeague(1000);
        await _reader.Lookup(_lookupFreqs, 10000, 404956000 - 1000000, 404956000 + 100000, 1, resultLeague, CancellationToken.None);
        Console.WriteLine(JsonConvert.SerializeObject(resultLeague.Results));
        return resultLeague.Results;
    }

    /// <summary>
    /// 10 results over a short search range.
    /// </summary>
    /// <returns></returns>
    [Benchmark]
    public async Task<IList<LookupResult>> OriginalResultLeague10Results()
    {
        var resultLeague = new ResultLeague(10);
        await _reader.Lookup(_lookupFreqs, 10000, 404956000 - 1000000, 404956000 + 100000, 1, resultLeague,
            CancellationToken.None);
        Console.WriteLine(JsonConvert.SerializeObject(resultLeague.Results));
        return resultLeague.Results;
    }

    /// <summary>
    /// 10 results over a larger search range
    /// </summary>
    /// <returns></returns>
    [Benchmark]
    public async Task<IList<LookupResult>> OriginalResultLeagueLargerSearchPeriod()
    {
        var resultLeague = new ResultLeague(10);
        await _reader.Lookup(_lookupFreqs, 10000, 304956800, 404956800, 1, resultLeague, CancellationToken.None);
        Console.WriteLine(JsonConvert.SerializeObject(resultLeague.Results));
        return resultLeague.Results;
    }

    /// <summary>
    /// 1000 results over a larger search range.
    /// </summary>
    /// <returns></returns>
    [Benchmark]
    public async Task<IList<LookupResult>> ResultLeagueLargerSearchPeriod1000Results()
    {
        var resultLeague = new ResultLeague(1000);
        await _reader.Lookup(_lookupFreqs, 10000, 304956800, 404956800, 1, resultLeague, CancellationToken.None);
        Console.WriteLine(JsonConvert.SerializeObject(resultLeague.Results));
        return resultLeague.Results;
    }
}
