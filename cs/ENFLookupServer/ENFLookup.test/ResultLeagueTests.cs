using FluentAssertions;

namespace ENFLookup.test;

public class ResultLeagueTests
{
    [Fact]
    public void AddsSingleResultToUnderlyingArray()
    {
        var resultLeague = new ResultLeague(2);
        var lookupResult = new LookupResult(1, 0);
        resultLeague.Add(lookupResult);
        var expectedResults = new[] { new LookupResult(1,0)};
        resultLeague.Results.Should().BeEquivalentTo(expectedResults);
    }

    [Fact]
    public void AddsSecondResultAfterTheFirstIfItIsLarger()
    {
        var resultLeague = new ResultLeague(2);
        resultLeague.Add(new LookupResult(1,0));
        resultLeague.Add(new LookupResult(2, 1));
        var expectedResults = new[] { new LookupResult(1,0 ), new LookupResult (2, 1 ) };
        resultLeague.Results.Should().BeEquivalentTo(expectedResults);
    }
    
    [Fact]
    public void AddsSecondResultBeforeTheFirstIfItIsEqual()
    {
        var resultLeague = new ResultLeague(2);
        resultLeague.Add(new LookupResult(1,0));
        resultLeague.Add(new LookupResult(1, 1));
        var expectedResults = new[] { new LookupResult(1,1), new LookupResult (1, 0 ) };
        resultLeague.Results.Should().BeEquivalentTo(expectedResults);
    }
    
    [Fact]
    public void AddsSecondResultBeforeTheFirstIfItIsLess()
    {
        var resultLeague = new ResultLeague(2);
        resultLeague.Add(new LookupResult(1,0));
        resultLeague.Add(new LookupResult(0, 1));
        var expectedResults = new[] { new LookupResult(0,1), new LookupResult (1, 0 ) };
        resultLeague.Results.Should().BeEquivalentTo(expectedResults);
    }
    
    [Fact]
    public void DoesNotAddThirdResultIfGreater()
    {
        var resultLeague = new ResultLeague(2);
        resultLeague.Add(new LookupResult(1,0));
        resultLeague.Add(new LookupResult(2, 1));
        resultLeague.Add(new LookupResult(3, 2));
        var expectedResults = new[] { new LookupResult(1,0), new LookupResult (2, 1 ) };
        resultLeague.Results.Should().BeEquivalentTo(expectedResults);
    }
    
    [Fact]
    public void DoesNotAddThirdResultIfEqual()
    {
        var resultLeague = new ResultLeague(2);
        resultLeague.Add(new LookupResult(1,0));
        resultLeague.Add(new LookupResult(2, 1));
        resultLeague.Add(new LookupResult(2, 2));
        var expectedResults = new[] { new LookupResult(1,0), new LookupResult (2, 1 ) };
        resultLeague.Results.Should().BeEquivalentTo(expectedResults);
    }
    
    [Fact]
    public void ReplacesSecondResultIfNewResultLessThanSecond()
    {
        var resultLeague = new ResultLeague(2);
        resultLeague.Add(new LookupResult(1,0));
        resultLeague.Add(new LookupResult(3, 1));
        resultLeague.Add(new LookupResult(2, 2));
        var expectedResults = new[] { new LookupResult(1,0), new LookupResult (2, 2 ) };
        resultLeague.Results.Should().BeEquivalentTo(expectedResults);
    }
    
    [Fact]
    public void AddSecondResultAtTopIfLessThanFirst()
    {
        var resultLeague = new ResultLeague(2);
        resultLeague.Add(new LookupResult(2,0));
        resultLeague.Add(new LookupResult(3, 1));
        resultLeague.Add(new LookupResult(1, 2));
        var expectedResults = new[] { new LookupResult(1,2), new LookupResult (2, 0 ) };
        resultLeague.Results.Should().BeEquivalentTo(expectedResults);
    }
    
    [Fact]
    public void CanAddResultInMiddle()
    {
        var resultLeague = new ResultLeague(3);
        resultLeague.Add(new LookupResult(1,0));
        resultLeague.Add(new LookupResult(3, 1));
        resultLeague.Add(new LookupResult(4, 2));
        resultLeague.Add(new LookupResult(2, 3));
        var expectedResults = new[] { new LookupResult(1,0), new LookupResult (2, 3 ), new LookupResult(3,1) };
        resultLeague.Results.Should().BeEquivalentTo(expectedResults);
    }
}