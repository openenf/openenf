using FluentAssertions;
using Xunit.Abstractions;

namespace ENFLookup.test;

public class LookupRequestHandlerTests
{
    private readonly ITestOutputHelper _testOutputHelper;

    public LookupRequestHandlerTests(ITestOutputHelper testOutputHelper)
    {
        _testOutputHelper = testOutputHelper;
    }

    [Fact]
    public void LookupPassesLookupRequestToCorrectGridReader()
    {
        var lookupRequestHandler = new LookupRequestHandler();
        var mockFreqDbReader = new MockFreqDbReader();
        lookupRequestHandler.AddFreqDbReader(mockFreqDbReader);
        var lookupRequest = new LookupRequest
        {
            Freqs = new decimal?[] { 50, 50.1m, 50.2m, 50.3m, 50.4m },
            StartTime = new DateTime(1970,1,1,0,0,0,DateTimeKind.Utc),
            EndTime = new DateTime(1970, 1, 2,0,0,0,DateTimeKind.Utc),
            GridIds = new[] { "XX" }
        };
        lookupRequestHandler.Lookup(lookupRequest);
        mockFreqDbReader.Freqs.Should().BeEquivalentTo(new[] { 0, 10, 20, 30, 40 });
        mockFreqDbReader.StartTime.Should().Be(0);
        mockFreqDbReader.EndTime.Should().Be((int)TimeSpan.FromDays(1).TotalSeconds);
    }

    [Fact]
    public void PassesCorrectValuesForComprehensiveLookup()
    {
        var lookupRequestHandler = new LookupRequestHandler();
        var mockFreqDbReader = new MockFreqDbReader();
        lookupRequestHandler.AddFreqDbReader(mockFreqDbReader);
        var comprehensiveLookupRequest = new ComprehensiveLookupRequest
        {
            Around = 1388534442,
            Freqs = new decimal?[] { 50, 50.1m, 50.2m, 50.3m, 50.4m },
            GridId = "XX",
            Range = 12
        };
        lookupRequestHandler.ComprehensiveLookup(comprehensiveLookupRequest);
        mockFreqDbReader.Freqs.Should().BeEquivalentTo(new[] { 0, 10, 20, 30, 40 });
        mockFreqDbReader.AroundTs.Should().Be(1388534442);
        mockFreqDbReader.DiffAfter.Should().Be(12);
        mockFreqDbReader.DiffBefore.Should().Be(12);
    }

    [Fact]
    public void HandlesProgressUpdatesForMultipleGridsCorrectly()
    {
        var lookupRequestHandler = new LookupRequestHandler();
        var mockFreqDbReader1 = new MockFreqDbReader
        {
            FreqDbMetaData = new FreqDbMetaData
            {
                GridId = "XX",
                BaseFrequency = 50,
                EndDate = 86400
            }
        };
        mockFreqDbReader1.SimulateProgress = () =>
        {
            mockFreqDbReader1.OnProgress(0.5);
            mockFreqDbReader1.OnProgress(1);
        };
        var mockFreqDbReader2 = new MockFreqDbReader
        {
            FreqDbMetaData = new FreqDbMetaData
            {
                GridId = "YY",
                BaseFrequency = 50,
                EndDate = 86400
            }
        };
        mockFreqDbReader2.SimulateProgress = () =>
        {
            mockFreqDbReader2.OnProgress(0.3);
            mockFreqDbReader2.OnProgress(0.6);
            mockFreqDbReader2.OnProgress(1);
        };
        lookupRequestHandler.AddFreqDbReader(mockFreqDbReader1);
        lookupRequestHandler.AddFreqDbReader(mockFreqDbReader2);
        var lookupRequest = new LookupRequest
        {
            Freqs = new decimal?[] { 50, 50.1m, 50.2m, 50.3m, 50.4m },
            StartTime = new DateTime(1970,1,1,0,0,0,DateTimeKind.Utc),
            EndTime = new DateTime(1970, 1, 2,0,0,0,DateTimeKind.Utc),
            GridIds = new[] { "XX","YY" },
        };
        var progressFiredCount = 0;
        lookupRequestHandler.Lookup(lookupRequest, d =>
        {
            _testOutputHelper.WriteLine($"{d}");
            progressFiredCount++;
            switch (progressFiredCount)
            {
                case 1:
                    d.Should().Be(0.25);
                    break;
                case 2:
                    d.Should().Be(0.5);
                    break;
                case 3:
                    d.Should().Be(0.65);
                    break;
                case 4:
                    d.Should().Be(0.8);
                    break;
                case 5:
                    d.Should().Be(1);
                    break;
                default:
                    throw new Exception("OnProgress should only be fired 5 times total");
            }
        });
        progressFiredCount.Should().Be(5);
    }
    
    [Fact]
    public void LookupHandlesMultipleFreqDbReaders()
    {
        var lookupRequestHandler = new LookupRequestHandler();
        var mockFreqDbReader1 = new MockFreqDbReader
        {
            FreqDbMetaData = new FreqDbMetaData
            {
                GridId = "XX",
                BaseFrequency = 50,
                EndDate = 86400
            }
        };
        var mockFreqDbReader2 = new MockFreqDbReader
        {
            FreqDbMetaData = new FreqDbMetaData
            {
                GridId = "YY",
                BaseFrequency = 50,
                EndDate = 86400
            }
        };
        lookupRequestHandler.AddFreqDbReader(mockFreqDbReader1);
        lookupRequestHandler.AddFreqDbReader(mockFreqDbReader2);
        var lookupRequest = new LookupRequest
        {
            Freqs = new decimal?[] { 50, 50.1m, 50.2m, 50.3m, 50.4m },
            StartTime = new DateTime(1970,1,1,0,0,0,DateTimeKind.Utc),
            EndTime = new DateTime(1970, 1, 2,0,0,0,DateTimeKind.Utc),
            GridIds = new[] { "XX","YY" }
        };
        lookupRequestHandler.Lookup(lookupRequest);
        mockFreqDbReader1.Freqs.Should().BeEquivalentTo(new[] { 0, 100, 200, 300, 400 });
        mockFreqDbReader1.StartTime.Should().Be(0);
        mockFreqDbReader1.EndTime.Should().Be((int)TimeSpan.FromDays(1).TotalSeconds);
        
        mockFreqDbReader2.Freqs.Should().BeEquivalentTo(new[] { 0, 100, 200, 300, 400 });
        mockFreqDbReader2.StartTime.Should().Be(0);
        mockFreqDbReader2.EndTime.Should().Be((int)TimeSpan.FromDays(1).TotalSeconds);
    }
}