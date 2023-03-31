using FluentAssertions;

namespace ENFLookup.test;

public class ExtensionMethodsTests
{
    [Fact]
    public void FiftyCenteredFreqArrayIsNormalisedCorrectly()
    {
        var freqs = new decimal?[] { 50, 50.1m, 50.2m, 50.3m, 50.4m };
        var results = freqs.ToShortArray();
        results.Should().BeEquivalentTo(new[] { 0, 100, 200, 300, 400 });
    }
    
    [Fact]
    public void CanHandleBadInput()
    {
        var freqs = new decimal?[] { 1, 5000 };
        var action = () =>
        {
            freqs.ToShortArray();
        };
        action.Should().Throw<ArgumentOutOfRangeException>();
    }
    
    [Fact]
    public void FiftyCenteredFreqArrayReturnsBaseFrequencyOfFifty()
    {
        var freqs = new decimal?[] { 50, 50.1m, 50.2m, 50.3m, 50.4m };
        var result = freqs.GetBaseFrequency();
        result.Should().Be(50);
    }

    [Fact]
    public void ToUnixTimeSecondsWorks()
    {
        var dateTime = new DateTime(1970, 1, 1,0,0,0, DateTimeKind.Utc);
        long? result = dateTime.ToUnixTimeSeconds();
        result.Should().Be(0);
        
        var nullableDateTime = new DateTime?(new DateTime(1970, 1, 1,0,0,0, DateTimeKind.Utc));
        result = nullableDateTime.ToUnixTimeSeconds();
        result.Should().Be(0);

        nullableDateTime = default;
        result = nullableDateTime.ToUnixTimeSeconds();
        result.Should().BeNull();
    }
}