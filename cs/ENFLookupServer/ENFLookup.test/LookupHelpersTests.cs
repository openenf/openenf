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
        var result = LookupHelpers.GetArrayThreadBounds(0,arrayLength, numThreads, freqLength).ToArray();
        result.Length.Should().Be(numThreads);
        
        result[0].Start.Should().Be(0);
        result[0].End.Should().Be(4);

        result[1].Start.Should().Be(5);
        result[1].End.Should().Be(9);

        result[2].Start.Should().Be(10);
        result[2].End.Should().Be(17);
    }
    
    [Fact]
    public void GetArrayThreadBoundsWorksForMultipleThreadsAndNonZeroStart()
    {
        const int startTime = 500;
        const int endTime = 517;
        const int numThreads = 3;
        const int freqLength = 5;
        var result = LookupHelpers.GetArrayThreadBounds(startTime, endTime, numThreads, freqLength).ToArray();
        result.Length.Should().Be(numThreads);
        
        result[0].Start.Should().Be(500);
        result[0].End.Should().Be(504);

        result[1].Start.Should().Be(505);
        result[1].End.Should().Be(509);

        result[2].Start.Should().Be(510);
        result[2].End.Should().Be(517);
    }

    [Fact]
    public void GetArrayBoundsWorksForSingleThread()
    {
        const int arrayLength = 27;
        const int numThreads = 1;
        const int freqLength = 5;
        var result = LookupHelpers.GetArrayThreadBounds(0,arrayLength, numThreads, freqLength).ToArray();
        result.Length.Should().Be(numThreads);
        result[0].Start.Should().Be(0);
        result[0].End.Should().Be(27);
    }
    
    [Fact]
    public void GetDataFolderReturnsCorrectValue()
    {
        var result = LookupHelpers.GetDataFolder();
        result.Should().EndWith("openenf");
        if (OperatingSystem.IsMacOS())
        {
            result.Should().EndWith("Library/Application Support/openenf");
        }
    }
}