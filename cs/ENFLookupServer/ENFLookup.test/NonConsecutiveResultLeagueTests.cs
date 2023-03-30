using FluentAssertions;

namespace ENFLookup.test;

public class NonConsecutiveResultLeagueTests
{

    [Fact]
    public void AddsSingleResultToUnderlyingArray()
    {
        var resultLeague = new NonConsecutiveResultLeague(2);
        var lookupResult = new LookupResult(1, 0);
        resultLeague.Add(lookupResult);
        var expectedResults = new[] { new LookupResult(1,0)};
        resultLeague.Results.Should().BeEquivalentTo(expectedResults);
    }

    [Fact]
    public void RejectsSecondResultIfAdjacentAndScoreIsHigher()
    {
        var resultLeague = new NonConsecutiveResultLeague(2);
        resultLeague.Add(new LookupResult(1,0));
        resultLeague.Add(new LookupResult(2,1));
        var expectedResults = new[] { new LookupResult(1,0 ) };
        resultLeague.Results.Should().BeEquivalentTo(expectedResults);
    }
    
    [Fact]
    public void ReplacesSecondResultIfAdjacentAndScoreIsLower()
    {
        var resultLeague = new NonConsecutiveResultLeague(2);
        resultLeague.Add(new LookupResult(1,0));
        resultLeague.Add(new LookupResult(0, 1));
        var expectedResults = new[] { new LookupResult(0, 1 ) };
        resultLeague.Results.Should().BeEquivalentTo(expectedResults);
    }

    [Fact]
    public void ReplacesBothResultsIfIsTheLowestOfThreeContiguousResults()
    {
        var resultLeague = new NonConsecutiveResultLeague(3);
        resultLeague.Add(new LookupResult(2,0)); //First entry not rejected.
        resultLeague.Add(new LookupResult(1, 2)); //Second entry not rejected because not (yet) consecutive.
        resultLeague.Add(new LookupResult(0, 1)); //Third entry evicts the other two as it is adjacent to and higher than both.
        var expectedResults = new[] { new LookupResult(0, 1 ) };
        resultLeague.Results.Should().BeEquivalentTo(expectedResults);
    }
    
    [Fact]
    public void EvictsAdjacentLowerAdjacentResultAndIsAlsoRejectedByHigherAdjacentResult()
    {
        var resultLeague = new NonConsecutiveResultLeague(3);
        resultLeague.Add(new LookupResult(0,0)); //First entry not rejected.
        resultLeague.Add(new LookupResult(2, 2)); //Second entry not rejected because not (yet) consecutive.
        resultLeague.Add(new LookupResult(1, 1)); //Third entry evicts the second but is itself evicted by the first
        var expectedResults = new[] { new LookupResult(0, 0 ) };
        resultLeague.Results.Should().BeEquivalentTo(expectedResults);
    }
    
    [Fact]
    public void IsEvictedIfInsertedInBetweenOneEqualAndOneLower()
    {
        var resultLeague = new NonConsecutiveResultLeague(3);
        resultLeague.Add(new LookupResult(0,0)); //First entry not rejected.
        resultLeague.Add(new LookupResult(1, 2)); //Second entry not rejected because not (yet) consecutive.
        resultLeague.Add(new LookupResult(1, 1)); //Third entry is evicted
        var expectedResults = new[] { new LookupResult(0, 0 ), new LookupResult(1, 2 ) };
        resultLeague.Results.Should().BeEquivalentTo(expectedResults);
    }
    
    [Fact]
    public void AddsSecondResultBeforeTheFirstIfItIsEqual()
    {
        var resultLeague = new NonConsecutiveResultLeague(2);
        resultLeague.Add(new LookupResult(1,0));
        resultLeague.Add(new LookupResult(1, 2));
        var expectedResults = new[] { new LookupResult(1,2), new LookupResult (1, 0 ) };
        resultLeague.Results.Should().BeEquivalentTo(expectedResults);
    }
    
    [Fact]
    public void AddsSecondResultBeforeTheFirstIfItIsLess()
    {
        var resultLeague = new NonConsecutiveResultLeague(2);
        resultLeague.Add(new LookupResult(1,0));
        resultLeague.Add(new LookupResult(0, 2));
        var expectedResults = new[] { new LookupResult(0,2), new LookupResult (1, 0 ) };
        resultLeague.Results.Should().BeEquivalentTo(expectedResults);
    }
    
    [Fact]
    public void DoesNotAddThirdResultIfGreater()
    {
        var resultLeague = new NonConsecutiveResultLeague(2);
        resultLeague.Add(new LookupResult(1,0));
        resultLeague.Add(new LookupResult(2, 2));
        resultLeague.Add(new LookupResult(3, 4));
        var expectedResults = new[] { new LookupResult(1,0), new LookupResult (2, 2 ) };
        resultLeague.Results.Should().BeEquivalentTo(expectedResults);
    }
    
    [Fact]
    public void DoesNotAddThirdResultIfEqual()
    {
        var resultLeague = new NonConsecutiveResultLeague(2);
        resultLeague.Add(new LookupResult(1,0));
        resultLeague.Add(new LookupResult(2, 2));
        resultLeague.Add(new LookupResult(2, 4));
        var expectedResults = new[] { new LookupResult(1,0), new LookupResult (2, 2 ) };
        resultLeague.Results.Should().BeEquivalentTo(expectedResults);
    }
    
    [Fact]
    public void ReplacesSecondResultIfNewResultLessThanSecond()
    {
        var resultLeague = new NonConsecutiveResultLeague(2);
        resultLeague.Add(new LookupResult(1,0));
        resultLeague.Add(new LookupResult(3, 2));
        resultLeague.Add(new LookupResult(2, 4));
        var expectedResults = new[] { new LookupResult(1,0), new LookupResult (2, 4 ) };
        resultLeague.Results.Should().BeEquivalentTo(expectedResults);
    }
    
    [Fact]
    public void AddSecondResultAtTopIfLessThanFirst()
    {
        var resultLeague = new NonConsecutiveResultLeague(2);
        resultLeague.Add(new LookupResult(2,0));
        resultLeague.Add(new LookupResult(3, 2));
        resultLeague.Add(new LookupResult(1, 4));
        var expectedResults = new[] { new LookupResult(1,4), new LookupResult (2, 0 ) };
        resultLeague.Results.Should().BeEquivalentTo(expectedResults);
    }
    
    [Fact]
    public void CanAddResultInMiddle()
    {
        var resultLeague = new NonConsecutiveResultLeague(3);
        resultLeague.Add(new LookupResult(1,0));
        resultLeague.Add(new LookupResult(3, 2));
        resultLeague.Add(new LookupResult(4, 4));
        resultLeague.Add(new LookupResult(2, 6));
        var expectedResults = new[] { new LookupResult(1,0), new LookupResult (2, 6 ), new LookupResult(3,2) };
        resultLeague.Results.Should().BeEquivalentTo(expectedResults);
    }
}