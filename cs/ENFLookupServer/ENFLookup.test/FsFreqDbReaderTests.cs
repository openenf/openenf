using FluentAssertions;
using Newtonsoft.Json;
using Xunit.Abstractions;

namespace ENFLookup.test;

/// <summary>
/// The freqdb file 'GB_50_Jan2014.freqdb' used here is real-world data containing grid frequencies for the British (GB) grid for the month
/// of January 2014. Long-running tests are not intended to be run in the CI pipeline.
/// </summary>
public class FsFreqDbReaderTests
{
    private readonly ITestOutputHelper _testOutputHelper;

    public FsFreqDbReaderTests(ITestOutputHelper testOutputHelper)
    {
        _testOutputHelper = testOutputHelper;
    }

    [Fact]
    public void CanReadFileWithMillionsOfEntries()
    {
        short[] first100 = 
        {
            31, 26, 19, 8, 0, -2, -8, -13, -21, -23, -23, -21, -25, -25, -22, -19, -18, -16, -11, -8, -5, -6, -5, -3,
            -2, -1, -1, 2, 3, 2, -3, -6, -4, -8, -7, -5, -5, -8, -10, -10, -11, -11, -11, -11, -6, -1, -2, 0, -1, -4,
            -11, -20, -23, -29, -31, -32, -28, -22, -21, -21, -28, -31, -35, -41, -45, -50, -56, -58, -56, -57, -56,
            -49, -43, -37, -30, -21, -18, -19, -20, -21, -22, -23, -22, -19, -9, -3, 5, 8, 7, 8, 2, -7, -17, -25, -29,
            -34, -37, -36, -33, -32
        };
        // ReSharper disable once InconsistentNaming
        short[] mid100_1339200_1339300 =
        {
            -7, -6, -2, -2, 1, 2, 5, 1, 1, 3, 4, 4, 5, 5, 6, 4, 2, 1, -4, -5, -9, -11, -14, -13, -15, -15, -19, -25,
            -26, -31, -35, -38, -39, -39, -38, -40, -40, -38, -37, -38, -38, -40, -41, -41, -44, -46, -46, -44, -47,
            -46, -48, -49, -48, -48, -48, -46, -45, -47, -47, -49, -49, -50, -50, -52, -53, -51, -53, -51, -49, -46,
            -46, -44, -44, -42, -39, -40, -39, -37, -39, -36, -36, -37, -36, -37, -36, -37, -37, -36, -33, -31, -29,
            -29, -28, -26, -25, -23, -23, -22, -22, -21
        };
        short[] last100 =
        {
            56, 52, 51, 50, 51, 47, 51, 52, 53, 55, 56, 54, 57, 56, 58, 57, 55, 54, 46, 39, 33, 30, 26, 23, 19, 20, 19,
            19, 18, 21, 19, 22, 21, 24, 22, 25, 24, 27, 29, 28, 27, 26, 23, 20, 17, 19, 18, 14, 13, 12, 13, 10, 12, 10,
            9, 8, 9, 7, 11, 10, 7, 9, 7, 8, 7, 12, 17, 18, 24, 22, 23, 18, 19, 17, 15, 12, 10, 9, 11, 13, 12, 16, 18,
            20, 21, 22, 21, 18, 18, 16, 16, 10, 7, 6, 5, 5, 5, 8, 6, 9
        };

        var freqDbReader = new FsFreqDbReader("TestResources/GB_50_Jan2014.freqdb");

        var freqsInDb = freqDbReader.ReadDbToArray();
        var first100InDb = freqsInDb.Take(100);
        var mid100InDb = freqsInDb.Skip(1339200).Take(100);
        var last100InDb = freqsInDb.Skip(2678300).Take(100);

        first100.Should().BeEquivalentTo(first100InDb);
        mid100_1339200_1339300.Should().BeEquivalentTo(mid100InDb);
        last100.Should().BeEquivalentTo(last100InDb);
    }

    [Fact]
    public async Task CanDoSingleThreadLookupOnLargeFile()
    {
        var freqDbReader = new FsFreqDbReader("TestResources/GB_50_Jan2014.freqdb");
        short[] lookupFreqs = JsonConvert.DeserializeObject<short[]>(await File.ReadAllTextAsync("TestResources/GBFreqs1339200.json"));
        var resultLeague = new ResultLeague(100);
        await freqDbReader.Lookup(lookupFreqs, 1000, 0, 2678400, 1, resultLeague, CancellationToken.None);
        var result = resultLeague.Results;
        result[0].Position.Should().Be(1339200);
        result[0].Score.Should().Be(0);
    }
    
    [Fact]
    public async Task ProgressCallbackWorks()
    {
        var freqDbReader = new FsFreqDbReader("TestResources/GB_50_Jan2014.freqdb");
        short[] lookupFreqs = JsonConvert.DeserializeObject<short[]>(await File.ReadAllTextAsync("TestResources/GBFreqs1339200.json"));
        var resultLeague = new ResultLeague(100);
        double previousD = 0;
        await freqDbReader.Lookup(lookupFreqs, 1000, 0, 2678400, 16, resultLeague, CancellationToken.None, d =>
        {
            _testOutputHelper.WriteLine($"{d}");
            d.Should().BeGreaterThan(previousD);
            previousD = d;
        });
        previousD.Should().Be(1);
    }
    
    [Fact]
    public void CorruptedFileThrowsExceptionOnLoad()
    {
        var action = () =>
        {
            // ReSharper disable once ObjectCreationAsStatement
            new FsFreqDbReader("TestResources/Corrupted.freqdb");
        };
        action.Should().Throw<FormatException>();
    }
    
    [Fact]
    [Trait("Category","Long-running")]
    public void GridFileContainingNullsCanBeLoaded()
    {
        var testPath = Path.Combine(LookupHelpers.GetDataFolder(),"DE.freqdb");
        var freqDbReader = new FsFreqDbReader(testPath);
        freqDbReader.FreqDbMetaData.BaseFrequency.Should().Be(50);
        var expectedStartDate = new DateTime(2009, 12, 31, 23, 0, 0, DateTimeKind.Utc);
        freqDbReader.FreqDbMetaData.StartDate.Should().Be(expectedStartDate.ToUnixTimeSeconds());
    }
    
    [Fact]
    [Trait("Category","Long-running")]
    public async Task CanDoLookupOnRealWorldDEFile()
    {
        var lookupFreqs =
            JsonConvert.DeserializeObject<short[]>(await File.ReadAllTextAsync("TestResources/DEFreqs404956000.json"));
        var testPath = Path.Combine(LookupHelpers.GetDataFolder(),"DE.freqdb");
        var freqDbReader = new FsFreqDbReader(testPath);
        var resultLeague = new ResultLeague(100);
        await freqDbReader.Lookup(lookupFreqs, 10, 404956000 - 1000000, 404956000 + 100000, 16, resultLeague,
            CancellationToken.None);
        var result = resultLeague.Results;
        result[0].Position.Should().Be(404956000);
        result[0].Score.Should().Be(0);
    }
    
    [Fact]
    [Trait("Category","Long-running")]
    public async Task CanDoOneHourLookupOnRealWorldGBFile()
    {
        var lookupFreqs =
            JsonConvert.DeserializeObject<decimal?[]>(await File.ReadAllTextAsync("TestResources/GB_2020-11-28T210904_saw_3600_J_secs_05amp_8Harmonics.wav.freqs.json"));
        var testPath = Path.Combine(LookupHelpers.GetDataFolder(),"GB.freqdb");
        var freqDbReader = new FsFreqDbReader(testPath);
        var resultLeague = new ResultLeague(1);
        var endTime = freqDbReader.FreqDbMetaData.EndDate - freqDbReader.FreqDbMetaData.StartDate;
        await freqDbReader.Lookup(lookupFreqs.ToShortArray(), 10, 217063344, 219063344, 16, resultLeague,
            CancellationToken.None, d =>
            {
                _testOutputHelper.WriteLine($"{d}");
            });
        var result = resultLeague.Results;
        _testOutputHelper.WriteLine(JsonConvert.SerializeObject(result));
        result[0].Score.Should().Be(0);
        result[0].Position.Should().Be(218063344);
    }
    
    [Fact]
    [Trait("Category","Long-running")]
    public async Task CanDoWeakMatchLookupOnRealWorldDEFreqs()
    {
        //Note this is GB lookup data on the DE grid so there shouldn't be a strong match.
        var gbLookupData = JsonConvert.DeserializeObject<short[]>(await File.ReadAllTextAsync("TestResources/GBFreqs1339200.json"));
        var testPath = Path.Combine(LookupHelpers.GetDataFolder(),"DE.freqdb");
        var deFreqDbReader = new FsFreqDbReader(testPath);
        var resultLeague = new ResultLeague(100);
        await deFreqDbReader.Lookup(gbLookupData, 1000, 126234000, 189302400, 16, resultLeague, CancellationToken.None);
        var result = resultLeague.Results;
        result[0].Position.Should().Be(159650997);
        result[0].Score.Should().Be(373);
    }

    [Fact]
    public async Task CanDoEightThreadLookupOnLargeFile()
    {
        var freqDbReader = new FsFreqDbReader("TestResources/GB_50_Jan2014.freqdb");
        short[] lookupFreqs = JsonConvert.DeserializeObject<short[]>(await File.ReadAllTextAsync("TestResources/GBFreqs1339200.json"));
        var endTime = freqDbReader.FreqDbMetaData.EndDate - freqDbReader.FreqDbMetaData.StartDate;
        var resultLeague = new ResultLeague(100);
        await freqDbReader.Lookup(lookupFreqs, 1000, 0, endTime, 16, resultLeague, CancellationToken.None);
        var result = resultLeague.Results;
        result[0].Position.Should().Be(1339200);
        result[0].Score.Should().Be(0);
    }

    [Fact]
    public void CanReadMetaDataFromValidFreqDbFile()
    {
        var fsFreqDbReader = new FsFreqDbReader("TestResources/TestFreqDb.freqdb");
        var freqDbMetaData = fsFreqDbReader.FreqDbMetaData;
        freqDbMetaData.BaseFrequency.Should().Be(50);
        freqDbMetaData.GridId.Should().Be("XX");
        freqDbMetaData.StartDate.Should().Be(1262304000);
        freqDbMetaData.EndDate.Should().Be(1262304016);
    }

    [Fact]
    public async Task CanDoComprehensiveLookupAroundSpecifiedRange()
    {
        var freqDbReader = new FsFreqDbReader("TestResources/GB_50_Jan2014.freqdb");
        var lookupFreqs = new List<short> { -7,-6,-2,-2,1,2,5,1,1,3,4,4,5,5,6,4,2,1,-4,-5,-9,-11,-14,-13,-15,-15,-19,-25,-26,-31,-35,-38,-39,-39,-38,-40,-40,-38,-37,-38,-38,-40,-41,-41,-44,-46,-46,-44,-47,-46,-48,-49,-48,-48,-48,-46,-45,-47,-47,-49,-49,-50,-50,-52,-53,-51,-53,-51,-49,-46,-46,-44,-44,-42,-39,-40,-39,-37,-39,-36,-36,-37,-36,-37,-36,-37,-37,-36,-33,-31,-29,-29,-28,-26,-25,-23,-23,-22,-22,-21 }.ToArray();
        var result = (await freqDbReader.ComprehensiveLookup(lookupFreqs, 1339200, 2, 2)).ToArray();
        result.Should().HaveCount(5);
        result[0].Position.Should().Be(1339198);
        result[0].Score.Should().Be(247);
        result[1].Position.Should().Be(1339199);
        result[1].Score.Should().Be(152);
        result[2].Position.Should().Be(1339200);
        result[2].Score.Should().Be(0);
        result[3].Position.Should().Be(1339201);
        result[3].Score.Should().Be(155);
        result[4].Position.Should().Be(1339202);
        result[4].Score.Should().Be(253);
    }
    
    [Fact]
    public async Task CanHandleComprehensiveLookupFromStarOfGrid()
    {
        var freqDbReader = new FsFreqDbReader("TestResources/GB_50_Jan2014.freqdb");
        var lookupFreqs = new List<short> { -7,-6,-2,-2,1,2,5,1,1,3,4,4,5,5,6,4,2,1,-4,-5,-9,-11,-14,-13,-15,-15,-19,-25,-26,-31,-35,-38,-39,-39,-38,-40,-40,-38,-37,-38,-38,-40,-41,-41,-44,-46,-46,-44,-47,-46,-48,-49,-48,-48,-48,-46,-45,-47,-47,-49,-49,-50,-50,-52,-53,-51,-53,-51,-49,-46,-46,-44,-44,-42,-39,-40,-39,-37,-39,-36,-36,-37,-36,-37,-36,-37,-37,-36,-33,-31,-29,-29,-28,-26,-25,-23,-23,-22,-22,-21 }.ToArray();
        var result = (await freqDbReader.ComprehensiveLookup(lookupFreqs, 0, 2, 2)).ToArray();//Note aroundTs of zero.
        result.Length.Should().Be(3);
    }

    [Fact]
    public async Task CanGetFreqsAtSpecifiedPosition()
    {
        var freqDbReader = new FsFreqDbReader("TestResources/GB_50_Jan2014.freqdb");
        var result = await freqDbReader.GetFrequenciesAt(50000, 10);
        result.Should().BeEquivalentTo(new []{60,59,53,52,45,49,48,50,51,51});

        var freqDbLength = freqDbReader.FreqDbMetaData.EndDate - freqDbReader.FreqDbMetaData.StartDate;
        var resultLeague = new ResultLeague(10);
        await freqDbReader.Lookup(result.ToArray(), 10000, 0, freqDbLength, 8, resultLeague, CancellationToken.None);
        resultLeague.Results[0].Score.Should().Be(0);
        resultLeague.Results[0].Position.Should().Be(50000);
    }
    
    [Fact]
    public async Task CanGetStandardDeviationOfGrid()
    {
        var freqDbReader = new FsFreqDbReader("TestResources/GB_50_Jan2014.freqdb");
        var end = freqDbReader.FreqDbMetaData.EndDate - freqDbReader.FreqDbMetaData.StartDate;
        var result1 = await freqDbReader.StdDev();
        var result2 = await freqDbReader.StdDev(new Tuple<long, long>(0, end));
        var result3 = await freqDbReader.StdDev(new Tuple<long, long>(- 100000, end + 100000));
        result1.Should().BeEquivalentTo(result2);
        result2.Should().BeEquivalentTo(result3);
        var result4 = await freqDbReader.StdDev(new Tuple<long, long>(100000, 200000));
        result4.Should().NotBeEquivalentTo(result1);
        result4.Mean.Should().Be(0.28664000000000001);
        result4.StdDev.Should().Be(60.564634709626368);
    }
    
    [Fact]
    public async Task CanGetStandardDeviationOfGrid1stDerivative()
    {
        var freqDbReader = new FsFreqDbReader("TestResources/GB_50_Jan2014.freqdb");
        var end = freqDbReader.FreqDbMetaData.EndDate - freqDbReader.FreqDbMetaData.StartDate;
        var result1 = await freqDbReader.StdDevDeriv();
        var result2 = await freqDbReader.StdDevDeriv(new Tuple<long, long>(0, end));
        var result3 = await freqDbReader.StdDevDeriv(new Tuple<long, long>(- 100000, end + 100000));
        result1.Should().BeEquivalentTo(result2);
        result2.Should().BeEquivalentTo(result3);
        var result4 = await freqDbReader.StdDevDeriv(new Tuple<long, long>(100000, 200000));
        result4.Should().NotBeEquivalentTo(result1);
        result4.Mean.Should().Be(0.00093000930009300088);
        result4.StdDev.Should().Be(2.123914839449117);
    }
}