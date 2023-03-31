using FluentAssertions;

namespace ENFLookup.test;

public class GridDateHelperTests
{
    [Fact]
    public void ReturnsGridStartDateOffsetIfNoRequestStartDate()
    {
        var gridStart = 1577836800; //=1st Jan 2020
        var result = GridDateHelper.CalculateStartTs(null, gridStart);
        result.Should().Be(0); //...because the value returned here is the number of seconds relative to the start of the grid;
    }

    [Fact]
    public void ReturnsGridStartOffsetIfRequestStartIsBefore()
    {
        var gridStart = 1577836800; //=1st Jan 2020
        var requestStart = new DateTime(1970, 1, 1);
        var result = GridDateHelper.CalculateStartTs(requestStart, gridStart);
        result.Should().Be(0); //...because the value returned here is the number of seconds relative to the start of the grid;
    }
    
    [Fact]
    public void ReturnsRequestDiffBetweenRequestAndGridStartIfRequestIsAfter()
    {
        var gridStart = 1577836800; //=1st Jan 2020
        var requestStart = new DateTime(2020, 1, 1, 0, 1, 0, DateTimeKind.Utc);
        var result = GridDateHelper.CalculateStartTs(requestStart, gridStart);
        result.Should().Be(60); //...because the value returned here is the number of seconds relative to the start of the grid;
    }
    
    [Fact]
    public void ReturnsGridEndDateOffsetIfNoRequestEndDate()
    {
        var gridStart = 1577836800; //=1st Jan 2020
        var gridEnd = 1577923200; //2nd Jan 2020
        var result = GridDateHelper.CalculateEndTs(null, gridStart, gridEnd);
        result.Should().Be(gridEnd - gridStart); //...because the value returned here is the number of seconds relative to the start of the grid;
    }
    
    [Fact]
    public void ReturnsGridEndDateOffsetIfRequestEndDateAfter()
    {
        var gridStart = 1577836800; //=1st Jan 2020
        var gridEnd = 1577923200; //2nd Jan 2020
        var requestEnd = new DateTime(2020, 1, 3);
        var result = GridDateHelper.CalculateEndTs(requestEnd, gridStart, gridEnd);
        result.Should().Be(gridEnd - gridStart); //...because the value returned here is the number of seconds relative to the start of the grid;
    }
    
    [Fact]
    public void ReturnsRequestEndDateOffsetIfRequestEndDateBefore()
    {
        var gridStart = 1577836800; //=1st Jan 2020
        var gridEnd = 1577923200; //2nd Jan 2020
        var requestEnd = new DateTime(2020, 1, 1, 0, 5, 0, DateTimeKind.Utc);
        var result = GridDateHelper.CalculateEndTs(requestEnd, gridStart, gridEnd);
        result.Should().Be(5 * 60); //...because the value returned here is the number of seconds relative to the start of the grid;
    }
}