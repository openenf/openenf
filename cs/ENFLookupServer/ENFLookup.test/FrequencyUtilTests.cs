using FluentAssertions;

namespace ENFLookup.test;

public class FrequencyUtilTests
{
    [Fact]
    public void GetContiguousSequenceLengths_ReturnsLengthsOfNonNullSubsequencesForEachIndexOfSequence_Short()
    {
        var sequence = new List<short> {1, short.MaxValue, 1, 2, short.MaxValue, 1};
        var result = FrequencyUtils.GetContiguousSequenceLengths(sequence);

        result.Should().HaveCount(sequence.Count);
        result[0].Should().BeEquivalentTo((position: 0, length: 1));
        result[1].Should().BeEquivalentTo((position: 1, length: 0));
        result[2].Should().BeEquivalentTo((position: 2, length: 2));
        result[3].Should().BeEquivalentTo((position: 3, length: 1));
    }

    [Fact]
    public void GetContiguousSequenceLengths_ReturnsLengthsOfNonNullSubsequencesForEachIndexOfSequence()
    {
        var sequence = new List<short>
        {
            1, short.MaxValue, 1, 2, short.MaxValue, 1, 2, 3, 4, short.MaxValue, short.MaxValue, 1, 2, 3, short.MaxValue, short.MaxValue,
            1, 2, 3, 4, short.MaxValue, 1, 2, 3, 4, 5
        };
        var result = FrequencyUtils.GetContiguousSequenceLengths(sequence);

        result.Should().BeEquivalentTo(new List<(int position, int length)>
        {
            (position: 0, length: 1),
            (position: 1, length: 0),
            (position: 2, length: 2),
            (position: 3, length: 1),
            (position: 4, length: 0),
            (position: 5, length: 4),
            (position: 6, length: 3),
            (position: 7, length: 2),
            (position: 8, length: 1),
            (position: 9, length: 0),
            (position: 10, length: 0),
            (position: 11, length: 3),
            (position: 12, length: 2),
            (position: 13, length: 1),
            (position: 14, length: 0),
            (position: 15, length: 0),
            (position: 16, length: 4),
            (position: 17, length: 3),
            (position: 18, length: 2),
            (position: 19, length: 1),
            (position: 20, length: 0),
            (position: 21, length: 5),
            (position: 22, length: 4),
            (position: 23, length: 3),
            (position: 24, length: 2),
            (position: 25, length: 1)
        });
    }
    
    [Fact]
    public void GetMaxStdDevSequence_ReturnsTheSequenceWithTheSmallestStandardDeviation()
    {
        var subsequences = new Dictionary<int, int[]>
        {
            {5, new[] {1, 2, 3, 8}},
            {16, new[] {1, 2, 3, 4}},
            {21, new[] {1, 2, 3, 3}},
            {22, new[] {2, 3, 4, 5}}
        };
        var result = FrequencyUtils.GetMaxStdDevSequence(subsequences);

        result.position.Should().Be(5);
        result.sequence.Should().BeEquivalentTo(new[] {1, 2, 3, 8});
    }
    
    [Fact]
    public void FindLongestNonNullSubsequences_FindsTheLongestNonNullSubsequencesSmallerThan5()
    {
        var sequence = new List<short>
        {
            1, short.MaxValue, 1, 2, short.MaxValue, 1, 2, 3, 4, short.MaxValue, short.MaxValue, 1, 2, 3, short.MaxValue, short.MaxValue,
            1, 2, 3, 4, short.MaxValue, 1, 2, 3, 4, 5
        };
        var result = FrequencyUtils.FindLongestNonNullSubsequences(sequence, 4);

        result.Should().BeEquivalentTo(new Dictionary<int, int[]>
        {
            {5, new [] {1, 2, 3, 4}},
            {16, new [] {1, 2, 3, 4}},
            {21, new [] {1, 2, 3, 4}},
            {22, new [] {2, 3, 4, 5}}
        });
    }
}