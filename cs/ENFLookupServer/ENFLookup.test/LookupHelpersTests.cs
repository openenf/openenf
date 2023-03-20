using FluentAssertions;

namespace ENFLookup.test;

public class LookupHelpersTests
{
    [Fact]
    public void GetArrayThreadBoundsWorksForMultipleThreads()
    {
        const int arrayLength = 17;
        const int numThreads = 3;
        const int freqLength = 5;
        var result = LookupHelpers.GetArrayThreadBounds(arrayLength, numThreads, freqLength).ToArray();
        result.Length.Should().Be(numThreads);
        
        result[0].Start.Should().Be(0);
        result[0].End.Should().Be(4);

        result[1].Start.Should().Be(5);
        result[1].End.Should().Be(9);

        result[2].Start.Should().Be(10);
        result[2].End.Should().Be(17);
    }

    [Fact]
    public void GetArrayBoundsWorksForSingleThread()
    {
        const int arrayLength = 27;
        const int numThreads = 1;
        const int freqLength = 5;
        var result = LookupHelpers.GetArrayThreadBounds(arrayLength, numThreads, freqLength).ToArray();
        result.Length.Should().Be(numThreads);
        result[0].Start.Should().Be(0);
        result[0].End.Should().Be(27);
    }
}